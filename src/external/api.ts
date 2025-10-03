"use server"
import { createClient } from "@/lib/supabase"

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {

  const supabase = await createClient()
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  const headers = new Headers(options.headers || {})
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }
  headers.set("Content-Type", "application/json")
  console.log("Fetching:", `${process.env.API_GATEWAY_URL}${path}`)
  const res = await fetch(`${process.env.API_GATEWAY_URL}${path}`, {
    ...options,
    headers,
  })

  if (res.status === 401) {
    await supabase.auth.signOut()
    throw new Error("Unauthorized, please log in again")
  }
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || "Something went wrong")
  }

  return res.json() as Promise<T>
}

