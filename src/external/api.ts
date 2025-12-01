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

  const apiGatewayUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL;
  
  if (!apiGatewayUrl) {
    // If the URL is missing, throw a clear error instead of defaulting to localhost
    throw new Error("API_GATEWAY_URL environment variable is not configured correctly for the client.");
  }
  
  console.log("Fetching:", `${apiGatewayUrl}${path}`);
  const res = await fetch(`${apiGatewayUrl}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      (body as any)?.message ?? res.statusText ?? String(res.status);
    const error = new Error(message);
    (error as any).status = res.status;
    (error as any).body = body;
    throw error;
  }
  return res.json();
}