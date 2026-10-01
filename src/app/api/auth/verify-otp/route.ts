export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";
import { z } from "zod";
import { cookies } from "next/headers";
import { authConfig } from "@/config/auth";

const verifyOtpSchema = z.object({
  phone: z.string().min(10, "Invalid phone number"),
  code: z.string().length(authConfig.otp.length, "Invalid OTP length"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, code } = verifyOtpSchema.parse(body);

    const session = await AuthService.verifyAndLogin(phone, code);

    if (!session) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });
    }

    // Set Cookies
    cookies().set(authConfig.cookies.accessToken, session.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    if (session.refreshToken) {
      cookies().set(authConfig.cookies.refreshToken, session.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });
    }

    // Securely retrieve customer's saved addresses only after successful OTP verification
    let addresses: any[] = [];
    let isExistingCustomer = false;
    try {
      const { prisma } = await import("@/lib/db");
      const cleanPhoneDigits = phone.replace(/\D/g, "").slice(-10);
      const withPlus91 = `+91${cleanPhoneDigits}`;

      const addrList = await prisma.address.findMany({
        where: {
          OR: [
            ...(session.user.id && !session.user.id.startsWith("guest-") ? [{ userId: session.user.id }] : []),
            { phone: withPlus91 },
            { phone: cleanPhoneDigits },
            { phone: phone },
          ],
        },
        orderBy: [
          { isDefault: "desc" },
          { createdAt: "desc" }
        ],
        select: {
          id: true,
          name: true,
          phone: true,
          addressLine1: true,
          addressLine2: true,
          city: true,
          state: true,
          pincode: true,
          type: true,
          isDefault: true,
        }
      });

      // If no address records found in Address table, check previous Orders for this customer
      if (addrList.length === 0) {
        const previousOrders = await prisma.order.findMany({
          where: {
            OR: [
              ...(session.user.id && !session.user.id.startsWith("guest-") ? [{ userId: session.user.id }] : []),
              { shippingPhone: withPlus91 },
              { shippingPhone: cleanPhoneDigits },
              { shippingPhone: phone },
            ],
          },
          orderBy: { createdAt: "desc" },
          take: 3,
        });

        for (const ord of previousOrders) {
          if (ord.shippingAddress1 && ord.shippingCity && ord.shippingPincode) {
            addrList.push({
              id: `ord-addr-${ord.id}`,
              name: ord.shippingName || "",
              phone: ord.shippingPhone || withPlus91,
              addressLine1: ord.shippingAddress1,
              addressLine2: ord.shippingAddress2 || "",
              city: ord.shippingCity,
              state: ord.shippingState,
              pincode: ord.shippingPincode,
              type: ord.addressType || "Home",
              isDefault: true,
            });
            break;
          }
        }
      }

      addresses = addrList;
      isExistingCustomer = addresses.length > 0;
    } catch (dbErr) {
      console.warn("[VERIFY_OTP_ADDRESS_WARN]", dbErr);
    }

    return NextResponse.json({ 
      success: true, 
      user: session.user,
      isExistingCustomer,
      addresses,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("[VERIFY_OTP_ERROR]", error);
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
  }
}
