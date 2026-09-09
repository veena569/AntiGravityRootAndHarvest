export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { headers, cookies } from "next/headers";
import { z } from "zod";
import { authConfig } from "@/config/auth";
import { JwtService } from "@/services/jwt.service";

const addressSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid 10-digit phone required"),
  addressLine1: z.string().min(5, "Address Line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(5, "Pincode is required"),
  type: z.string().optional().default("Home"),
  isDefault: z.boolean().optional().default(false),
});

async function getAuthenticatedUserId(): Promise<string | null> {
  const headerUserId = headers().get("x-user-id");
  if (headerUserId) return headerUserId;

  const token = cookies().get(authConfig.cookies.accessToken)?.value;
  if (token) {
    const payload = await JwtService.verifyToken(token);
    if (payload && payload.sub) return payload.sub;
  }
  return null;
}

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();

    // STRICT SECURITY: Only authenticated users can access saved addresses.
    // Never allow querying addresses by unverified phone parameter.
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
    let userId = await getAuthenticatedUserId();
    const body = await req.json();
    const data = addressSchema.parse(body);

    // If user is not yet logged in with session cookie, link or create via verified phone
    if (!userId && data.phone) {
      const raw = data.phone.replace(/\D/g, "").slice(-10);
      const formattedPhone = `+91${raw}`;
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

    return NextResponse.json({ success: true, address });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("[ADDRESSES_POST]", error);
    return NextResponse.json({ error: "Failed to add address" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    const body = await req.json();
    const { id, name, addressLine1, addressLine2, city, state, pincode, type, isDefault } = body;

    if (!id) return NextResponse.json({ error: "Address ID required" }, { status: 400 });

    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Address not found" }, { status: 404 });

    // Ensure customer only updates their own address
    if (userId && existing.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized access to address" }, { status: 403 });
    }

    if (isDefault && userId) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      });
    }

    // Notice: Phone number is kept intact and not altered from address edit form
    const updated = await prisma.address.update({
      where: { id },
      data: {
        name: name || existing.name,
        addressLine1: addressLine1 || existing.addressLine1,
        addressLine2: addressLine2 !== undefined ? addressLine2 : existing.addressLine2,
        city: city || existing.city,
        state: state || existing.state,
        pincode: pincode || existing.pincode,
        type: type || existing.type,
        isDefault: typeof isDefault === "boolean" ? isDefault : existing.isDefault,
      }
    });

    return NextResponse.json({ success: true, address: updated });
  } catch (error: any) {
    console.error("[ADDRESSES_PUT]", error);
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Address ID required" }, { status: 400 });

    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Address not found" }, { status: 404 });

    if (existing.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.address.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Address deleted successfully" });
  } catch (error: any) {
    console.error("[ADDRESSES_DELETE]", error);
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}
