import { IWhatsAppMessagingProvider } from "./whatsapp-provider.interface";
import { SessionTextWhatsAppProvider } from "./session-text-whatsapp.provider";
import { TemplateWhatsAppProvider } from "./template-whatsapp.provider";

export class WhatsAppProviderFactory {
  private static sessionProvider: IWhatsAppMessagingProvider | null = null;
  private static templateProvider: IWhatsAppMessagingProvider | null = null;

  static getProvider(): IWhatsAppMessagingProvider {
    const mode = process.env.WHATSAPP_PROVIDER_MODE?.toUpperCase();

    if (mode === "META_AUTHENTICATION_TEMPLATE") {
      if (!this.templateProvider) {
        this.templateProvider = new TemplateWhatsAppProvider();
      }
      return this.templateProvider;
    }

    // Default to the temporary/zero-cost Session Text provider
    if (!this.sessionProvider) {
      this.sessionProvider = new SessionTextWhatsAppProvider();
    }
    return this.sessionProvider;
  }
}
