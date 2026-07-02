export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";
import { z } from "zod";

const sendOtpSchema = z.object({
  phone: z.string().min(10, "Invalid phone number"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone } = sendOtpSchema.parse(body);

    const { referenceId, code } = await AuthService.requestOtp(phone);

    return NextResponse.json({ 
      success: true, 
      message: "OTP sent successfully",
      referenceId,
      code
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("[SEND_OTP_ERROR]", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
