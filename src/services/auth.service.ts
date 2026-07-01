import { OtpService } from "./otp.service";
import { JwtService } from "./jwt.service";
import { UserService } from "./user.service";
import { Session, User } from "@/types/auth";

export class AuthService {
  /**
   * Request OTP
   */
  static async requestOtp(phone: string): Promise<string> {
    return await OtpService.generateOtp({ phone });
  }

  /**
   * Verify OTP and return session
   */
  static async verifyAndLogin(phone: string, code: string): Promise<Session | null> {
    const isValid = await OtpService.verifyOtp(code, { phone });
    if (!isValid) return null;

    const user = await UserService.findOrCreateByPhone(phone);
    
    const accessToken = await JwtService.generateAccessToken(user.id, user.role);
    const refreshToken = await JwtService.generateRefreshToken(user.id);

    return {
      user,
      accessToken,
      refreshToken
    };
  }

  /**
   * Refresh the access token using a valid refresh token
   */
  static async refreshSession(refreshTokenStr: string): Promise<Session | null> {
    const userId = await JwtService.validateRefreshToken(refreshTokenStr);
    if (!userId) return null;

    // Get user
    const { prisma } = await import("@/lib/db");
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    const accessToken = await JwtService.generateAccessToken(user.id, user.role as any);
    // Rotate refresh token
    await JwtService.revokeRefreshToken(refreshTokenStr);
    const newRefreshToken = await JwtService.generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role as any
      },
      accessToken,
      refreshToken: newRefreshToken
    };
  }
}
