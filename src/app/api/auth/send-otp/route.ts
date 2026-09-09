export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";
import { z } from "zod";

const sendOtpSchema = z.object({
  phone: z.string().min(10, "Invalid 10-digit mobile number"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone } = sendOtpSchema.parse(body);

    const raw = phone.replace(/\D/g, "").slice(-10);
    if (raw.length !== 10) {
      return NextResponse.json({ error: "Please enter a valid 10-digit mobile number" }, { status: 400 });
    }
    const formattedPhone = `+91${raw}`;

    // Rate-limiting: prevent requesting OTP more than once every 30 seconds
    const { prisma } = await import("@/lib/db");
    const recentOtp = await prisma.otp.findFirst({
      where: {
        phone: formattedPhone,
        createdAt: {
          gte: new Date(Date.now() - 30 * 1000)
        }
      },
      orderBy: { createdAt: "desc" }
    });

    if (recentOtp) {
      const waitSeconds = Math.max(1, Math.ceil((30 * 1000 - (Date.now() - new Date(recentOtp.createdAt).getTime())) / 1000));
      return NextResponse.json({ 
        error: `Please wait ${waitSeconds}s before requesting a new OTP`,
        cooldownSeconds: waitSeconds
      }, { status: 429 });
    }

    const { referenceId, code } = await AuthService.requestOtp(formattedPhone);

    const isDev = process.env.NODE_ENV !== "production";

    return NextResponse.json({ 
      success: true, 
      message: "OTP sent successfully",
      referenceId,
      ...(isDev ? { code } : {})
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("[SEND_OTP_ERROR]", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
