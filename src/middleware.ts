import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Validar variables de entorno críticas
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("CRITICAL: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    return new NextResponse("Service misconfigured", { status: 500 });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: { session } } = await supabase.auth.getSession();

  // Protección de rutas
  if (!user && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/set-password')) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Proxy para MLflow
  const isMlflowRequest = 
      request.nextUrl.pathname.startsWith('/mlflow-proxy') ||
      request.nextUrl.pathname.startsWith('/static-files') ||
      request.nextUrl.pathname.startsWith('/ajax-api');

  if (user && session && isMlflowRequest) {
    const mlflowUri = process.env.MLFLOW_TRACKING_URI;
    
    if (!mlflowUri) {
      console.error("CRITICAL: MLFLOW_TRACKING_URI not configured");
      return new NextResponse("MLflow service not configured", { status: 503 });
    }
    
    // Quitar /mlflow-proxy del path
    const subPath = request.nextUrl.pathname.replace('/mlflow-proxy', '');
    const targetUrl = new URL(mlflowUri + subPath);
    targetUrl.search = request.nextUrl.search;

    // Clonar headers y agregar autorización
    const requestHeaders = new Headers(request.headers);
    
    // Opción 1: Enviar como Authorization header (tu backend lo soporta)
    requestHeaders.set('Authorization', `Bearer ${session.access_token}`);
    
    // Opción 2: También enviar como cookie (tu backend también lo soporta)
    const existingCookie = request.cookies.get('access_token');
    if (!existingCookie) {
      requestHeaders.set('Cookie', `access_token=${session.access_token}`);
    }

    return NextResponse.rewrite(targetUrl, {
      request: {
        headers: requestHeaders,
      },
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};