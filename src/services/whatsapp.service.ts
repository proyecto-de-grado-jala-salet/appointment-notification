// src/services/whatsapp.service.ts
import axios from 'axios';
import { config } from '../config/config';
import { LinkManager, LinkPayload } from './link-manager'; // Asegúrate de importar correctamente

export class WhatsAppService {
  private phoneNumberId: string;
  private accessToken: string;
  private linkManager: LinkManager;

  constructor() {
    this.phoneNumberId = config.whatsapp.phoneNumberId;
    this.accessToken = config.whatsapp.accessToken;
    this.linkManager = new LinkManager();
  }

  async send24HourReminder(to: string, patientName: string, specialistName: string, sessionTime: Date): Promise<void> {
    const formattedDateTime = sessionTime.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Formatear el número de teléfono
    const formattedNumber = this.formatPhoneNumber(to);
    console.log(`📱 Intentando enviar a: ${to} -> Formateado: ${formattedNumber}`);

    // Texto del mensaje
    const messageText = `Hola ${patientName}! 😊

Te recordamos que tienes una cita programada:

👨‍⚕️ *Especialista:* ${specialistName}
📅 *Fecha y Hora:* ${formattedDateTime}

⏰ *Recordatorio:* Tu cita es en 24 horas.

¡Te esperamos! 🩺`;

    // URL de Google Maps
    const mapsUrl = "https://maps.app.goo.gl/QdcRCdB9MbaVmd4a7";
    const displayText = "📍 Ver Ubicación";

    try {
      console.log(`📤 Enviando mensaje con enlace a: ${formattedNumber}`);
      
      // Usar el LinkManager para enviar el mensaje con el botón de ubicación
      await this.linkManager.sendLinkMessage(
        formattedNumber,
        messageText,
        displayText,
        mapsUrl
      );

      console.log(`✅ Recordatorio de 24h con ubicación enviado a ${patientName}`);
      
    } catch (error: any) {
      console.error(`❌ Error enviando recordatorio de 24h:`, error.message);
      
      if (error.response) {
        console.error('📋 Detalles del error:', error.response.data);
        console.error('🔍 Código de error:', error.response.data.error?.code);
        console.error('💬 Mensaje:', error.response.data.error?.message);
      }
      
      throw error;
    }
  }

  // Método para formatear números telefónicos
  private formatPhoneNumber(phone: string): string {
    // Si el número ya tiene código de país, dejarlo como está
    if (phone.startsWith('591')) {
      return phone;
    }
    
    // Si es un número local boliviano, agregar código de país
    if (phone.length === 8 && !phone.startsWith('+')) {
      return `591${phone}`; // Código de Bolivia + número
    }
    
    // Si tiene +, removerlo (WhatsApp API no acepta +)
    if (phone.startsWith('+')) {
      return phone.substring(1);
    }
    
    return phone;
  }
}