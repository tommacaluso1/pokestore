import { db, ReportReason } from "@repo/db";

export async function fileReport(
  reporterId: string,
  reportedId: string,
  reason: ReportReason,
  offerId?: string,
  description?: string,
) {
  if (reporterId === reportedId) throw new Error("Cannot report yourself.");

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
