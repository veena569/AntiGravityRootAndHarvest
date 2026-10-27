import { IWhatsAppMessagingProvider, SendOtpResult, WhatsAppProviderType } from "./whatsapp-provider.interface";
import { WhatsappMetaService } from "../whatsapp-meta.service";

/**
 * Stage 2: Temporary/Low-cost Session Text WhatsApp Provider
 * 
 * Uses Meta WhatsApp Cloud API within the 24-hour customer service window
 * (triggered when customer clicks the login link and sends a message to Root & Harvest).
 * Costs ₹0 under Meta's 1,000 free monthly Service conversations.
 */
export class SessionTextWhatsAppProvider implements IWhatsAppMessagingProvider {
  readonly providerType: WhatsAppProviderType = "SESSION_TEXT";

  async sendLoginOtp(
    recipientPhone: string,
    code: string,
    options: { expiresInMinutes?: number } = { expiresInMinutes: 5 }
  ): Promise<SendOtpResult> {
    try {
      const cleanPhone = recipientPhone.replace(/\D/g, "").slice(-10);
      const expiry = options.expiresInMinutes || 5;

      const message = 
        `🌿 *Root & Harvest*\n\n` +
        `Your secure login verification code is: *${code}*\n\n` +
        `⏱ Valid for ${expiry} minutes. Please do not share this code with anyone.\n\n` +
        `_If you did not request this login code, you can safely ignore this message._`;

      const result = await WhatsappMetaService.sendMessageWithRetry(
        cleanPhone,
        message,
        "CUSTOMER_LOGIN_OTP"
      );

      if (result.success) {
        return {
          success: true,
          provider: this.providerType,
        };
      }

      return {
        success: false,
        error: result.errMessage || "Failed to deliver WhatsApp message",
        provider: this.providerType,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Unknown error sending WhatsApp OTP",
        provider: this.providerType,
      };
    }
  }

  async sendCustomerNotification(
    recipientPhone: string,
    message: string
  ): Promise<SendOtpResult> {
    try {
      const cleanPhone = recipientPhone.replace(/\D/g, "").slice(-10);
      const result = await WhatsappMetaService.sendMessageWithRetry(
        cleanPhone,
        message,
        "CUSTOMER_NOTIFICATION"
      );

      return {
        success: result.success,
        error: result.errMessage,
        provider: this.providerType,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message,
        provider: this.providerType,
      };
    }
  }
}
