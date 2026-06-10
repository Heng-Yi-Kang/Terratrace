import { type NextRequest, NextResponse } from "next/server";

const protectedRoutes = ['/dashboard', '/admin', '/todos'];
const authRoutes = ['/login', '/signup'];
const cookieName = process.env.SESSION_COOKIE_NAME || 'terratrace_session';

type SessionPayload = {
  sub?: string
  email?: string
  role?: string
  username?: string
  exp?: number
}

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=')
  const binary = atob(base64)
  const bytes = new Uint8Array(new ArrayBuffer(binary.length))
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function verifyJwt(token: string): Promise<SessionPayload | null> {
  const secret = process.env.JWT_SECRET
  if (!secret) return null

  const [encodedHeader, encodedPayload, encodedSignature] = token.split('.')
  if (!encodedHeader || !encodedPayload || !encodedSignature) return null

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  )

  const valid = await crypto.subtle.verify(
    'HMAC',
    key,
    base64UrlToBytes(encodedSignature),
    new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`),
  )

  if (!valid) return null

  const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(encodedPayload))) as SessionPayload
  if (payload.exp && payload.exp * 1000 < Date.now()) return null
  return payload
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get(cookieName)?.value;
  const user = token ? await verifyJwt(token) : null;

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthRoute && user) {
    const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  if (pathname.startsWith('/admin') && user?.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
