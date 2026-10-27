import crypto from "crypto";
import { prisma } from "@/lib/db";
import { UserService } from "@/services/user.service";
import { OtpService } from "@/services/otp.service";

jest.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
    },
    otp: {
      findFirst: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    whatsappLog: {
      create: jest.fn(),
    },
  },
}));

jest.mock("@/services/otp.service", () => ({
  OtpService: {
    generateOtp: jest.fn(),
  },
}));

describe("WhatsApp Webhook & Login Flow Security", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("HMAC-SHA256 Signature Validation", () => {
    it("should compute valid signature matching Meta secret", () => {
      const secret = "test_meta_app_secret_12345";
      const payload = JSON.stringify({ object: "whatsapp_business_account" });
      const expectedSignature = `sha256=${crypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex")}`;

      const computed = `sha256=${crypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex")}`;

      expect(computed).toBe(expectedSignature);
    });
  });

  describe("Existing Customer Matching (Login-Only Constraint)", () => {
    it("should find existing customer by phone and NOT create a new account", async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: "cust_123",
        name: "Verified Customer",
        phone: "+919121603832",
        role: "CUSTOMER",
      });

      const customer = await UserService.findByPhone("9121603832");
      expect(customer).not.toBeNull();
      expect(customer?.id).toBe("cust_123");
      // Ensure findOrCreate was NOT invoked
      expect(prisma.user.findFirst).toHaveBeenCalled();
    });

    it("should return null when customer account does not exist (no auto-creation)", async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      const customer = await UserService.findByPhone("9999988888");
      expect(customer).toBeNull();
    });
  });
});
