const { Resend } = require("resend") as typeof import("resend");

export const EMAIL_FROM =
  process.env.RESEND_FROM_EMAIL ?? "DESATA <noreply@desata.id>";

let _resend: InstanceType<typeof Resend> | null = null;

export function getResend(): InstanceType<typeof Resend> {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("[resend] RESEND_API_KEY belum diset di .env.local");
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}
