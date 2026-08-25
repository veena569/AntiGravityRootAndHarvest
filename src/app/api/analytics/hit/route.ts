import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { path } = body;

    if (!path || typeof path !== "string") {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    // Ignore admin routes and API routes from general site traffic metrics if desired, or track them
    if (path.startsWith("/api/") || path.startsWith("/admin")) {
      return NextResponse.json({ success: true, ignored: true });
    }

    const headersList = headers();
    const userAgent = headersList.get("user-agent") || undefined;
    const referrer = headersList.get("referer") || undefined;
    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0] ||
      headersList.get("x-real-ip") ||
      undefined;

    await prisma.siteHit.create({
      data: {
        path,
        userAgent,
        referrer,
        ipAddress,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ANALYTICS_HIT_ERROR]", error);
    return NextResponse.json({ error: "Failed to record hit" }, { status: 500 });
  }
}
