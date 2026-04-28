"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { ActionResult } from "./auth";

const CreateUserSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[A-Z]/, "Harus mengandung minimal 1 huruf besar")
    .regex(/[0-9]/, "Harus mengandung minimal 1 angka"),
  nama: z.string().min(2, "Nama minimal 2 karakter").max(100),
  role: z.enum(["admin_desa", "bpd"]),
});

const UpdateUserSchema = z.object({
  nama: z.string().min(2).max(100).optional(),
  role: z.enum(["admin_desa", "bpd", "super_admin"]).optional(),
  is_active: z.boolean().optional(),
});

async function requireSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi", supabase: null, callerProfile: null };

  const { data: callerProfile } = await supabase
    .from("user_profiles")
    .select("role, desa_id")
    .eq("id", user.id)
    .single();

  if (!callerProfile || callerProfile.role !== "super_admin") {
    return { error: "Hanya super admin yang dapat melakukan aksi ini", supabase: null, callerProfile: null };
  }

  return { error: null, supabase, callerProfile };
}

export async function getUsersAction(desaId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_profiles")
    .select("id, nama, role, is_active, created_at")
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

  const { error: authError, supabase, callerProfile } = await requireSuperAdmin();
  if (authError || !supabase || !callerProfile) {
    return { success: false, error: authError ?? "Akses ditolak" };
  }

  const { data: existingProfile } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("desa_id", callerProfile.desa_id)
    .limit(1)
    .maybeSingle();

  const adminClient = await createAdminClient();
  const { data: authData, error: createAuthError } =
    await adminClient.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true,
    });

  if (createAuthError || !authData.user) {
    if (createAuthError?.message?.includes("already been registered")) {
      return { success: false, error: "Email sudah terdaftar di sistem." };
    }
    console.error("createUser auth error:", createAuthError);
    return { success: false, error: "Gagal membuat akun. Coba lagi." };
  }

  const newUserId = authData.user.id;
  const { data: newProfile, error: profileError } = await supabase
    .from("user_profiles")
    .insert({
      id: newUserId,
      desa_id: callerProfile.desa_id,
      nama: parsed.data.nama,
      role: parsed.data.role,
      is_active: true,
    })
    .select("id")
    .single();

  if (profileError) {
    await adminClient.auth.admin.deleteUser(newUserId);
    console.error("createUser profile error:", profileError);
    return { success: false, error: "Gagal menyimpan profil pengguna. " + profileError.message };
  }

  void existingProfile;

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

  const { error: authError, supabase, callerProfile } = await requireSuperAdmin();
  if (authError || !supabase || !callerProfile) {
    return { success: false, error: authError ?? "Akses ditolak" };
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
  const { error: authError, supabase, callerProfile } = await requireSuperAdmin();
  if (authError || !supabase || !callerProfile) {
    return { success: false, error: authError ?? "Akses ditolak" };
  }

  const {
    data: { user: me },
  } = await supabase.auth.getUser();
  if (me && userId === me.id) {
    return { success: false, error: "Tidak dapat menonaktifkan akun sendiri." };
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

export async function reactivateUserAction(userId: string): Promise<ActionResult> {
  const { error: authError, supabase, callerProfile } = await requireSuperAdmin();
  if (authError || !supabase || !callerProfile) {
    return { success: false, error: authError ?? "Akses ditolak" };
  }

  const { error } = await supabase
    .from("user_profiles")
    .update({ is_active: true })
    .eq("id", userId)
    .eq("desa_id", callerProfile.desa_id);

  if (error) return { success: false, error: "Gagal mengaktifkan pengguna." };

  revalidatePath("/pengaturan");
  return { success: true };
}