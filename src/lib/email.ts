type InquiryEmailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

/**
 * Abstract mailer — wire SMTP (SMTP_URL), Resend, or SendGrid here.
 * Dev default: logs payload to console.
 */
export async function sendMail(payload: InquiryEmailPayload) {
  if (process.env.SMTP_URL || process.env.RESEND_API_KEY) {
    console.info("[email] provider not configured in MVP — would send:", {
      to: payload.to,
      subject: payload.subject,
    });
    return { ok: true as const, mode: "placeholder" as const };
  }
  console.info("[email:dev]", payload.subject, "→", payload.to);
  return { ok: true as const, mode: "console" as const };
}

export async function notifyOwnerOfInquiry(params: {
  ownerEmail: string;
  listingTitle: string;
  renterName: string;
  renterEmail: string;
  messagePreview: string;
}) {
  return sendMail({
    to: params.ownerEmail,
    subject: `New inquiry: ${params.listingTitle}`,
    text: `From ${params.renterName} <${params.renterEmail}>\n\n${params.messagePreview}`,
  });
}
