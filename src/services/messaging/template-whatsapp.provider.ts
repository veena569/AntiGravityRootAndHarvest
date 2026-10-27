import { IWhatsAppMessagingProvider, SendOtpResult, WhatsAppProviderType } from "./whatsapp-provider.interface";
import { prisma } from "@/lib/db";

/**
 * Stage 4: Future Meta Migration Provider (Authentication Templates)
 * 
 * Uses Meta's official WhatsApp Business Cloud API Authentication Templates
 * (with copy-code button, one-tap autofill, and strict template guidelines).
 * Deactivated by default until approved template credentials are provided in Meta Console.
 */
export class TemplateWhatsAppProvider implements IWhatsAppMessagingProvider {
  readonly providerType: WhatsAppProviderType = "META_AUTHENTICATION_TEMPLATE";

  async sendLoginOtp(
    recipientPhone: string,
    code: string,
    options: { expiresInMinutes?: number } = { expiresInMinutes: 5 }
  ): Promise<SendOtpResult> {
    const templateName = process.env.WHATSAPP_AUTH_TEMPLATE_NAME;

    if (!templateName) {
      return {
        success: false,
        error: "Meta Authentication Template name (WHATSAPP_AUTH_TEMPLATE_NAME) is not configured.",
        provider: this.providerType,
      };
    }

    try {
      const config = await prisma.whatsappConfig.findFirst();
      const accessToken = config?.accessToken || process.env.WHATSAPP_ACCESS_TOKEN;
      const phoneNumberId = config?.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;

      if (!accessToken || !phoneNumberId) {
        return {
          success: false,
          error: "Missing Meta WhatsApp Cloud API credentials.",
          provider: this.providerType,
        };
      }

      let formattedPhone = recipientPhone.replace(/\D/g, "");
      if (formattedPhone.length === 10) {
        formattedPhone = `91${formattedPhone}`;
      }

      // Meta official Authentication template payload
      const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: formattedPhone,
        type: "template",
        template: {
          name: templateName,
          language: { code: process.env.WHATSAPP_TEMPLATE_LANG || "en_US" },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: code,
                },
              ],
            },
            {
              type: "button",
              sub_type: "url",
              index: "0",
              parameters: [
                {
                  type: "text",
                  text: code,
                },
              ],
            },
          ],
        },
      };

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok && data.messages?.[0]?.id) {
        return {
          success: true,
          messageId: data.messages[0].id,
          provider: this.providerType,
        };
      }

      return {
        success: false,
        error: data.error?.message || "Failed to send Meta template message",
        provider: this.providerType,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Network error sending template OTP",
        provider: this.providerType,
      };
    }
  }
}
