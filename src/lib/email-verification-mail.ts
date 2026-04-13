import { sendMail } from "@/lib/email";
import { getMailgunEnv } from "@/lib/mailgun/config";
import { publicOriginForServer } from "@/lib/seo";

function noreplyReplyTo(): string {
  const domain = getMailgunEnv()?.domain ?? process.env.MAILGUN_DOMAIN?.trim() ?? "mail.luxpads.co";
  return `noreply@${domain}`;
}

export async function sendEmailVerificationMessage(params: {
  to: string;
  rawToken: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const verifyUrl = `${publicOriginForServer()}/api/verify-email?token=${encodeURIComponent(params.rawToken)}`;
  const res = await sendMail({
    to: params.to,
    subject: "Confirm your email for LuxPads",
    replyTo: noreplyReplyTo(),
    text: [
      "Thanks for joining LuxPads.",
      "",
      "Confirm your email address to message homeowners and use your account fully:",
      verifyUrl,
      "",
      "This link expires in 48 hours. If you did not create an account, you can ignore this email.",
    ].join("\n"),
    html: `<p>Thanks for joining LuxPads.</p>
<p><a href="${verifyUrl}">Confirm your email address</a> to message homeowners and use your account fully.</p>
<p style="color:#666;font-size:14px">This link expires in 48 hours. If you did not create an account, you can ignore this email.</p>`,
  });
  if (!res.ok) return { ok: false, error: "send_failed" };
  return { ok: true };
}
