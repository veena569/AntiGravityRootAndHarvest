export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { z } from "zod";

const addressSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  addressLine1: z.string().min(5),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(5),
  isDefault: z.boolean().optional().default(false),
});

export async function GET() {
  try {
    const userId = headers().get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = headers().get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const data = addressSchema.parse(body);

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
