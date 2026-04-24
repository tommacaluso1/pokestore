"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { fileReport } from "@/lib/services/reports";
import { ReportReason } from "@repo/db";

const VALID_REASONS: ReportReason[] = [
  "FAKE_LISTING", "ITEM_NOT_RECEIVED", "WRONG_ITEM_SENT",
  "HARASSMENT", "SCAM", "OTHER",
];

export type ReportState = { error?: string; success?: boolean };

export async function fileReportAction(
  reportedId: string,
  _prev: ReportState,
  formData: FormData,
): Promise<ReportState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const reason      = formData.get("reason")?.toString() as ReportReason;
  const description = formData.get("description")?.toString().trim() || undefined;
  const offerId     = formData.get("offerId")?.toString() || undefined;

  if (!VALID_REASONS.includes(reason)) {
    return { error: "Select a valid reason." };
  }

  try {
    await fileReport(session.user.id, reportedId, reason, offerId, description);
  } catch (e: any) {
    return { error: e.message };
  }

  return { success: true };
}
