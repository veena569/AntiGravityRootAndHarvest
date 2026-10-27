import { OtpService } from "@/services/otp.service";
import { prisma } from "@/lib/db";
import { WhatsAppProviderFactory } from "@/services/messaging/whatsapp-provider.factory";

jest.mock("@/lib/db", () => ({
  prisma: {
    otp: {
      updateMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("@/services/messaging/whatsapp-provider.factory", () => ({
  WhatsAppProviderFactory: {
    getProvider: jest.fn().mockReturnValue({
      sendLoginOtp: jest.fn().mockResolvedValue({ success: true, provider: "SESSION_TEXT" }),
      sendCustomerNotification: jest.fn().mockResolvedValue({ success: true }),
    }),
  },
}));

describe("OtpService & WhatsApp Login Verification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("generateOtp", () => {
    it("should throw an error if no phone or email is provided", async () => {
      await expect(OtpService.generateOtp({})).rejects.toThrow(
        "Phone or email is required to generate OTP"
      );
    });

    it("should generate a 6-digit crypto OTP and invalidate previous active ones", async () => {
      const phone = "9121603832";
      (prisma.otp.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
      (prisma.otp.create as jest.Mock).mockResolvedValue({ id: "otp_test_123" });

      const result = await OtpService.generateOtp({ phone, purpose: "LOGIN" });

      // Verify previous invalidation
      expect(prisma.otp.updateMany).toHaveBeenCalledWith({
        where: {
          OR: [{ phone: "+919121603832" }, { phone: "9121603832" }],
          verified: false,
        },
        data: { verified: true },
      });

      // Verify new OTP creation
      expect(prisma.otp.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          phone: "+919121603832",
          email: null,
          code: expect.stringMatching(/^\d{6}$/),
          expiresAt: expect.any(Date),
        }),
      });

      expect(result.referenceId).toBe("otp_test_123");
      expect(result.code).toMatch(/^\d{6}$/);

      // Verify WhatsApp provider dispatched
      const provider = WhatsAppProviderFactory.getProvider();
      expect(provider.sendLoginOtp).toHaveBeenCalledWith(
        "9121603832",
        expect.stringMatching(/^\d{6}$/),
        expect.objectContaining({ expiresInMinutes: 5 })
      );
    });
  });

  describe("verifyOtp", () => {
    it("should return false if no valid OTP record is found", async () => {
      (prisma.otp.findFirst as jest.Mock).mockResolvedValue(null);

      const isValid = await OtpService.verifyOtp("999999", { phone: "9121603832" });
      expect(isValid).toBe(false);
    });

    it("should verify successfully and execute atomic update to prevent race conditions", async () => {
      (prisma.otp.findFirst as jest.Mock).mockResolvedValue({ id: "otp_test_123" });
      (prisma.otp.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const isValid = await OtpService.verifyOtp("123456", { phone: "9121603832" });

      expect(isValid).toBe(true);
      expect(prisma.otp.updateMany).toHaveBeenCalledWith({
        where: { id: "otp_test_123", verified: false },
        data: { verified: true },
      });
    });

    it("should prevent OTP replay if already verified by concurrent request", async () => {
      (prisma.otp.findFirst as jest.Mock).mockResolvedValue({ id: "otp_test_123" });
      // Concurrent update race condition: updateMany returns count: 0
      (prisma.otp.updateMany as jest.Mock).mockResolvedValue({ count: 0 });

      const isValid = await OtpService.verifyOtp("123456", { phone: "9121603832" });

      expect(isValid).toBe(false);
    });

    it("should enforce max 5 failed attempts lockout per phone challenge", async () => {
      const phone = "9988776655";
      (prisma.otp.findFirst as jest.Mock).mockResolvedValue(null);

      // 5 consecutive failed attempts
      for (let i = 0; i < 5; i++) {
        const res = await OtpService.verifyOtp("000000", { phone });
        expect(res).toBe(false);
      }

      // 6th attempt should trigger lockout and invalidate all active challenges
      (prisma.otp.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
      const lockoutRes = await OtpService.verifyOtp("123456", { phone });

      expect(lockoutRes).toBe(false);
      expect(prisma.otp.updateMany).toHaveBeenCalledWith({
        where: {
          OR: [{ phone: "+919988776655" }, { phone: "9988776655" }],
          verified: false,
        },
        data: { verified: true },
      });
    });
  });
});
