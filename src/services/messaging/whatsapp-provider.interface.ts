export type WhatsAppProviderType = "SESSION_TEXT" | "META_AUTHENTICATION_TEMPLATE";

export interface SendOtpResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: WhatsAppProviderType;
}

export interface IWhatsAppMessagingProvider {
  readonly providerType: WhatsAppProviderType;

  /**
   * Sends a 6-digit login OTP code to a recipient's phone number via WhatsApp
   */
  sendLoginOtp(
    recipientPhone: string,
    code: string,
    options?: { expiresInMinutes?: number }
  ): Promise<SendOtpResult>;

  /**
   * Sends a generic notification/system message back to the customer
   */
  sendCustomerNotification?(
    recipientPhone: string,
    message: string
  ): Promise<SendOtpResult>;
}
