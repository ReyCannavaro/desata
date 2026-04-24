export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      desa: {
        Row: {
          id: string;
          nama: string;
          kecamatan: string;
          kabupaten: string;
          provinsi: string;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["desa"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["desa"]["Insert"]>;
      };
      transaksi: {
        Row: {
          id: string;
          desa_id: string;
          jenis: "pemasukan" | "pengeluaran";
          kategori_id: string;
          nominal: number;
          deskripsi: string;
          tanggal: string;
          bukti_url: string | null;
          input_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["transaksi"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["transaksi"]["Insert"]>;
      };
      kategori_program: {
        Row: {
          id: string;
          desa_id: string;
          nama: string;
          deskripsi: string | null;
          warna: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["kategori_program"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["kategori_program"]["Insert"]>;
      };
      pagu_anggaran: {
        Row: {
          id: string;
          desa_id: string;
          kategori_id: string;
          tahun: number;
          nominal: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["pagu_anggaran"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["pagu_anggaran"]["Insert"]>;
      };
      laporan_warga: {
        Row: {
          id: string;
          desa_id: string;
          nomor_tiket: string;
          judul: string;
          kategori: "INF" | "KES" | "PDD" | "LNG" | "PLY" | "KAM" | "LNY";
          deskripsi: string;
          foto_urls: string[];
          lokasi_lat: number | null;
          lokasi_lng: number | null;
          nama_pelapor: string | null;
          email_pelapor: string | null;
          wa_pelapor: string | null;
          is_anonim: boolean;
          status: "DITERIMA" | "DIVERIFIKASI" | "DALAM_PROSES" | "DITOLAK" | "SELESAI";
          upvote_count: number;
          is_prioritas_tinggi: boolean;
          petugas_id: string | null;
          ip_address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["laporan_warga"]["Row"], "id" | "nomor_tiket" | "upvote_count" | "is_prioritas_tinggi" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["laporan_warga"]["Insert"]>;
      };
      laporan_status_log: {
        Row: {
          id: string;
          laporan_id: string;
          status_lama: string | null;
          status_baru: string;
          catatan: string | null;
          changed_by: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["laporan_status_log"]["Row"], "id" | "created_at">;
        Update: never;
      };
      upvotes: {
        Row: {
          id: string;
          laporan_id: string;
          fingerprint: string;
          ip_address: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["upvotes"]["Row"], "id" | "created_at">;
        Update: never;
      };
      audit_log: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          table_name: string;
          record_id: string | null;
          old_data: Json | null;
          new_data: Json | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["audit_log"]["Row"], "id" | "created_at">;
        Update: never;
      };
      user_profiles: {
        Row: {
          id: string;
          desa_id: string;
          nama: string;
          role: "super_admin" | "admin_desa" | "bpd";
          is_active: boolean;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["user_profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["user_profiles"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      generate_nomor_tiket: {
        Args: { desa_id_param: string };
        Returns: string;
      };
      calculate_realisasi: {
        Args: { kategori_id_param: string; tahun_param: number };
        Returns: number;
      };
      check_pagu_warning: {
        Args: { kategori_id_param: string; nominal_param: number; tahun_param: number };
        Returns: { is_warning: boolean; percentage: number; sisa_pagu: number };
      };
    };
    Enums: {
      jenis_transaksi: "pemasukan" | "pengeluaran";
      kategori_laporan: "INF" | "KES" | "PDD" | "LNG" | "PLY" | "KAM" | "LNY";
      status_laporan: "DITERIMA" | "DIVERIFIKASI" | "DALAM_PROSES" | "DITOLAK" | "SELESAI";
      user_role: "super_admin" | "admin_desa" | "bpd";
    };
  };
};

// Helper types untuk kemudahan penggunaan
export type Desa = Database["public"]["Tables"]["desa"]["Row"];
export type Transaksi = Database["public"]["Tables"]["transaksi"]["Row"];
export type KategoriProgram = Database["public"]["Tables"]["kategori_program"]["Row"];
export type PaguAnggaran = Database["public"]["Tables"]["pagu_anggaran"]["Row"];
export type LaporanWarga = Database["public"]["Tables"]["laporan_warga"]["Row"];
export type LaporanStatusLog = Database["public"]["Tables"]["laporan_status_log"]["Row"];
export type Upvote = Database["public"]["Tables"]["upvotes"]["Row"];
export type AuditLog = Database["public"]["Tables"]["audit_log"]["Row"];
export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];

export type StatusLaporan = Database["public"]["Enums"]["status_laporan"];
export type KategoriLaporan = Database["public"]["Enums"]["kategori_laporan"];
export type UserRole = Database["public"]["Enums"]["user_role"];