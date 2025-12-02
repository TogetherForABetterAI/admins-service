"use server";
import { createClient } from "@/lib/supabase";

export type ApiError = { status: number; message: string };

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  headers.set("Content-Type", "application/json");
  console.log("Fetching:", `${process.env.USERS_SERVICE_URL}${path}`);
  const res = await fetch(`${process.env.USERS_SERVICE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      (body as any)?.message ?? res.statusText ?? String(res.status);
    const error = new Error(message);
    // Unicamente me deja acceder al status code a traves del message, los otros campos parecen no estar disponibles.
    // No es lo ideal, pero no encontre otra forma.
    (error as any).status = res.status;
    (error as any).body = body;
    throw error;
  }
  return res.json();
}
