export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type JenisTransaksi = "pemasukan" | "pengeluaran";
export type KategoriLaporan = "INF" | "KES" | "PDD" | "LNG" | "PLY" | "KAM" | "LNY";
export type StatusLaporan = "DITERIMA" | "DIVERIFIKASI" | "DALAM_PROSES" | "DITOLAK" | "SELESAI";
export type UserRole = "super_admin" | "admin_desa" | "bpd";
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
        Insert: {
          id?: string;
          nama: string;
          kecamatan: string;
          kabupaten: string;
          provinsi?: string;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nama?: string;
          kecamatan?: string;
          kabupaten?: string;
          provinsi?: string;
          logo_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_profiles: {
        Row: {
          id: string;
          desa_id: string;
          nama: string;
          role: UserRole;
          is_active: boolean;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          desa_id: string;
          nama: string;
          role?: UserRole;
          is_active?: boolean;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          desa_id?: string;
          nama?: string;
          role?: UserRole;
          is_active?: boolean;
          avatar_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
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
        Insert: {
          id?: string;
          desa_id: string;
          nama: string;
          deskripsi?: string | null;
          warna?: string | null;
          created_at?: string;
        };
        Update: {
          desa_id?: string;
          nama?: string;
          deskripsi?: string | null;
          warna?: string | null;
        };
        Relationships: [];
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
        Insert: {
          id?: string;
          desa_id: string;
          kategori_id: string;
          tahun: number;
          nominal: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          desa_id?: string;
          kategori_id?: string;
          tahun?: number;
          nominal?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      transaksi: {
        Row: {
          id: string;
          desa_id: string;
          jenis: JenisTransaksi;
          kategori_id: string;
          nominal: number;
          deskripsi: string;
          tanggal: string;
          bukti_url: string | null;
          input_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          desa_id: string;
          jenis: JenisTransaksi;
          kategori_id: string;
          nominal: number;
          deskripsi: string;
          tanggal: string;
          bukti_url?: string | null;
          input_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          jenis?: JenisTransaksi;
          kategori_id?: string;
          nominal?: number;
          deskripsi?: string;
          tanggal?: string;
          bukti_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      laporan_warga: {
        Row: {
          id: string;
          desa_id: string;
          nomor_tiket: string;
          judul: string;
          kategori: KategoriLaporan;
          deskripsi: string;
          foto_urls: string[];
          lokasi_lat: number | null;
          lokasi_lng: number | null;
          nama_pelapor: string | null;
          email_pelapor: string | null;
          wa_pelapor: string | null;
          is_anonim: boolean;
          status: StatusLaporan;
          upvote_count: number;
          is_prioritas_tinggi: boolean;
          petugas_id: string | null;
          ip_address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          desa_id: string;
          nomor_tiket: string;
          judul: string;
          kategori: KategoriLaporan;
          deskripsi: string;
          foto_urls?: string[];
          lokasi_lat?: number | null;
          lokasi_lng?: number | null;
          nama_pelapor?: string | null;
          email_pelapor?: string | null;
          wa_pelapor?: string | null;
          is_anonim?: boolean;
          status?: StatusLaporan;
          upvote_count?: number;
          is_prioritas_tinggi?: boolean;
          petugas_id?: string | null;
          ip_address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          judul?: string;
          kategori?: KategoriLaporan;
          deskripsi?: string;
          foto_urls?: string[];
          lokasi_lat?: number | null;
          lokasi_lng?: number | null;
          status?: StatusLaporan;
          upvote_count?: number;
          is_prioritas_tinggi?: boolean;
          petugas_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      laporan_status_log: {
        Row: {
          id: string;
          laporan_id: string;
          status_lama: StatusLaporan | null;
          status_baru: StatusLaporan;
          catatan: string | null;
          changed_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          laporan_id: string;
          status_lama?: StatusLaporan | null;
          status_baru: StatusLaporan;
          catatan?: string | null;
          changed_by: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      upvotes: {
        Row: {
          id: string;
          laporan_id: string;
          fingerprint: string;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          laporan_id: string;
          fingerprint: string;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
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
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          table_name: string;
          record_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
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
        Returns: { total_pengeluaran: number; pagu: number; persentase: number }[];
      };
      check_pagu_warning: {
        Args: { kategori_id_param: string; nominal_param: number; tahun_param: number };
        Returns: { is_warning: boolean; percentage: number; sisa_pagu: number }[];
      };
      get_user_desa_id: { Args: Record<string, never>; Returns: string };
      get_user_role: { Args: Record<string, never>; Returns: string };
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      jenis_transaksi: JenisTransaksi;
      kategori_laporan: KategoriLaporan;
      status_laporan: StatusLaporan;
      user_role: UserRole;
    };
    CompositeTypes: Record<string, never>;
  };
};

// ─── Convenience Row Types ────────────────────────────────────────────────────

export type Desa = Database["public"]["Tables"]["desa"]["Row"];
export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];
export type KategoriProgram = Database["public"]["Tables"]["kategori_program"]["Row"];
export type PaguAnggaran = Database["public"]["Tables"]["pagu_anggaran"]["Row"];
export type Transaksi = Database["public"]["Tables"]["transaksi"]["Row"];
export type LaporanWarga = Database["public"]["Tables"]["laporan_warga"]["Row"];
export type LaporanStatusLog = Database["public"]["Tables"]["laporan_status_log"]["Row"];
export type Upvote = Database["public"]["Tables"]["upvotes"]["Row"];
export type AuditLog = Database["public"]["Tables"]["audit_log"]["Row"];

export type TransaksiInsert = Database["public"]["Tables"]["transaksi"]["Insert"];
export type LaporanWargaInsert = Database["public"]["Tables"]["laporan_warga"]["Insert"];
export type LaporanStatusLogInsert = Database["public"]["Tables"]["laporan_status_log"]["Insert"];
export type UpvoteInsert = Database["public"]["Tables"]["upvotes"]["Insert"];