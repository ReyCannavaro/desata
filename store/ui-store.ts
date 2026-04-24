import { create } from "zustand";

type UIStore = {
  // Sidebar admin
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  activeModal: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;

  filterTahun: number;
  filterBulan: number | null;
  filterKategori: string | null;
  setFilterTahun: (tahun: number) => void;
  setFilterBulan: (bulan: number | null) => void;
  setFilterKategori: (kategori: string | null) => void;
};

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  activeModal: null,
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),

  filterTahun: new Date().getFullYear(),
  filterBulan: null,
  filterKategori: null,
  setFilterTahun: (tahun) => set({ filterTahun: tahun }),
  setFilterBulan: (bulan) => set({ filterBulan: bulan }),
  setFilterKategori: (kategori) => set({ filterKategori: kategori }),
}));