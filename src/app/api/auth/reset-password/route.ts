export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";
import { z } from "zod";

const resetSchema = z.object({
  token: z.string().min(1, "Reset token is missing"),
  email: z.string().email("Invalid email address"),
  newPassword: z.string().min(8, "Password must be at least 8 characters long"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, email, newPassword } = resetSchema.parse(body);

    const result = await AuthService.resetPassword(token, email, newPassword);

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to reset password" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
