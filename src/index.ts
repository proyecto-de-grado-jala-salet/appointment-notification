// src/index.ts
import { NotificationService } from './services/notification.service';
import { DatabaseService } from './services/database.service';

class Application {
  private notificationService: NotificationService;
  private dbService: DatabaseService;

  constructor() {
    this.dbService = new DatabaseService();
    this.notificationService = new NotificationService();
  }

  async start(): Promise<void> {
    console.log('🏥 E-Dukate Notification Service starting...');
    
    try {
      // Primero verificar/crear la tabla
      console.log('🔧 Verificando configuración de base de datos...');
      await this.dbService.verifyNotificationTable();
      
      // Pequeña pausa para ver los resultados
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Configurar manejadores de señales para shutdown graceful
      process.on('SIGINT', this.shutdown.bind(this));
      process.on('SIGTERM', this.shutdown.bind(this));
      
      // Iniciar el servicio de notificaciones
      console.log('🚀 Iniciando servicio de notificaciones...');
      this.notificationService.start();
      
      console.log('✅ E-Dukate Notification Service started successfully');
      console.log('📌 El servicio está corriendo y verificará sesiones periódicamente');
    } catch (error) {
      console.error('❌ Error fatal durante el inicio:', error);
      process.exit(1);
    }
  }

  private async shutdown(): Promise<void> {
    console.log('\n🛑 Shutting down notification service...');
    try {
      await this.notificationService.stop();
      await this.dbService.close();
      console.log('✅ Service shutdown completed');
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
    }
    process.exit(0);
  }
}

// Iniciar aplicación
const app = new Application();
app.start();