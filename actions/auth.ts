"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  redirectTo: z.string().nullable().optional(),
});

const ResetPasswordSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});

const UpdatePasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[A-Z]/, "Harus mengandung huruf besar")
    .regex(/[0-9]/, "Harus mengandung angka"),
});

export type ActionResult = {
  success: boolean;
  error?: string;
};

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
    redirectTo: formData.get("redirectTo"),
  };

  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Validasi gagal",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return {
        success: false,
        error: "Email atau password salah. Periksa kembali.",
      };
    }
    if (error.message.includes("Email not confirmed")) {
      return {
        success: false,
        error: "Email belum dikonfirmasi. Cek inbox Anda.",
      };
    }
    return {
      success: false,
      error: "Terjadi kesalahan. Coba lagi dalam beberapa saat.",
    };
  }

  revalidatePath("/", "layout");
  redirect(parsed.data.redirectTo ?? "/dashboard");
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function resetPasswordAction(
  formData: FormData
): Promise<ActionResult> {
  const raw = { email: formData.get("email") };
  const parsed = ResetPasswordSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Validasi gagal",
    };
  }

  const supabase = await createClient();

  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/update-password`,
  });

  return { success: true };
}

export async function updatePasswordAction(
  formData: FormData
): Promise<ActionResult> {
  const raw = { password: formData.get("password") };
  const parsed = UpdatePasswordSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Validasi gagal",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { success: false, error: "Gagal memperbarui password. Coba lagi." };
  }

  revalidatePath("/", "layout");
  redirect("/login?message=password-updated");
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*, desa(*)")
    .eq("id", user.id)
    .single();

  return { user, profile };
}