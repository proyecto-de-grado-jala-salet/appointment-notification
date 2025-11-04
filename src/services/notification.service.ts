// src/services/notification.service.ts
import * as cron from 'node-cron';
import { DatabaseService } from './database.service';
import { WhatsAppService } from './whatsapp.service';
import { config } from '../config/config';

export class NotificationService {
  private dbService: DatabaseService;
  private whatsappService: WhatsAppService;
  private isRunning: boolean = false;

  constructor() {
    this.dbService = new DatabaseService();
    this.whatsappService = new WhatsAppService();
  }

  start(): void {
    console.log("🚀 Iniciando servicio de notificaciones...");

    // Verificar cada minuto
    cron.schedule(config.notification.checkInterval, async () => {
      if (!this.isRunning) {
        await this.checkUpcomingSessions();
      }
    });

    console.log("✅ Servicio de notificaciones programado");
  }

  private async checkUpcomingSessions(): Promise<void> {
    this.isRunning = true;

    try {
      console.log("🔍 Buscando sesiones próximas...");
      const upcomingSessions = await this.dbService.getUpcomingSessions();

      console.log(
        `📊 Encontradas ${upcomingSessions.length} sesiones por notificar`
      );

      for (const sessionData of upcomingSessions) {
        try {
          // Enviar notificación por WhatsApp (SOLO TEXTO CON LINK)
          await this.whatsappService.send24HourReminder(
            sessionData.patient.mobilenumber,
            sessionData.patient.names,
            sessionData.specialist.names +
              " " +
              sessionData.specialist.lastnamepaternal,
            sessionData.session.startSessionDateTime
          );

          // Marcar como notificada en la tabla NotificationLog
          await this.dbService.markAsNotified(sessionData.session.id);

          console.log(
            `✅ Notificación procesada para: ${sessionData.patient.names}`
          );

          // Pequeña pausa para no saturar la API de WhatsApp
          await this.delay(1000);
        } catch (error) {
          console.error(
            `❌ Error procesando sesión ${sessionData.session.id}:`,
            error
          );
        }
      }
    } catch (error) {
      console.error("❌ Error en checkUpcomingSessions:", error);
    } finally {
      this.isRunning = false;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async stop(): Promise<void> {
    await this.dbService.close();
    console.log("🛑 Servicio de notificaciones detenido");
  }
}