import { createClient } from "@/lib/supabase";

export async function GET(req: Request) {
    const supabase = await createClient();
    const session = await supabase.auth.getSession();
    const accessToken = session.data.session?.access_token;

    return await fetch("http://localhost:80/users", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        },
    });
}