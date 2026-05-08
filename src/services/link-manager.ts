// src/services/link-manager.ts
import { config } from '../config/config';
import axios from 'axios';

export interface LinkPayload {
  messaging_product: 'whatsapp';
  to: string;
  type: 'interactive';
  interactive: {
    type: 'cta_url';
    body: {
      text: string;
    };
    action: {
      name: 'cta_url';
      parameters: {
        display_text: string;
        url: string;
      };
    };
  };
}

export class LinkManager {
  private phoneNumberId: string;
  private accessToken: string;

  constructor() {
    this.phoneNumberId = config.whatsapp.phoneNumberId;
    this.accessToken = config.whatsapp.accessToken;
  }

  /**
   * Envía un mensaje con un enlace CTA (Call To Action)
   * @param to Número de WhatsApp destino
   * @param text Texto del mensaje
   * @param displayText Texto que se muestra para el enlace
   * @param url URL a la que redirige
   * @returns Promise con la respuesta
   */
  async sendLinkMessage(
    to: string,
    text: string,
    displayText: string,
    url: string
  ): Promise<void> {
    try {
      const payload: LinkPayload = {
        messaging_product: "whatsapp",
        to: to,
        type: "interactive",
        interactive: {
          type: "cta_url",
          body: {
            text: text,
          },
          action: {
            name: "cta_url",
            parameters: {
              display_text: displayText,
              url: url,
            },
          },
        },
      };

      await this.sendToWhatsApp(payload);
      console.log(`✅ Enlace enviado a ${to}: ${displayText} -> ${url}`);
    } catch (error) {
      console.error("❌ Error enviando enlace:", error);
      throw error;
    }
  }

  private async sendToWhatsApp(payload: LinkPayload): Promise<void> {
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v24.0/${this.phoneNumberId}/messages`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      console.log("✅ Enlace enviado con éxito:", response.data);
    } catch (error: any) {
      console.error("❌ Error con axios:", error.message);
      if (error.response) {
        console.error("📋 Detalles del error API:", error.response.data);
      }
      throw error;
    }
  }
}