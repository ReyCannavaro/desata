import { headers } from "next/headers";

export async function getPublikDesaId(): Promise<string> {
  const headerStore = await headers();
  const fromHeader = headerStore.get("x-desa-id");
  if (fromHeader && isValidUUID(fromHeader)) {
    return fromHeader;
  }

  const fromEnv = process.env.NEXT_PUBLIC_DESA_ID;
  if (fromEnv && isValidUUID(fromEnv)) {
    return fromEnv;
  }

  throw new Error(
    "[DESATA] desa_id tidak dikonfigurasi. " +
      "Set NEXT_PUBLIC_DESA_ID di .env.local atau pastikan middleware set header x-desa-id."
  );
}

export async function getPublikDesaIdSafe(): Promise<string | null> {
  try {
    return await getPublikDesaId();
  } catch {
    return null;
  }
}

function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}