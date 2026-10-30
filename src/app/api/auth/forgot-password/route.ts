export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";
import { z } from "zod";

const forgotSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = forgotSchema.parse(body);

    await AuthService.requestPasswordReset(email);

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
