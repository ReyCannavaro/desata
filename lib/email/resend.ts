const { Resend } = require("resend") as typeof import("resend");

if (!process.env.RESEND_API_KEY) {
  console.warn("[resend] RESEND_API_KEY belum diset — email tidak akan terkirim.");
}

export const resend = new Resend(process.env.RESEND_API_KEY ?? "");

export const EMAIL_FROM =
  process.env.RESEND_FROM_EMAIL ?? "DESATA <noreply@desata.id>";
