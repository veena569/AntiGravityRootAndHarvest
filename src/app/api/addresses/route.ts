export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { headers, cookies } from "next/headers";
import { z } from "zod";
import { authConfig } from "@/config/auth";
import { JwtService } from "@/services/jwt.service";

const addressSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  addressLine1: z.string().min(5),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(5),
  type: z.string().optional().default("Home"),
  isDefault: z.boolean().optional().default(false),
});

export async function GET(req: Request) {
  try {
    let userId = headers().get("x-user-id");

    if (!userId) {
      const token = cookies().get(authConfig.cookies.accessToken)?.value;
      if (token) {
        const payload = await JwtService.verifyToken(token);
        if (payload && payload.sub) userId = payload.sub;
      }
    }

    const { searchParams } = new URL(req.url);
    const queryPhone = searchParams.get("phone");

    if (!userId && queryPhone) {
      const raw = queryPhone.replace(/\D/g, "");
      const formattedPhone = raw.length === 10 ? `+91${raw}` : `+${raw}`;
      const user = await prisma.user.findFirst({
        where: { phone: formattedPhone }
      });
      if (user) userId = user.id;
    }

    if (!userId) {
      return NextResponse.json({ addresses: [] });
    }

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "desc" }
      ]
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("[ADDRESSES_GET]", error);
    return NextResponse.json({ error: "Failed to fetch addresses", addresses: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    let userId = headers().get("x-user-id");

    if (!userId) {
      const token = cookies().get(authConfig.cookies.accessToken)?.value;
      if (token) {
        const payload = await JwtService.verifyToken(token);
        if (payload && payload.sub) userId = payload.sub;
      }
    }

    const body = await req.json();
    const data = addressSchema.parse(body);

    if (!userId && data.phone) {
      const raw = data.phone.replace(/\D/g, "");
      const formattedPhone = raw.length === 10 ? `+91${raw}` : `+${raw}`;
      let user = await prisma.user.findFirst({
        where: { phone: formattedPhone }
      });
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: data.name,
            phone: formattedPhone,
            role: "CUSTOMER"
          }
        });
      }
      userId = user.id;
    }

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // If this is set to default, unset other defaults
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.create({
      data: {
        ...data,
        userId
      }
    });

    return NextResponse.json({ address });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("[ADDRESSES_POST]", error);
    return NextResponse.json({ error: "Failed to add address" }, { status: 500 });
  }
}
