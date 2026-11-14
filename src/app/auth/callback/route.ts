import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/dashboard";
  const safeNext = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard";
  const errorDesc = searchParams.get("error_description") || searchParams.get("error");

  if (errorDesc) {
    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent(errorDesc)}`
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!code || !supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent("Missing authorization code or Supabase configuration.")}`
    );
  }

  const cookieStore = await cookies();
  const redirectUrl = `${origin}${safeNext}`;
  const response = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent(error.message)}`
    );
  }

  // Sync Google / OAuth avatar & display name into public.profiles when first signing in
  if (data?.user) {
    const meta = data.user.user_metadata || {};
    const oauthName = meta.full_name || meta.name;
    const oauthAvatar = meta.avatar_url || meta.picture;
    if (oauthName || oauthAvatar) {
      await supabase
        .from("profiles")
        .update({
          ...(oauthName ? { display_name: String(oauthName) } : {}),
          ...(oauthAvatar ? { avatar_url: String(oauthAvatar) } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.user.id);
    }
  }

  return response;
}
