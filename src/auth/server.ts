import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch { 
          }
        },
      },
    }
  )
}

export async function getUser() {
    const {auth} = await createClient();
    const userObject = await auth.getUser();

    if (userObject.error) {
        console.error("Error fetching user:", userObject.error);
        return null;
    }

    return userObject.data.user;
}