import { OtpService } from "@/services/otp.service";
import { prisma } from "@/lib/db";
import { authConfig } from "@/config/auth";

jest.mock("@/lib/db", () => ({
  prisma: {
    otp: {
      updateMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    }
  }
}));

describe("OtpService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Spy on console.log used in the service mock notification
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe("generateOtp", () => {
    it("should throw an error if no phone or email is provided", async () => {
      await expect(OtpService.generateOtp({})).rejects.toThrow("Phone or email is required to generate OTP");
    });

    it("should generate a 6-digit OTP and invalidate previous ones", async () => {
      const phone = "1234567890";
      (prisma.otp.create as jest.Mock).mockResolvedValue({ id: "otp_123" });

      const otpId = await OtpService.generateOtp({ phone });

      expect(prisma.otp.updateMany).toHaveBeenCalledWith({
        where: {
          OR: [{ phone }],
          verified: false
        },
        data: { verified: true }
      });

      expect(prisma.otp.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          phone,
          email: null,
          code: expect.stringMatching(/^\d{6}$/),
          expiresAt: expect.any(Date)
        })
      });

      expect(otpId).toBe("otp_123");
    });
  });

  describe("verifyOtp", () => {
    it("should return false if no record is found", async () => {
      (prisma.otp.findFirst as jest.Mock).mockResolvedValue(null);

      const isValid = await OtpService.verifyOtp("123456", { phone: "1234567890" });
      expect(isValid).toBe(false);
    });

    it("should verify successfully and mark as verified", async () => {
      (prisma.otp.findFirst as jest.Mock).mockResolvedValue({ id: "otp_123" });
      (prisma.otp.update as jest.Mock).mockResolvedValue({});

      const isValid = await OtpService.verifyOtp("123456", { phone: "1234567890" });
      
      expect(isValid).toBe(true);
      expect(prisma.otp.update).toHaveBeenCalledWith({
        where: { id: "otp_123" },
        data: { verified: true }
      });
    });
  });
});
