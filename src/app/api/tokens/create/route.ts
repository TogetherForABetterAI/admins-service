import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json();

  const supabase = await createClient();
  const session = await supabase.auth.getSession();
  const accessToken = session.data.session?.access_token;

  return await fetch("http://localhost:80/tokens/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });
}