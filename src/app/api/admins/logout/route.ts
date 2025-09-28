import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase";

export async function POST() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return new Response(
      JSON.stringify({ ok: false, message: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": "sb:token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax",
    },
  });
}
