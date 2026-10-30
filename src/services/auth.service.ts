import bcrypt from "bcryptjs";
import crypto from "crypto";
import { EmailService } from "./email.service";

import { OtpService } from "./otp.service";
import { JwtService } from "./jwt.service";
import { UserService } from "./user.service";
import { Session, User } from "@/types/auth";

export class AuthService {
  /**
   * Request OTP
   */
  static async requestOtp(phone: string): Promise<{ referenceId: string; code: string }> {
    return await OtpService.generateOtp({ phone });
  }

  /**
   * Verify OTP and return session
   */
  static async verifyAndLogin(phone: string, code: string, isLoginOnly: boolean = false): Promise<Session | null> {
    const isValid = await OtpService.verifyOtp(code, { phone });
    if (!isValid) return null;

    let user: User | null = null;
    if (isLoginOnly) {
      user = await UserService.findByPhone(phone);
      if (!user) {
        // Enforce constraint: Do not automatically create customer accounts through login-only flow
        return null;
      }
    } else {
      user = await UserService.findOrCreateByPhone(phone);
    }
    
    let accessToken = "";
    let refreshToken = "";
    try {
      accessToken = await JwtService.generateAccessToken(user.id, user.role);
      refreshToken = await JwtService.generateRefreshToken(user.id);
    } catch (jwtErr) {
      console.warn("[JWT_GEN_WARN]", jwtErr);
    }

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

  /**
   * Register a new customer with email and password
   */
  static async registerWithPassword({
    email,
    password,
    name,
    phone,
  }: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  }): Promise<{ user: User; accessToken: string; refreshToken?: string }> {
    const { prisma } = await import("@/lib/db");
    const normalizedEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      throw new Error("Please enter a valid email address.");
    }
    if (!password || password.length < 8) {
      throw new Error("Password must be at least 8 characters long.");
    }

    const existingUser = await prisma.user.findFirst({
      where: { email: normalizedEmail },
    });

    if (existingUser && existingUser.password) {
      throw new Error("An account with this email already exists. Please log in or reset your password.");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Cryptographic single-use email verification token
    const verificationRaw = crypto.randomBytes(32).toString("hex");
    const verificationHash = crypto.createHash("sha256").update(verificationRaw).digest("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    let user;
    if (existingUser) {
      // User existed from a prior guest order or phone OTP without password
      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: cleanName || existingUser.name,
          password: hashedPassword,
          phone: phone ? `+91${phone.replace(/\D/g, "").slice(-10)}` : existingUser.phone,
          emailVerificationToken: verificationHash,
          emailVerificationExpires: verificationExpires,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          name: cleanName,
          phone: phone ? `+91${phone.replace(/\D/g, "").slice(-10)}` : null,
          role: "CUSTOMER",
          emailVerificationToken: verificationHash,
          emailVerificationExpires: verificationExpires,
        },
      });
    }

    // Send verification email asynchronously
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://rootandharvest.in";
    const verifyUrl = `${baseUrl}/verify-email?token=${verificationRaw}&email=${encodeURIComponent(normalizedEmail)}`;
    EmailService.sendEmailVerificationEmail(normalizedEmail, cleanName, verifyUrl).catch((err) =>
      console.error("[VERIFICATION_EMAIL_DISPATCH_ERR]", err)
    );

    const accessToken = await JwtService.generateAccessToken(user.id, user.role as any);
    const refreshToken = await JwtService.generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role as any,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Log in an existing customer using email and password
   */
  static async loginWithPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<{ user: User; accessToken: string; refreshToken?: string } | null> {
    const { prisma } = await import("@/lib/db");
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findFirst({
      where: { email: normalizedEmail },
    });

    if (!user || !user.password) {
      // Secure uniform timing response to prevent email enumeration
      await bcrypt.compare(password, "$2a$12$e8pAqv89.vT2zLg2JjG8.O9h9eZ0YnIqL8uS2wO4jG8.O9h9eZ0Yn");
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return null;
    }

    const accessToken = await JwtService.generateAccessToken(user.id, user.role as any);
    const refreshToken = await JwtService.generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role as any,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Request password reset link (rate-limited, secure hashing)
   */
  static async requestPasswordReset(email: string): Promise<boolean> {
    const { prisma } = await import("@/lib/db");
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findFirst({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Return true to avoid disclosing account existence
      return true;
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: tokenHash,
        passwordResetExpires: expires,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://rootandharvest.in";
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(normalizedEmail)}`;
    await EmailService.sendPasswordResetEmail(normalizedEmail, user.name, resetUrl);

    return true;
  }

  /**
   * Reset password with valid single-use token
   */
  static async resetPassword(token: string, email: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    const { prisma } = await import("@/lib/db");
    const normalizedEmail = email.trim().toLowerCase();

    if (!newPassword || newPassword.length < 8) {
      return { success: false, error: "Password must be at least 8 characters long." };
    }

    const tokenHash = crypto.createHash("sha256").update(token.trim()).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        passwordResetToken: tokenHash,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return { success: false, error: "The password reset link is invalid or has expired." };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    // Revoke all existing refresh tokens for security
    await prisma.refreshToken.updateMany({
      where: { userId: user.id },
      data: { revoked: true },
    });

    return { success: true };
  }

  /**
   * Verify email verification link token
   */
  static async verifyEmail(token: string, email: string): Promise<{ success: boolean; error?: string }> {
    const { prisma } = await import("@/lib/db");
    const normalizedEmail = email.trim().toLowerCase();

    const tokenHash = crypto.createHash("sha256").update(token.trim()).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        emailVerificationToken: tokenHash,
        emailVerificationExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return { success: false, error: "This email verification link is invalid or has expired." };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    return { success: true };
  }
}
