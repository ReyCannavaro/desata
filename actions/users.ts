"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { ActionResult } from "./auth";

const CreateUserSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  nama: z.string().min(2, "Nama minimal 2 karakter").max(100),
  role: z.enum(["admin_desa", "bpd"]),
});

const UpdateUserSchema = z.object({
  nama: z.string().min(2).max(100).optional(),
  role: z.enum(["admin_desa", "bpd", "super_admin"]).optional(),
  is_active: z.boolean().optional(),
});

export async function getUsersAction(desaId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("desa_id", desaId)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Gagal mengambil daftar pengguna");
  return data ?? [];
}

export async function createUserAction(
  input: z.infer<typeof CreateUserSchema>
): Promise<ActionResult & { userId?: string }> {
  const parsed = CreateUserSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Validasi gagal" };
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Tidak terautentikasi" };

  const { data: callerProfile } = await supabase
    .from("user_profiles")
    .select("role, desa_id")
    .eq("id", user.id)
    .single();

  if (!callerProfile || callerProfile.role !== "super_admin") {
    return { success: false, error: "Hanya super admin yang dapat membuat pengguna baru" };
  }

  const { data: newProfile, error: profileError } = await supabase
    .from("user_profiles")
    .insert({
      id: crypto.randomUUID(),
      desa_id: callerProfile.desa_id,
      nama: parsed.data.nama,
      role: parsed.data.role,
      is_active: true,
    })
    .select("id")
    .single();

  if (profileError) {
    return { success: false, error: "Gagal membuat pengguna. " + profileError.message };
  }

  revalidatePath("/pengaturan");
  return { success: true, userId: newProfile.id };
}

export async function updateUserAction(
  userId: string,
  input: z.infer<typeof UpdateUserSchema>
): Promise<ActionResult> {
  const parsed = UpdateUserSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Validasi gagal" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Tidak terautentikasi" };

  const { data: callerProfile } = await supabase
    .from("user_profiles")
    .select("role, desa_id")
    .eq("id", user.id)
    .single();

  if (!callerProfile || callerProfile.role !== "super_admin") {
    return { success: false, error: "Akses ditolak" };
  }

  const { error } = await supabase
    .from("user_profiles")
    .update(parsed.data)
    .eq("id", userId)
    .eq("desa_id", callerProfile.desa_id);

  if (error) return { success: false, error: "Gagal memperbarui pengguna." };

  revalidatePath("/pengaturan");
  return { success: true };
}

export async function deactivateUserAction(userId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Tidak terautentikasi" };

  if (userId === user.id) {
    return { success: false, error: "Tidak dapat menonaktifkan akun sendiri." };
  }

  const { data: callerProfile } = await supabase
    .from("user_profiles")
    .select("role, desa_id")
    .eq("id", user.id)
    .single();

  if (!callerProfile || callerProfile.role !== "super_admin") {
    return { success: false, error: "Akses ditolak" };
  }

  const { error } = await supabase
    .from("user_profiles")
    .update({ is_active: false })
    .eq("id", userId)
    .eq("desa_id", callerProfile.desa_id);

  if (error) return { success: false, error: "Gagal menonaktifkan pengguna." };

  revalidatePath("/pengaturan");
  return { success: true };
}