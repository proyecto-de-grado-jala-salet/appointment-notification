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
    
    // Primero verificar que la tabla existe
    console.log('🔧 Verificando configuración...');
    await this.dbService.verifyNotificationTable();
    
    // Pequeña pausa para ver los resultados
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Luego iniciar el servicio normal
    process.on('SIGINT', this.shutdown.bind(this));
    process.on('SIGTERM', this.shutdown.bind(this));
    
    this.notificationService.start();
    
    console.log('✅ E-Dukate Notification Service started successfully');
  }

  private async shutdown(): Promise<void> {
    console.log('\n🛑 Shutting down notification service...');
    await this.notificationService.stop();
    process.exit(0);
  }
}

// Iniciar aplicación
const app = new Application();
app.start();