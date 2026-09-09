import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { headers, cookies } from "next/headers";
import { JwtService } from "@/services/jwt.service";
import { authConfig } from "@/config/auth";

export const dynamic = "force-dynamic";

async function checkAdminAuth() {
  const headerRole = headers().get("x-user-role");
  if (headerRole === "ADMIN" || headerRole === "SUPER_ADMIN") return true;

  const token = cookies().get(authConfig.cookies.accessToken)?.value;
  if (token) {
    const payload = await JwtService.verifyToken(token);
    if (payload && (payload.role === "ADMIN" || payload.role === "SUPER_ADMIN")) {
      return true;
    }
  }
  return false;
}

export async function GET() {
  try {
    const isAuthorized = await checkAdminAuth();
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const reviews = await prisma.review.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reviews });
  } catch (error: any) {
    console.error("[ADMIN_REVIEWS_GET_FAILED]", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const isAuthorized = await checkAdminAuth();
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { id, isVerified } = body;

    if (!id) {
      return NextResponse.json({ error: "Review ID required" }, { status: 400 });
    }

    const updated = await prisma.review.update({
      where: { id },
      data: { isVerified: Boolean(isVerified) },
    });

    return NextResponse.json({ success: true, review: updated });
  } catch (error: any) {
    console.error("[ADMIN_REVIEWS_PATCH_FAILED]", error);
    return NextResponse.json(
      { error: error.message || "Failed to update review" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const isAuthorized = await checkAdminAuth();
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Review ID required" }, { status: 400 });
    }

    await prisma.review.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Review deleted successfully" });
  } catch (error: any) {
    console.error("[ADMIN_REVIEWS_DELETE_FAILED]", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete review" },
      { status: 500 }
    );
  }
}
