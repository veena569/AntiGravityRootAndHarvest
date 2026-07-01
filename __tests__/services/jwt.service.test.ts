import { JwtService } from "@/services/jwt.service";
import { prisma } from "@/lib/db";
import { authConfig } from "@/config/auth";
import { Role } from "@/types/auth";
import { SignJWT } from "jose";

jest.mock("@/lib/db", () => ({
  prisma: {
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    }
  }
}));

describe("JwtService", () => {
  const mockUserId = "user_123";
  const mockRole: Role = "CUSTOMER";
  const secret = new TextEncoder().encode(authConfig.jwt.secret);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateAccessToken", () => {
    it("should generate a valid JWT access token", async () => {
      const token = await JwtService.generateAccessToken(mockUserId, mockRole);
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // Header.Payload.Signature

      const payload = await JwtService.verifyToken(token);
      expect(payload).not.toBeNull();
      expect(payload?.sub).toBe(mockUserId);
      expect(payload?.role).toBe(mockRole);
    });
  });

  describe("generateRefreshToken", () => {
    it("should generate a token and save to database", async () => {
      const token = await JwtService.generateRefreshToken(mockUserId);
      
      expect(typeof token).toBe("string");
      expect(prisma.refreshToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            token,
            userId: mockUserId
          })
        })
      );
    });
  });

  describe("validateRefreshToken", () => {
    it("should return null if token is invalid", async () => {
      const result = await JwtService.validateRefreshToken("invalid.token.here");
      expect(result).toBeNull();
    });

    it("should return null if token is revoked in db", async () => {
      const validToken = await new SignJWT({})
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setIssuer(authConfig.jwt.issuer)
        .setSubject(mockUserId)
        .setExpirationTime("1h")
        .sign(secret);

      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue({
        revoked: true,
        expiresAt: new Date(Date.now() + 10000)
      });

      const result = await JwtService.validateRefreshToken(validToken);
      expect(result).toBeNull();
    });

    it("should return userId if token is valid and not revoked", async () => {
      const validToken = await new SignJWT({})
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setIssuer(authConfig.jwt.issuer)
        .setSubject(mockUserId)
        .setExpirationTime("1h")
        .sign(secret);

      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue({
        revoked: false,
        expiresAt: new Date(Date.now() + 100000)
      });

      const result = await JwtService.validateRefreshToken(validToken);
      expect(result).toBe(mockUserId);
    });
  });
});
