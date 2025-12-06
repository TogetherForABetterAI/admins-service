import { createClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Verificar que el usuario esté autenticado
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const mlflowUri = process.env.MLFLOW_TRACKING_URI;
  
  if (!mlflowUri) {
    return new NextResponse("MLflow not configured", { status: 503 });
  }

  // Simplemente redirigir a la URL de MLflow
  // NOTA: El Ingress de MLflow debe estar configurado sin auth-url
  // o debe aceptar el token desde otro método
  return NextResponse.redirect(mlflowUri);
}
