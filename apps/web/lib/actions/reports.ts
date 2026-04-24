"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { fileReport } from "@/lib/services/reports";
import { FileReportSchema, safeParse } from "@/lib/validation/schemas";

export type ReportState = { error?: string; success?: boolean };

export async function fileReportAction(
  reportedId: string,
  _prev: ReportState,
  formData: FormData,
): Promise<ReportState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = safeParse(FileReportSchema, {
    reason:      formData.get("reason")?.toString(),
    description: formData.get("description")?.toString().trim() || undefined,
    offerId:     formData.get("offerId")?.toString() || undefined,
  });
  if (!parsed.ok) return { error: parsed.error };

  try {
    await fileReport(
      session.user.id,
      reportedId,
      parsed.data.reason,
      parsed.data.offerId,
      parsed.data.description,
    );
  } catch (e) {
    return { error: e instanceof Error && e.message.length < 200 ? e.message : "Something went wrong." };
  }

  return { success: true };
}
