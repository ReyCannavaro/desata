"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  User, Tag, Wallet, Users,
  Plus, Pencil, Trash2, CheckCircle2,
  XCircle, RotateCcw, Save, X, Eye, EyeOff,
} from "lucide-react";
import {
  createUserAction,
  updateUserAction,
  deactivateUserAction,
  reactivateUserAction,
} from "@/actions/users";
import { setPaguAnggaranAction } from "@/actions/keuangan";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile, KategoriProgram } from "@/lib/supabase/types";

interface RealisasiItem {
  kategori_id: string;
  nama: string;
  warna: string;
  pagu: number;
  realisasi: number;
  persentase: number;
}

interface Props {
  profile: UserProfile & { desa: { nama: string } | null };
  users: Pick<UserProfile, "id" | "nama" | "role" | "is_active" | "created_at">[];
  kategoriList: KategoriProgram[];
  realisasiList: RealisasiItem[];
  desaId: string;
  tahun: number;
  isSuperAdmin: boolean;
}

type Tab = "profil" | "kategori" | "pagu" | "user";

function formatRupiah(n: number) {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(2)} M`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)} Jt`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export function PengaturanClient({
  profile, users, kategoriList, realisasiList, desaId, tahun, isSuperAdmin,
}: Props) {
  const [tab, setTab] = useState<Tab>("profil");

  const TABS: { key: Tab; label: string; icon: React.ReactNode; superOnly?: boolean }[] = [
    { key: "profil",   label: "Profil",   icon: <User size={15} /> },
    { key: "kategori", label: "Kategori", icon: <Tag size={15} /> },
    { key: "pagu",     label: "Pagu Anggaran", icon: <Wallet size={15} /> },
    { key: "user",     label: "Pengguna", icon: <Users size={15} />, superOnly: true },
  ];

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {TABS.filter((t) => !t.superOnly || isSuperAdmin).map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === key ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {tab === "profil"   && <TabProfil profile={profile} />}
      {tab === "kategori" && <TabKategori kategoriList={kategoriList} desaId={desaId} />}
      {tab === "pagu"     && <TabPagu kategoriList={kategoriList} realisasiList={realisasiList} tahun={tahun} />}
      {tab === "user" && isSuperAdmin && <TabUser users={users} desaId={desaId} myId={profile.id} />}
    </div>
  );
}

function TabProfil({ profile }: { profile: UserProfile & { desa: { nama: string } | null } }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-md space-y-4">
      <h2 className="text-sm font-semibold text-slate-800">Profil Akun</h2>
      {[
        { label: "Nama",  value: profile.nama },
        { label: "Role",  value: profile.role.replace(/_/g, " ") },
        { label: "Desa",  value: profile.desa?.nama ?? "—" },
        { label: "Status", value: profile.is_active ? "Aktif" : "Nonaktif" },
      ].map(({ label, value }) => (
        <div key={label}>
          <p className="text-xs text-slate-400 mb-0.5">{label}</p>
          <p className="text-sm font-medium text-slate-700 capitalize">{value}</p>
        </div>
      ))}
      <div className="pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-400">
          Untuk mengubah email atau reset password, gunakan menu{" "}
          <span className="font-medium text-slate-600">Lupa Password</span> di halaman login.
        </p>
      </div>
    </div>
  );
}

function TabKategori({
  kategoriList: initialList,
  desaId,
}: {
  kategoriList: KategoriProgram[];
  desaId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [list, setList] = useState(initialList);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ nama: "", deskripsi: "", warna: "#3B82F6" });
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  function openAdd() {
    setEditId(null);
    setFormData({ nama: "", deskripsi: "", warna: "#3B82F6" });
    setError(null);
    setShowForm(true);
  }

  function openEdit(k: KategoriProgram) {
    setEditId(k.id);
    setFormData({ nama: k.nama, deskripsi: k.deskripsi ?? "", warna: k.warna ?? "#3B82F6" });
    setError(null);
    setShowForm(true);
  }

  async function handleSave() {
    if (!formData.nama.trim()) { setError("Nama kategori wajib diisi."); return; }
    setError(null);

    startTransition(async () => {
      if (editId) {
        const { error: e } = await supabase
          .from("kategori_program")
          .update({ nama: formData.nama, deskripsi: formData.deskripsi || null, warna: formData.warna })
          .eq("id", editId);
        if (e) { setError("Gagal memperbarui: " + e.message); return; }
      } else {
        const { error: e } = await supabase
          .from("kategori_program")
          .insert({ desa_id: desaId, nama: formData.nama, deskripsi: formData.deskripsi || null, warna: formData.warna });
        if (e) { setError("Gagal menyimpan: " + e.message); return; }
      }
      setShowForm(false);
      router.refresh();
    });
  }

  async function handleDelete(id: string, nama: string) {
    if (!confirm(`Hapus kategori "${nama}"? Semua transaksi dengan kategori ini akan kehilangan referensi.`)) return;
    startTransition(async () => {
      const { error: e } = await supabase.from("kategori_program").delete().eq("id", id);
      if (e) { alert("Gagal hapus: " + e.message); return; }
      setList((prev) => prev.filter((k) => k.id !== id));
      router.refresh();
    });
  }

  const WARNA_PRESETS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#6B7280"];

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{list.length} kategori program</p>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white transition"
          style={{ background: "#1E40AF" }}
        >
          <Plus size={14} /> Tambah Kategori
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-blue-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">
              {editId ? "Edit Kategori" : "Tambah Kategori Baru"}
            </h3>
            <button onClick={() => setShowForm(false)}><X size={16} className="text-slate-400" /></button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-slate-500 mb-1">Nama Kategori *</label>
              <input
                value={formData.nama}
                onChange={(e) => setFormData((p) => ({ ...p, nama: e.target.value }))}
                placeholder="Contoh: Infrastruktur"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-500 mb-1">Deskripsi (opsional)</label>
              <input
                value={formData.deskripsi}
                onChange={(e) => setFormData((p) => ({ ...p, deskripsi: e.target.value }))}
                placeholder="Keterangan singkat kategori..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Warna (untuk chart)</label>
              <div className="flex items-center gap-2 flex-wrap">
                {WARNA_PRESETS.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, warna: w }))}
                    className={`w-6 h-6 rounded-full transition ${formData.warna === w ? "ring-2 ring-offset-1 ring-slate-400 scale-110" : ""}`}
                    style={{ background: w }}
                  />
                ))}
                <input
                  type="color"
                  value={formData.warna}
                  onChange={(e) => setFormData((p) => ({ ...p, warna: e.target.value }))}
                  className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                  title="Pilih warna custom"
                />
              </div>
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-60 transition"
              style={{ background: "#1E40AF" }}
            >
              <Save size={14} />
              {isPending ? "Menyimpan..." : "Simpan"}
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl text-sm text-slate-500 border border-slate-200 hover:bg-slate-50 transition">
              Batal
            </button>
          </div>
        </div>
      )}

      {/* List kategori */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {list.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            Belum ada kategori. Tambahkan kategori terlebih dahulu sebelum input transaksi.
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {list.map((k) => (
              <div key={k.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: k.warna ?? "#94A3B8" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{k.nama}</p>
                  {k.deskripsi && <p className="text-xs text-slate-400 truncate">{k.deskripsi}</p>}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(k)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(k.id, k.nama)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TabPagu({
  kategoriList,
  realisasiList,
  tahun,
}: {
  kategoriList: KategoriProgram[];
  realisasiList: RealisasiItem[];
  tahun: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editKategori, setEditKategori] = useState<string | null>(null);
  const [inputNominal, setInputNominal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const merged = kategoriList.map((k) => {
    const r = realisasiList.find((r) => r.kategori_id === k.id);
    return {
      id: k.id,
      nama: k.nama,
      warna: k.warna ?? "#94A3B8",
      pagu: r?.pagu ?? 0,
      realisasi: r?.realisasi ?? 0,
      persentase: r?.persentase ?? 0,
    };
  });

  const totalPagu = merged.reduce((s, r) => s + r.pagu, 0);
  const totalRealisasi = merged.reduce((s, r) => s + r.realisasi, 0);

  function openEdit(kategoriId: string, paguSaatIni: number) {
    setEditKategori(kategoriId);
    setInputNominal(paguSaatIni > 0 ? String(paguSaatIni) : "");
    setError(null);
    setSuccess(null);
  }

  async function handleSave(kategoriId: string) {
    const nominal = parseFloat(inputNominal);
    if (!nominal || nominal <= 0) { setError("Nominal harus lebih dari 0."); return; }
    setError(null);

    startTransition(async () => {
      const result = await setPaguAnggaranAction({ kategori_id: kategoriId, tahun, nominal });
      if (result.success) {
        setEditKategori(null);
        setSuccess("Pagu berhasil disimpan.");
        router.refresh();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error ?? "Gagal menyimpan.");
      }
    });
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <p className="text-xs text-slate-500">Total Pagu {tahun}</p>
          <p className="text-xl font-bold text-slate-800 mt-1">{formatRupiah(totalPagu)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <p className="text-xs text-slate-500">Total Realisasi {tahun}</p>
          <p className="text-xl font-bold text-slate-800 mt-1">{formatRupiah(totalRealisasi)}</p>
          {totalPagu > 0 && (
            <p className="text-xs text-slate-400 mt-0.5">
              {Math.round((totalRealisasi / totalPagu) * 100)}% dari total pagu
            </p>
          )}
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
          <CheckCircle2 size={14} /> {success}
        </div>
      )}

      {merged.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-sm text-slate-400">
          Belum ada kategori. Tambahkan kategori di tab Kategori terlebih dahulu.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-50">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pagu per Kategori — {tahun}
            </p>
          </div>
          <div className="divide-y divide-slate-50">
            {merged.map((r) => (
              <div key={r.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: r.warna }} />
                    <span className="text-sm font-medium text-slate-800">{r.nama}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {editKategori === r.id ? (
                      <>
                        <input
                          type="number"
                          value={inputNominal}
                          onChange={(e) => setInputNominal(e.target.value)}
                          placeholder="Nominal pagu..."
                          min={1}
                          className="w-40 px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSave(r.id)}
                          disabled={isPending}
                          className="p-1.5 rounded-lg text-white disabled:opacity-60"
                          style={{ background: "#1E40AF" }}
                        >
                          <Save size={14} />
                        </button>
                        <button onClick={() => setEditKategori(null)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50">
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-sm font-medium text-slate-700">
                          {r.pagu > 0 ? formatRupiah(r.pagu) : <span className="text-slate-400 italic">Belum diset</span>}
                        </span>
                        <button onClick={() => openEdit(r.id, r.pagu)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition">
                          <Pencil size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {r.pagu > 0 && (
                  <div className="space-y-1">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${r.persentase}%`,
                          background: r.persentase >= 90 ? "#EF4444" : r.persentase >= 75 ? "#F59E0B" : "#10B981",
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Realisasi: {formatRupiah(r.realisasi)}</span>
                      <span>{r.persentase}%</span>
                    </div>
                  </div>
                )}

                {error && editKategori === r.id && (
                  <p className="text-xs text-red-500 mt-1">{error}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TabUser({
  users: initialUsers,
  desaId,
  myId,
}: {
  users: Pick<UserProfile, "id" | "nama" | "role" | "is_active" | "created_at">[];
  desaId: string;
  myId: string;
}) {
  void desaId;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", nama: "", role: "admin_desa" as "admin_desa" | "bpd" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function openForm() {
    setFormData({ email: "", password: "", nama: "", role: "admin_desa" });
    setError(null);
    setShowForm(true);
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createUserAction(formData);
      if (result.success) {
        setShowForm(false);
        setSuccess("Pengguna baru berhasil dibuat.");
        router.refresh();
        setTimeout(() => setSuccess(null), 4000);
      } else {
        setError(result.error ?? "Gagal membuat pengguna.");
      }
    });
  }

  async function handleToggleActive(userId: string, isActive: boolean) {
    const aksi = isActive ? "menonaktifkan" : "mengaktifkan";
    if (!confirm(`Yakin ingin ${aksi} pengguna ini?`)) return;
    startTransition(async () => {
      const result = isActive
        ? await deactivateUserAction(userId)
        : await reactivateUserAction(userId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error ?? "Gagal mengubah status.");
      }
    });
  }

  async function handleUpdateRole(userId: string, role: "admin_desa" | "bpd" | "super_admin") {
    startTransition(async () => {
      const result = await updateUserAction(userId, { role });
      if (result.success) router.refresh();
      else alert(result.error ?? "Gagal mengubah role.");
    });
  }

  const ROLE_LABEL: Record<string, string> = {
    super_admin: "Super Admin",
    admin_desa: "Admin Desa",
    bpd: "BPD",
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{initialUsers.length} pengguna terdaftar</p>
        <button
          onClick={openForm}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white transition"
          style={{ background: "#1E40AF" }}
        >
          <Plus size={14} /> Tambah Pengguna
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
          <CheckCircle2 size={14} /> {success}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl border border-blue-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800">Tambah Pengguna Baru</h3>
            <button onClick={() => setShowForm(false)}><X size={16} className="text-slate-400" /></button>
          </div>
          <form onSubmit={handleCreateUser} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-slate-500 mb-1">Nama Lengkap *</label>
                <input
                  value={formData.nama}
                  onChange={(e) => setFormData((p) => ({ ...p, nama: e.target.value }))}
                  required minLength={2} maxLength={100}
                  placeholder="Nama perangkat desa..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  required
                  placeholder="email@desa.id"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value as "admin_desa" | "bpd" }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin_desa">Admin Desa</option>
                  <option value="bpd">BPD</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-slate-500 mb-1">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                    required minLength={8}
                    placeholder="Min 8 karakter, ada huruf besar & angka"
                    className="w-full px-3 py-2 pr-10 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button type="button" onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                <XCircle size={14} /> {error}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={isPending}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-60 transition"
                style={{ background: "#1E40AF" }}>
                <Plus size={14} />
                {isPending ? "Membuat..." : "Buat Pengguna"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2.5 rounded-xl text-sm text-slate-500 border border-slate-200 hover:bg-slate-50 transition">
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-50">
          {initialUsers.map((u) => (
            <div key={u.id} className={`flex items-center gap-4 px-5 py-4 ${!u.is_active ? "opacity-60" : ""}`}>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-semibold"
                style={{ background: "#1E40AF" }}
              >
                {u.nama.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-800 truncate">{u.nama}</p>
                  {u.id === myId && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">Kamu</span>
                  )}
                  {!u.is_active && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">Nonaktif</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 capitalize">{ROLE_LABEL[u.role] ?? u.role}</p>
              </div>

              {u.id !== myId && u.role !== "super_admin" && (
                <select
                  defaultValue={u.role}
                  disabled={isPending}
                  onChange={(e) => handleUpdateRole(u.id, e.target.value as "admin_desa" | "bpd" | "super_admin")}
                  className="text-xs px-2 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="admin_desa">Admin Desa</option>
                  <option value="bpd">BPD</option>
                </select>
              )}

              {u.id !== myId && (
                <button
                  onClick={() => handleToggleActive(u.id, u.is_active)}
                  disabled={isPending}
                  className={`p-1.5 rounded-lg transition disabled:opacity-50 ${
                    u.is_active
                      ? "text-slate-400 hover:text-red-500 hover:bg-red-50"
                      : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                  }`}
                  title={u.is_active ? "Nonaktifkan" : "Aktifkan kembali"}
                >
                  {u.is_active ? <XCircle size={16} /> : <RotateCcw size={16} />}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}