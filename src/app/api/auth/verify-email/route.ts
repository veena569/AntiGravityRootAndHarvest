export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      return NextResponse.json({ error: "Missing verification parameters" }, { status: 400 });
    }

    const result = await AuthService.verifyEmail(token, email);

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Invalid or expired link" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Email verified successfully!",
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to verify email" }, { status: 500 });
  }
}
