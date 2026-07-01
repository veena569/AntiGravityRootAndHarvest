import { SignJWT, jwtVerify } from "jose";
import { authConfig } from "@/config/auth";
import { JwtPayload, Role } from "@/types/auth";
import { prisma } from "@/lib/db";
import { addDays } from "date-fns";

const secret = new TextEncoder().encode(authConfig.jwt.secret);

export class JwtService {
  /**
   * Generates a short-lived access token
   */
  static async generateAccessToken(userId: string, role: Role): Promise<string> {
    const alg = "HS256";
    
    return new SignJWT({ role } as any)
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setIssuer(authConfig.jwt.issuer)
      .setAudience(authConfig.jwt.audience)
      .setSubject(userId)
      .setExpirationTime(authConfig.jwt.accessExpiration)
      .sign(secret);
  }

  /**
   * Generates a long-lived refresh token and stores it in the DB
   */
  static async generateRefreshToken(userId: string): Promise<string> {
    // We can just use a random string or a JWT for refresh token.
    // For simplicity, a JWT without claims works perfectly for stateless decoding if needed,
    // but we store it to easily revoke it.
    const alg = "HS256";
    const token = await new SignJWT({})
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setIssuer(authConfig.jwt.issuer)
      .setSubject(userId)
      .setExpirationTime(authConfig.jwt.refreshExpiration)
      .sign(secret);

    await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt: addDays(new Date(), parseInt(authConfig.jwt.refreshExpiration.replace('d', '')))
      }
    });

    return token;
  }

  /**
   * Verifies an access token and returns its payload
   */
  static async verifyToken(token: string): Promise<JwtPayload | null> {
    try {
      const { payload } = await jwtVerify(token, secret, {
        issuer: authConfig.jwt.issuer,
        audience: authConfig.jwt.audience
      });
      return payload as unknown as JwtPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Validates a refresh token against the database
   */
  static async validateRefreshToken(token: string): Promise<string | null> {
    try {
      // 1. Check cryptographically
      const { payload } = await jwtVerify(token, secret, {
        issuer: authConfig.jwt.issuer,
      });

      if (!payload.sub) return null;

      // 2. Check database for revocation
      const dbToken = await prisma.refreshToken.findUnique({
        where: { token }
      });

      if (!dbToken || dbToken.revoked || dbToken.expiresAt < new Date()) {
        return null;
      }

      return payload.sub;
    } catch (error) {
      return null;
    }
  }

  /**
   * Revokes a refresh token
   */
  static async revokeRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.update({
      where: { token },
      data: { revoked: true }
    });
  }
}
