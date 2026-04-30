<div align="center">
  <img src="public/logo-nav.svg" alt="DESATA Logo" height="60" />
  <br /><br />
  <p><strong>Desa Kita, Data Kita, Masa Depan Kita</strong></p>
  <p>Platform transparansi keuangan dan aspirasi masyarakat desa berbasis web modern</p>

  <br />

  ![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
  ![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss)
  ![License](https://img.shields.io/badge/Lisensi-MIT-yellow?style=flat-square)

</div>

---

## 📋 Daftar Isi

- [Tentang DESATA](#-tentang-desata)
- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Prasyarat](#-prasyarat)
- [Instalasi Lokal](#-instalasi-lokal)
- [Setup Supabase](#-setup-supabase)
- [Environment Variables](#-environment-variables)
- [Struktur Folder](#-struktur-folder)
- [Alur Autentikasi](#-alur-autentikasi)
- [API & Server Actions](#-api--server-actions)
- [Role & Hak Akses](#-role--hak-akses)
- [Deployment](#-deployment)
- [Kontribusi](#-kontribusi)

---

## 🏡 Tentang DESATA

**DESATA** (Desa yang Tertata) adalah platform digital yang dirancang untuk mewujudkan tata kelola desa yang **transparan**, **akuntabel**, dan **partisipatif**. Dibangun sebagai proyek kompetisi **I/O Festival 2026** oleh tim dari SMK Telkom Sidoarjo.

Platform ini menjembatani dua kebutuhan utama:

1. **Transparansi Keuangan** — Warga dapat memantau seluruh pemasukan dan pengeluaran APBDes secara real-time tanpa perlu login.
2. **Aspirasi Warga** — Warga dapat menyampaikan laporan masalah, aspirasi, atau pengaduan dan memantau statusnya menggunakan nomor tiket.

---

## ✨ Fitur Utama

### Untuk Warga (Publik — tanpa login)
| Fitur | URL | Deskripsi |
|-------|-----|-----------|
| Beranda Desa | `/beranda` | Profil desa, visi misi, statistik, pengumuman |
| Transparansi Keuangan | `/transparansi` | Riwayat transaksi APBDes, grafik bulanan, distribusi per kategori |
| Laporan Warga | `/laporan-warga` | Daftar laporan publik, filter status, upvote laporan |
| Kirim Laporan | `/lapor` | Form pengaduan dengan upload foto (maks 3 foto) |
| Cek Status | `/cek-laporan` | Lacak laporan menggunakan nomor tiket |

### Untuk Perangkat Desa (Dashboard — perlu login)
| Fitur | URL | Deskripsi |
|-------|-----|-----------|
| Dashboard | `/dashboard` | Ringkasan keuangan, laporan terbaru, statistik cepat |
| Portal Desa | `/portal` | Manajemen profil desa, akses cepat, pengumuman |
| Keuangan | `/keuangan` | CRUD transaksi APBDes, filter, warning pagu anggaran |
| Manajemen Laporan | `/laporan` | Kelola laporan warga, update status, detail laporan |
| Statistik | `/statistik` | Grafik arus kas bulanan, distribusi pengeluaran, laporan per kategori |
| Dokumen | `/dokumen` | Manajemen dokumen desa |
| Pengaturan | `/pengaturan` | Profil akun, manajemen kategori program, pagu anggaran, manajemen user |

---

## 🛠 Tech Stack

| Layer | Teknologi | Versi |
|-------|-----------|-------|
| **Framework** | Next.js (App Router) | 16.2.4 |
| **Bahasa** | TypeScript | ^5 |
| **Database & Auth** | Supabase (PostgreSQL) | ^2.104 |
| **Styling** | Tailwind CSS v4 | ^4 |
| **Validasi** | Zod | ^3.24 |
| **Form** | React Hook Form + @hookform/resolvers | ^7.54 |
| **Charts** | Recharts | ^2.15 |
| **Email** | Resend | ^4.8 |
| **State** | Zustand | ^5 |
| **Tanggal** | date-fns | ^4.1 |
| **Icons** | Lucide React | ^0.383 |

---

## 🏗 Arsitektur Sistem

```
┌─────────────────────────────────────────────────────┐
│                    Browser / Client                  │
└──────────────┬──────────────────────────────────────┘
               │ HTTPS
┌──────────────▼──────────────────────────────────────┐
│              Next.js 16 (App Router)                 │
│                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │  (publik)   │  │ (dashboard)  │  │   (auth)   │  │
│  │  /beranda   │  │  /dashboard  │  │   /login   │  │
│  │ /transparansi│  │  /keuangan   │  │  /reset-   │  │
│  │  /lapor     │  │  /laporan    │  │  password  │  │
│  │  /cek-lapor │  │  /statistik  │  │            │  │
│  └─────────────┘  └──────────────┘  └────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │           Server Actions (actions/)           │   │
│  │  auth.ts | keuangan.ts | laporan.ts |         │   │
│  │  users.ts | storage.ts | desa.ts              │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │            middleware.ts (Edge)               │   │
│  │  Auth guard • Route protection • desa-id      │   │
│  └──────────────────────────────────────────────┘   │
└──────────────┬──────────────────────────────────────┘
               │ Supabase Client (SSR-safe)
┌──────────────▼──────────────────────────────────────┐
│                    Supabase                          │
│                                                      │
│  ┌────────────┐  ┌──────────┐  ┌─────────────────┐  │
│  │ PostgreSQL │  │   Auth   │  │    Storage      │  │
│  │  8 Tables  │  │  Email   │  │  laporan-foto   │  │
│  │  RLS + RPC │  │  JWT     │  │ transaksi-dok.. │  │
│  └────────────┘  └──────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## 📦 Prasyarat

Pastikan sudah terinstall di komputer kamu:

| Tools | Versi Minimum | Cara Cek |
|-------|---------------|----------|
| **Node.js** | ≥ 18.17 | `node --version` |
| **npm** | ≥ 9 | `npm --version` |
| **Git** | any | `git --version` |

Dan akun berikut (gratis):
- [Supabase](https://supabase.com) — database & auth
- [Resend](https://resend.com) *(opsional)* — email notifikasi

---

## 🚀 Instalasi Lokal

### Langkah 1 — Clone Repository

```bash
git clone https://github.com/username/desata.git
cd desata
```

### Langkah 2 — Install Dependencies

```bash
npm install
```

> ⏱ Proses ini membutuhkan waktu 1–3 menit tergantung koneksi internet.

### Langkah 3 — Setup Environment Variables

Buat file `.env.local` di root project:

```bash
cp .env.local.example .env.local
```

Lalu isi nilainya (lihat bagian [Environment Variables](#-environment-variables) di bawah).

### Langkah 4 — Setup Supabase

Lihat bagian [Setup Supabase](#-setup-supabase) untuk langkah lengkap.

### Langkah 5 — Jalankan Development Server

```bash
npm run dev
```

Buka browser dan akses: **http://localhost:3000**

Kamu akan diarahkan ke `/beranda` (halaman publik).

---

## 🗄 Setup Supabase

### 1. Buat Project Supabase

1. Buka [supabase.com](https://supabase.com) → **New Project**
2. Isi:
   - **Name**: `desata`
   - **Database Password**: buat password yang kuat (simpan baik-baik!)
   - **Region**: `Southeast Asia (Singapore)` — paling dekat Indonesia
3. Klik **Create new project** dan tunggu ±2 menit

### 2. Jalankan SQL Schema

Buka **SQL Editor** di Supabase Dashboard, lalu jalankan file-file berikut **secara berurutan**:

#### File 1 — Schema Utama
```
supabase/migrations/001_initial_schema.sql
```
Membuat semua tabel, enum, index, trigger, dan RLS policies.

#### File 2 — Functions & RLS Tambahan
```
supabase/migrations/003_functions_and_rls.sql
```
Membuat fungsi `generate_nomor_tiket`, `check_pagu_warning`, dan policies untuk Storage.

#### File 3 — Seed Data (Opsional tapi direkomendasikan)
```
supabase/migrations/002_seed_data.sql
```
Mengisi data demo: 2 desa, kategori program, transaksi, dan laporan contoh.

> ⚠️ **Penting**: Jalankan file SQL satu per satu, bukan sekaligus. Tunggu hingga setiap file selesai sebelum menjalankan file berikutnya.

### 3. Setup Storage Buckets

Masih di SQL Editor, jalankan:

```sql
-- Buat bucket untuk foto laporan warga
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'laporan-foto', 'laporan-foto', TRUE, 5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Buat bucket untuk dokumen/bukti transaksi
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'transaksi-dokumen', 'transaksi-dokumen', TRUE, 5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;
```

### 4. Ambil API Keys

Buka **Project Settings → API**:

| Key | Lokasi | Untuk |
|-----|--------|-------|
| `Project URL` | "Project URL" | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon public` | "Project API keys" | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` | "Project API keys" | `SUPABASE_SERVICE_ROLE_KEY` |

> 🔐 **`service_role` key bersifat rahasia** — jangan pernah expose ke browser/client side.

### 5. Ambil ID Desa

Setelah seed data dijalankan, ambil UUID desa kamu:

```sql
SELECT id, nama FROM desa;
```

Salin nilai kolom `id` dan isi ke `NEXT_PUBLIC_DESA_ID` di `.env.local`.

### 6. Buat User Pertama (Admin)

1. Buka **Authentication → Users → Invite user**
2. Masukkan email admin desa
3. Setelah user terdaftar, update role-nya di SQL Editor:

```sql
UPDATE user_profiles
SET role = 'super_admin', desa_id = 'UUID_DESA_KAMU_DI_SINI'
WHERE id = 'UUID_USER_DARI_AUTH';
```

### 7. Konfigurasi Email Auth (Opsional)

Buka **Authentication → URL Configuration**:
- **Site URL**: `http://localhost:3000` (dev) atau domain production kamu
- **Redirect URLs**: tambahkan `http://localhost:3000/**`

---

## 🔐 Environment Variables

Buat file `.env.local` di root project dengan isi berikut:

```dotenv
# ================================================
# SUPABASE — Database & Auth
# Ambil dari: Supabase Dashboard → Project Settings → API
# ================================================

# URL project Supabase kamu
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co

# Anon key — aman untuk client side
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service role key — RAHASIA, hanya untuk server side
# Jangan pernah expose ke browser!
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ================================================
# APP CONFIG
# ================================================

# URL aplikasi kamu (http://localhost:3000 untuk development)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# UUID desa dari tabel public.desa di Supabase
# Cara ambil: SQL Editor → SELECT id, nama FROM desa;
NEXT_PUBLIC_DESA_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# ================================================
# RESEND — Email Notifikasi (Opsional)
# Ambil API key dari: https://resend.com/api-keys
# Jika tidak diisi, fitur notifikasi email tidak aktif
# ================================================

RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@desata.id
```

### Penjelasan Setiap Variable

| Variable | Wajib | Deskripsi |
|----------|-------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Ya | URL project Supabase, dimulai dengan `https://`. Prefix `NEXT_PUBLIC_` artinya aman diakses dari browser. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Ya | JWT token untuk akses public (anon) ke Supabase. Dikontrol oleh RLS policies. |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Ya | JWT token dengan hak akses penuh, **bypass RLS**. Hanya digunakan di server. **JANGAN expose ke client.** |
| `NEXT_PUBLIC_APP_URL` | ✅ Ya | Base URL aplikasi. Digunakan untuk redirect URL setelah reset password. |
| `NEXT_PUBLIC_DESA_ID` | ✅ Ya | UUID desa default yang ditampilkan di halaman publik. Middleware menggunakan ini untuk inject `x-desa-id` header ke setiap request publik. |
| `RESEND_API_KEY` | ❌ Opsional | API key Resend untuk kirim email notifikasi ketika laporan baru masuk. |
| `RESEND_FROM_EMAIL` | ❌ Opsional | Alamat email pengirim notifikasi. Harus diverifikasi di Resend dashboard. |

> 💡 **Tips**: Untuk development, kamu bisa menggunakan data dari project DESATA demo di atas (data sudah ada, tinggal ubah `NEXT_PUBLIC_DESA_ID` sesuai UUID desa kamu).

---

## 📁 Struktur Folder

```
desata/
│
├── 📁 actions/                 # Server Actions (logika backend)
│   ├── auth.ts                 # Login, logout, reset password, get current user
│   ├── desa.ts                 # Fetch data desa, statistik, pengumuman, beranda
│   ├── keuangan.ts             # CRUD transaksi, pagu anggaran, realisasi
│   ├── laporan.ts              # CRUD laporan warga, update status, upvote
│   ├── storage.ts              # Upload foto laporan & dokumen ke Supabase Storage
│   └── users.ts                # Manajemen user (create, update, deactivate)
│
├── 📁 app/                     # Next.js App Router
│   ├── (auth)/                 # Route group: halaman autentikasi
│   │   ├── login/page.tsx      # Halaman login (split layout)
│   │   ├── reset-password/     # Form lupa password
│   │   └── update-password/    # Form update password baru
│   │
│   ├── (dashboard)/            # Route group: dashboard admin (protected)
│   │   ├── layout.tsx          # Layout dengan sidebar + topbar
│   │   ├── dashboard/          # Ringkasan utama
│   │   ├── portal/             # Portal desa (profil, visi-misi, pengumuman)
│   │   ├── keuangan/           # Manajemen transaksi APBDes
│   │   ├── laporan/            # Kelola laporan warga
│   │   │   └── [id]/           # Detail laporan + update status
│   │   ├── statistik/          # Grafik & visualisasi data
│   │   ├── dokumen/            # Manajemen dokumen desa
│   │   └── pengaturan/         # Pengaturan akun, kategori, pagu, user
│   │
│   ├── (publik)/               # Route group: halaman publik (tanpa login)
│   │   ├── layout.tsx          # Layout navbar publik
│   │   ├── beranda/            # Halaman beranda desa
│   │   ├── transparansi/       # Dashboard keuangan publik
│   │   ├── laporan-warga/      # Daftar laporan publik
│   │   ├── lapor/              # Form kirim laporan + daftar laporan
│   │   └── cek-laporan/        # Cek status laporan by nomor tiket
│   │
│   ├── layout.tsx              # Root layout (metadata, font)
│   └── page.tsx                # Root redirect → /beranda
│
├── 📁 components/              # Komponen React
│   ├── cek-laporan/            # CekLaporanClient (search + timeline)
│   ├── dashboard/              # DashboardRealtime
│   ├── dokumen/                # DokumenClient
│   ├── forms/                  # LoginForm, LaporForm, ResetForm, dll
│   ├── keuangan/               # KeuanganClient (tabel + form transaksi)
│   ├── laporan/                # Laporan dashboard admin, detail admin
│   ├── laporan-publik/         # UpvoteButton, LaporanRealtime
│   ├── layout/                 # SidebarNav, TopBar
│   ├── pengaturan/             # PengaturanClient (tabs)
│   └── statistik/              # StatistikClient (recharts)
│
├── 📁 hooks/                   # Custom React hooks
│   ├── use-auth.ts             # Hook auth state (user, profile, loading)
│   └── use-realtime.ts         # Hook Supabase Realtime subscription
│
├── 📁 lib/                     # Utilities & konfigurasi
│   ├── email/                  # Template email & Resend config
│   ├── supabase/
│   │   ├── client.ts           # Supabase browser client
│   │   ├── server.ts           # Supabase server client + admin client
│   │   └── types.ts            # TypeScript types dari schema database
│   └── get-desa-id.ts          # Helper ambil desa_id dari header/env
│
├── 📁 store/                   # Global state (Zustand)
│   └── ui-store.ts             # UI state (sidebar, modal, dll)
│
├── 📁 public/                  # Static assets
│   ├── logo.svg                # Logo DESATA (icon saja)
│   └── logo-nav.svg            # Logo DESATA dengan teks (untuk navbar)
│
├── 📁 supabase/                # Konfigurasi Supabase CLI
│   └── migrations/             # File SQL migration
│
├── middleware.ts               # Auth guard, route protection, desa-id inject
├── next.config.ts              # Konfigurasi Next.js
├── package.json                # Dependencies
└── tsconfig.json               # Konfigurasi TypeScript
```

---

## 🔒 Alur Autentikasi

```
User buka /dashboard
        │
        ▼
   middleware.ts
        │
   Cek auth.getUser()
        │
   ┌────┴────┐
  Belum    Sudah
  login    login
   │         │
   ▼         ▼
/login   Lanjut ke halaman
   │
   ▼
LoginForm → loginAction()
        │
   Supabase signInWithPassword()
        │
   ┌────┴────┐
  Gagal    Berhasil
   │         │
   ▼         ▼
Error    revalidatePath()
message  redirect ke /dashboard
         atau redirectTo param
```

**Session management** menggunakan `@supabase/ssr` yang menyimpan session di cookie HTTP-only, aman dari XSS.

---

## 📡 API & Server Actions

Semua operasi data menggunakan **Next.js Server Actions** (bukan REST API terpisah). Setiap action divalidasi dengan Zod sebelum menyentuh database.

### Contoh: Membuat Laporan Warga

```typescript
import { createLaporanAction } from "@/actions/laporan";

const result = await createLaporanAction({
  desa_id: "uuid-desa",
  judul: "Jalan Rusak di RT 05",
  kategori: "INF",
  deskripsi: "Jalan berlubang cukup besar...",
  is_anonim: false,
  nama_pelapor: "Budi Santoso",
  foto_urls: ["https://...supabase.co/storage/..."],
});

if (result.success) {
  console.log("Tiket:", result.nomorTiket); // DES-20260428-0001
}
```

### Daftar Server Actions

| File | Functions |
|------|-----------|
| `auth.ts` | `loginAction`, `logoutAction`, `resetPasswordAction`, `updatePasswordAction`, `getCurrentUser` |
| `keuangan.ts` | `createTransaksiAction`, `updateTransaksiAction`, `deleteTransaksiAction`, `getKeuanganPublik`, `setPaguAnggaranAction`, `getRealisasiAnggaran` |
| `laporan.ts` | `createLaporanAction`, `updateStatusLaporanAction`, `upvoteLaporanAction`, `getLaporanByTiket`, `getLaporanPublik`, `getLaporanAdmin`, `getLaporanDetailAdmin` |
| `storage.ts` | `uploadFotoLaporan`, `uploadDokumenTransaksi` |
| `users.ts` | `getUsersAction`, `createUserAction`, `updateUserAction`, `deactivateUserAction`, `reactivateUserAction` |
| `desa.ts` | `getBerandaData`, `getDesa` |

---

## 👥 Role & Hak Akses

| Role | Akses | Keterangan |
|------|-------|------------|
| **Publik** | `/beranda`, `/transparansi`, `/laporan-warga`, `/lapor`, `/cek-laporan` | Tanpa login, siapapun bisa akses |
| **`admin_desa`** | Semua dashboard kecuali manajemen user | Perangkat desa yang mengelola data |
| **`bpd`** | Dashboard read-only, lihat laporan | Badan Permusyawaratan Desa |
| **`super_admin`** | Semua akses termasuk manajemen user | Administrator sistem |

### Row Level Security (RLS)

Setiap tabel dilindungi RLS di level database:

```
laporan_warga:
  SELECT → publik (tanpa login)
  INSERT → publik (siapapun bisa lapor)
  UPDATE → admin_desa / super_admin (desa yang sama)

transaksi:
  SELECT → publik
  INSERT/UPDATE/DELETE → admin_desa / super_admin (desa yang sama)

user_profiles:
  SELECT → user itu sendiri atau admin
  UPDATE → user itu sendiri
  ALL    → super_admin
```

---

## 🚢 Deployment

### Deploy ke Vercel (Direkomendasikan)

1. Push code ke GitHub
2. Buka [vercel.com](https://vercel.com) → **Import Project**
3. Pilih repository DESATA
4. Di bagian **Environment Variables**, tambahkan semua variable dari `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL        = https://lgrndziebrlcsybuidfq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY   = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxncm5kemllYnJsY3N5YnVpZGZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxODU1NTEsImV4cCI6MjA5Mjc2MTU1MX0.dy1Mb2XyPFn2l2glgSHiLYCN_sRVv5Cbyje9TtP1FE8
SUPABASE_SERVICE_ROLE_KEY       = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxncm5kemllYnJsY3N5YnVpZGZxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzE4NTU1MSwiZXhwIjoyMDkyNzYxNTUxfQ.xE_BzEBrOcA_Focvw1xRnVd2Yi2IB0eCDmSjHAwF5vc
NEXT_PUBLIC_APP_URL             = https://desata.vercel.app
NEXT_PUBLIC_DESA_ID             = 352f0635-59a4-41ab-9e7a-1f6a586f41c8
```

5. Klik **Deploy**

> 💡 Setelah deploy, update **Site URL** di Supabase Auth ke URL Vercel kamu.

### Build Manual

```bash
# Build production
npm run build

# Jalankan production server
npm start
```

---

## 🤝 Kontribusi

Project ini dibuat untuk kompetisi I/O Festival 2026.

**Tim DESATA — SMK Telkom Sidoarjo**

---

## 📄 Lisensi

Didistribusikan di bawah lisensi **MIT**. Lihat `LICENSE` untuk informasi lebih lanjut.

---

<div align="center">
  <img src="public/logo.svg" alt="DESATA" height="40" />
  <br />
  <sub>Dibuat dengan ❤️ untuk Indonesia yang lebih transparan</sub>
  <br /><br />
  <sub><b>DESATA</b> — Desa Kita, Data Kita, Masa Depan Kita</sub>
</div>
