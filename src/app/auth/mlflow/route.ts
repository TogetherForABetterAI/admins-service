
import { createClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const mlflowUrl = process.env.MLFLOW_TRACKING_URI || "http://mlflow.136.114.87.151.nip.io";
  
  const response = NextResponse.redirect(mlflowUrl);

  
  const domain = process.env.DOMAIN; 

  response.cookies.set("access_token", session.access_token, {
    domain: domain, 
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 3600 
  });

  return response;
}