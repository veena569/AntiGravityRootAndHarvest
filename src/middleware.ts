import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_root_harvest_super_secret_key_2026"
);

// Protected paths
const protectedPaths = ["/orders", "/profile", "/wishlist", "/saved-addresses", "/api/orders", "/api/addresses"];
const adminPaths = ["/admin", "/api/admin"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow unauthenticated access to the admin login page
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const isAdmin = adminPaths.some((p) => pathname.startsWith(p));

  if (!isProtected && !isAdmin) {
    return NextResponse.next();
  }

  const token = req.cookies.get("rh_access_token")?.value;

  if (!token) {
    // If it's an API route, return 401
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Redirect to login with callback URL
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: "root-and-harvest",
      audience: "root-and-harvest-client",
    });

    // Check RoleGuard for Admin routes
    if (isAdmin && payload.role !== "ADMIN" && payload.role !== "SUPER_ADMIN") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Pass request forward
    const response = NextResponse.next();
    // Pass user ID as header if downstream APIs need it
    response.headers.set("x-user-id", payload.sub as string);
    response.headers.set("x-user-role", payload.role as string);

    return response;
  } catch (error) {
    // Token is invalid or expired
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Note: To handle silent refresh seamlessly on page load, we often let the client handle 401s 
    // and refresh, or we can refresh here. But Edge can't easily hit Prisma. 
    // We redirect to login and the client `ApiClient` or `AuthProvider` will attempt refresh.
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    // Add a flag to indicate session expiry
    url.searchParams.set("expired", "true");
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    "/orders/:path*",
    "/profile/:path*",
    "/wishlist/:path*",
    "/saved-addresses/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/create-order",
    "/api/get-order",
    "/api/orders",
    "/api/addresses",
  ],
};
