import { createClient } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json();

  const supabase = await createClient();

  const resp = await supabase.auth.signInWithPassword({
    email: body.email,
    password: body.password,
  });

  if (resp.error) {
    return new Response(
      JSON.stringify({ ok: false, message: resp.error.message }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
}