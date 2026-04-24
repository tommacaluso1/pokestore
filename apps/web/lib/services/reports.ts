import { db, ReportReason } from "@repo/db";

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_REPORTS_PER_REPORTER_PER_DAY = 3;

export async function fileReport(
  reporterId: string,
  reportedId: string,
  reason: ReportReason,
  offerId?: string,
  description?: string,
) {
  if (reporterId === reportedId) throw new Error("Cannot report yourself.");

  const since = new Date(Date.now() - DAY_MS);

  // Rate-limit: cap total reports per reporter and prevent re-targeting the same
  // user within 24h. Protects against mass-report DoS that inflates riskScore.
  const [totalRecent, targetedRecent] = await Promise.all([
    db.report.count({ where: { reporterId, createdAt: { gte: since } } }),
    db.report.count({ where: { reporterId, reportedId, createdAt: { gte: since } } }),
  ]);

  if (totalRecent >= MAX_REPORTS_PER_REPORTER_PER_DAY) {
    throw new Error("You've filed the maximum number of reports for today. Please try again tomorrow.");
  }
  if (targetedRecent >= 1) {
    throw new Error("You've already reported this user recently. Please wait 24 hours before reporting again.");
  }

  const report = await db.report.create({
    data: {
      reporterId,
      reportedId,
      reason,
      offerId:     offerId     || undefined,
      description: description || undefined,
    },
  });

  // Each report increments risk score
  await db.user.update({ where: { id: reportedId }, data: { riskScore: { increment: 5 } } });

  return report;
}
