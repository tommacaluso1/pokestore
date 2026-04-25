// Single seam for outbound email. Today: logs to the server console
// (free, simple). Tomorrow: drop in Resend / Postmark / SES by replacing
// just this file. Callers stay identical.

type EmailMessage = {
  to:      string;
  subject: string;
  text:    string;
  html?:   string;
};

export async function sendEmail(msg: EmailMessage): Promise<void> {
  // eslint-disable-next-line no-console
  console.log("\n[email:stub]", JSON.stringify({
    to:      msg.to,
    subject: msg.subject,
    text:    msg.text,
  }, null, 2), "\n");
}

// Shape a verification email. Returns { subject, text, html }.
export function buildVerificationEmail(args: {
  recipientName: string;
  verifyUrl:     string;
}) {
  const { recipientName, verifyUrl } = args;
  return {
    subject: "Verify your PokéStore account",
    text: [
      `Hey ${recipientName},`,
      "",
      "Welcome to PokéStore — the séance is open. Tap the link below to verify your email and unlock listing + trading:",
      "",
      verifyUrl,
      "",
      "This link expires in 24 hours.",
      "If you didn't sign up, you can ignore this message.",
      "",
      "— PokéStore",
    ].join("\n"),
    html: `<!doctype html>
<html><body style="font-family:system-ui,sans-serif;max-width:520px;margin:24px auto;color:#0d0a14">
  <p>Hey ${recipientName},</p>
  <p>Welcome to <strong>PokéStore</strong> — the séance is open. Tap the button below to verify your email and unlock listing + trading:</p>
  <p style="margin:24px 0">
    <a href="${verifyUrl}" style="background:#7c3aed;color:#fff;padding:12px 20px;text-decoration:none;border-radius:8px;display:inline-block">
      Verify my email
    </a>
  </p>
  <p style="color:#6b6480;font-size:13px">Or paste this link: <br><a href="${verifyUrl}">${verifyUrl}</a></p>
  <p style="color:#6b6480;font-size:13px">This link expires in 24 hours. If you didn't sign up, you can ignore this message.</p>
  <p>— PokéStore</p>
</body></html>`,
  };
}
