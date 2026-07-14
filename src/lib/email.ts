import { env } from "@/lib/env";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

/**
 * Pluggable email delivery, mirroring the AI provider pattern in
 * src/server/ai (see docs/architecture.md section 6 / env comments):
 * console-log in development so no external account is needed to run the
 * app locally, and Resend's plain HTTP API in production (no SDK
 * dependency required, keeps the surface area small).
 */
export async function sendEmail(input: SendEmailInput): Promise<void> {
  if (!env.RESEND_API_KEY) {
    console.warn(
      `[email:dev-stub] to=${input.to} subject="${input.subject}"\n${input.html}`,
    );
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM ?? "OpsPilot AI <noreply@opspilot.ai>",
      to: input.to,
      subject: input.subject,
      html: input.html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to send email (${response.status}): ${body}`);
  }
}

export function passwordResetEmailHtml(resetUrl: string): string {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2>Reset your OpsPilot AI password</h2>
      <p>Click the link below to choose a new password. This link expires in 1 hour.</p>
      <p><a href="${resetUrl}" style="color:#5B8DEF">${resetUrl}</a></p>
      <p style="color:#8B909C;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;
}

export function verificationEmailHtml(verifyUrl: string): string {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2>Verify your email</h2>
      <p>Confirm your email address to finish setting up your OpsPilot AI account.</p>
      <p><a href="${verifyUrl}" style="color:#5B8DEF">${verifyUrl}</a></p>
      <p style="color:#8B909C;font-size:13px">This link expires in 24 hours.</p>
    </div>
  `;
}
