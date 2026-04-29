import type { KategoriLaporan } from "@/lib/supabase/types";

const KATEGORI_LABEL: Record<KategoriLaporan, string> = {
  INF: "Infrastruktur",
  KES: "Kesehatan",
  PDD: "Pendidikan",
  LNG: "Lingkungan",
  PLY: "Pelayanan",
  KAM: "Keamanan",
  LNY: "Lainnya",
};

export interface LaporanEmailData {
  nomorTiket: string;
  judul: string;
  kategori: KategoriLaporan;
  deskripsi: string;
  namaPelapor: string | null;
  isAnonim: boolean;
  desaNama: string;
  appUrl: string;
}

export function templateLaporanMasuk(data: LaporanEmailData): string {
  const pelapor = data.isAnonim ? "Anonim" : (data.namaPelapor ?? "Tidak disebutkan");
  const kategoriLabel = KATEGORI_LABEL[data.kategori] ?? data.kategori;
  const laporanUrl = `${data.appUrl}/laporan`;
  const tanggal = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Laporan Baru Masuk — ${data.desaNama}</title>
</head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#1E3A8A;border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#93C5FD;letter-spacing:2px;text-transform:uppercase;font-weight:600;">
                DESATA · ${data.desaNama}
              </p>
              <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#FFFFFF;">
                📋 Laporan Baru Masuk
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#FFFFFF;padding:32px;">

              <p style="margin:0 0 20px;font-size:14px;color:#475569;">
                ${tanggal} — Ada laporan baru yang perlu ditindaklanjuti.
              </p>

              <!-- Nomor tiket -->
              <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:10px;padding:14px 18px;margin-bottom:20px;">
                <p style="margin:0;font-size:11px;color:#3B82F6;font-weight:600;text-transform:uppercase;letter-spacing:1px;">
                  Nomor Tiket
                </p>
                <p style="margin:6px 0 0;font-size:20px;font-weight:700;color:#1E40AF;font-family:monospace;">
                  ${data.nomorTiket}
                </p>
              </div>

              <!-- Detail laporan -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #F1F5F9;width:40%;">
                    <p style="margin:0;font-size:12px;color:#94A3B8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Judul</p>
                  </td>
                  <td style="padding:8px 0;border-bottom:1px solid #F1F5F9;">
                    <p style="margin:0;font-size:14px;color:#1E293B;font-weight:600;">${data.judul}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #F1F5F9;">
                    <p style="margin:0;font-size:12px;color:#94A3B8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Kategori</p>
                  </td>
                  <td style="padding:8px 0;border-bottom:1px solid #F1F5F9;">
                    <span style="display:inline-block;background:#DBEAFE;color:#1D4ED8;font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;">
                      ${kategoriLabel}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #F1F5F9;">
                    <p style="margin:0;font-size:12px;color:#94A3B8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Pelapor</p>
                  </td>
                  <td style="padding:8px 0;border-bottom:1px solid #F1F5F9;">
                    <p style="margin:0;font-size:14px;color:#1E293B;">${pelapor}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;">
                    <p style="margin:0;font-size:12px;color:#94A3B8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Deskripsi</p>
                  </td>
                  <td style="padding:8px 0;">
                    <p style="margin:0;font-size:14px;color:#334155;line-height:1.6;">${data.deskripsi}</p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <div style="text-align:center;margin:28px 0 8px;">
                <a
                  href="${laporanUrl}"
                  style="display:inline-block;background:#1E40AF;color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;padding:13px 32px;border-radius:10px;"
                >
                  Lihat & Tindaklanjuti Laporan →
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F8FAFC;border-radius:0 0 16px 16px;padding:18px 32px;text-align:center;border-top:1px solid #E2E8F0;">
              <p style="margin:0;font-size:11px;color:#94A3B8;">
                Email ini dikirim otomatis oleh sistem DESATA · ${data.desaNama}<br/>
                Jangan balas email ini langsung.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
