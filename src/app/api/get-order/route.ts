export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { authConfig } from "@/config/auth";
import { JwtService } from "@/services/jwt.service";

export async function GET(req: Request) {
  try {
    const token = cookies().get(authConfig.cookies.accessToken)?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await JwtService.verifyToken(token);
    if (!payload || !payload.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: {
        id,
        userId: payload.sub
      },
      include: {
        items: true
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}
