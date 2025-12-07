import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
  console.log("[PROXY] Request:", {
    method: request.method,
    url: request.url,
    pathname: request.nextUrl.pathname,
    isServerAction: request.headers.get('next-action') !== null,
  });

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Validar variables de entorno críticas
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_PUBLISHABLE_KEY) {
    console.error("CRITICAL: Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY", {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_PUBLISHABLE_KEY,
    });
    return new NextResponse("Service misconfigured", { status: 500 });
  }

  const supabase = createServerClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_PUBLISHABLE_KEY,
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

  console.log("[PROXY] Auth status:", {
    hasUser: !!user,
    hasSession: !!session,
    pathname: request.nextUrl.pathname,
  });

  // NO interceptar Server Actions - estos manejan su propia autenticación
  const isServerAction = request.headers.get('next-action') !== null;
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  
  console.log("[PROXY] Route checks:", {
    isServerAction,
    isApiRoute,
    pathname: request.nextUrl.pathname,
    shouldRedirect: !isServerAction && !isApiRoute && !user && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/set-password')
  });
  
  // Protección de rutas - NO aplicar a Server Actions ni API routes
  if (!isServerAction && !isApiRoute && !user && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/set-password')) {
    console.log("[PROXY] Redirecting to login");
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
    console.log("[PROXY] MLflow request detected");
    const mlflowUri = process.env.MLFLOW_TRACKING_URI;
    
    if (!mlflowUri) {
      console.error("CRITICAL: MLFLOW_TRACKING_URI not configured");
      return new NextResponse("MLflow service not configured", { status: 503 });
    }
    
    // Quitar /mlflow-proxy del path
    const subPath = request.nextUrl.pathname.replace('/mlflow-proxy', '');
    const targetUrl = new URL(mlflowUri + subPath);
    targetUrl.search = request.nextUrl.search;

    console.log("[PROXY] MLflow rewrite:", {
      from: request.nextUrl.pathname,
      to: targetUrl.toString(),
    });

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

  console.log("[PROXY] Passing through");
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
