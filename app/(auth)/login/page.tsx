import type { Metadata } from "next";
import { LoginForm } from "@/components/forms/login-form";

export const metadata: Metadata = { title: "Login — DESATA" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}>

      <div className="relative z-10 w-full md:w-[440px] lg:w-[480px] flex-shrink-0 flex flex-col bg-white shadow-2xl">

        <div className="px-10 pt-10 pb-0">
          <img src="/logo-nav.svg" alt="DESATA" className="h-8" />
        </div>

        <div className="flex-1 flex flex-col justify-center px-10 py-10">

          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight mb-1.5" style={{ color: "#0F172A" }}>
              Selamat datang kembali
            </h1>
            <p className="text-sm" style={{ color: "#64748B" }}>
              Masuk ke dashboard pengelolaan desa Anda
            </p>
          </div>

          {params.message === "password-updated" && (
            <div
              className="mb-5 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
              style={{ background: "#EFF6FF", color: "#1E40AF", border: "1px solid #BFDBFE" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M13 4L6.5 10.5L3 7" stroke="#1E40AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Password berhasil diperbarui. Silakan login.
            </div>
          )}

          <LoginForm redirectTo={params.redirect} />

          <p className="mt-8 text-center text-xs" style={{ color: "#94A3B8" }}>
            Belum punya akun?{" "}
            <span style={{ color: "#64748B" }}>Hubungi Super Admin desa Anda.</span>
          </p>
        </div>

        <div className="px-10 pb-8">
          <p className="text-xs" style={{ color: "#CBD5E1" }}>
            © {new Date().getFullYear()} DESATA — Hak cipta dilindungi
          </p>
        </div>
      </div>

      <div
        className="hidden md:flex flex-1 relative overflow-hidden items-center justify-center"
        style={{ background: "#0F172A" }}
      >
        <div
          className="absolute"
          style={{
            width: "700px",
            height: "700px",
            borderRadius: "50%",
            background: "radial-gradient(ellipse, #1E40AF 0%, #1E3A8A 40%, transparent 70%)",
            top: "-200px",
            right: "-150px",
            opacity: 0.7,
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute"
          style={{
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(ellipse, #3B82F6 0%, #1D4ED8 50%, transparent 70%)",
            bottom: "-200px",
            left: "-100px",
            opacity: 0.5,
            filter: "blur(50px)",
          }}
        />
        <div
          className="absolute"
          style={{
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(ellipse, #DBEAFE 0%, #93C5FD 30%, transparent 70%)",
            top: "40%",
            left: "35%",
            opacity: 0.12,
            filter: "blur(30px)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
            opacity: 0.4,
          }}
        />

        <div className="relative z-10 text-center px-12 max-w-lg">
          <div
            className="absolute"
            style={{
              top: "-60px",
              left: "-40px",
              width: "120px",
              height: "120px",
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.15) 1.5px, transparent 1.5px)",
              backgroundSize: "16px 16px",
            }}
          />

          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs font-semibold tracking-widest uppercase"
            style={{
              background: "rgba(59,130,246,0.15)",
              color: "#93C5FD",
              border: "1px solid rgba(59,130,246,0.3)",
            }}
          >
            Platform Transparansi Desa
          </div>

          <h2
            className="text-4xl lg:text-5xl font-bold leading-tight mb-5"
            style={{ color: "#F8FAFC", letterSpacing: "-0.02em" }}
          >
            Desa Kita,
            <br />
            <span style={{ color: "#60A5FA" }}>Data Kita.</span>
          </h2>

          <p className="text-base leading-relaxed mb-10" style={{ color: "#94A3B8" }}>
            Kelola transparansi keuangan dan aspirasi masyarakat desa
            dalam satu platform yang modern dan terpercaya.
          </p>

          <div className="space-y-3">
            {[
              { icon: "", label: "Transparansi keuangan desa real-time" },
              { icon: "", label: "Kelola laporan aspirasi warga" },
              { icon: "", label: "Statistik & visualisasi data APBDes" },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-left"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <span className="text-lg flex-shrink-0">{icon}</span>
                <span className="text-sm" style={{ color: "#CBD5E1" }}>{label}</span>
              </div>
            ))}
          </div>

          <div
            className="absolute"
            style={{
              bottom: "-50px",
              right: "-30px",
              width: "100px",
              height: "100px",
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.12) 1.5px, transparent 1.5px)",
              backgroundSize: "14px 14px",
            }}
          />
        </div>
      </div>

    </div>
  );
}