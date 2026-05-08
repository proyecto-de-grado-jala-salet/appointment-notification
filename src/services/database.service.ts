import { Pool } from 'pg';
import { config } from '../config/config';
import { Appointment, Patient, Specialist, ScheduledSession } from '../interfaces/appointment.interface';

export class DatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool(config.database);
  }

  // Método para asegurar que la tabla NotificationLog existe
  async ensureNotificationTableExists(): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS "NotificationLog" (
          "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "scheduledsessionid" VARCHAR(255) NOT NULL,
          "notifiedat" TIMESTAMP NOT NULL DEFAULT NOW(),
          "createdat" TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_notification_log_scheduledsessionid 
      ON "NotificationLog"("scheduledsessionid");
    `;

    try {
      await this.pool.query(createTableSQL);
      console.log('✅ Tabla NotificationLog verificada/creada exitosamente');
    } catch (error: any) {
      console.error('❌ Error creando/verificando tabla NotificationLog:', error.message);
      throw error;
    }
  }

  async getUpcomingSessions(): Promise<
    {
      session: ScheduledSession;
      appointment: Appointment;
      patient: Patient;
      specialist: Specialist;
    }[]
  > {
    // Asegurar que la tabla existe antes de la consulta
    await this.ensureNotificationTableExists();

    const totalReminderMinutes =
      config.notification.reminderHours * 60 +
      config.notification.reminderMinutes;

    const query = `
    SELECT 
      ss."Id" as session_id,
      ss."AppointmentId" as "appointmentId",
      ss."StartSessionDateTime" as "startSessionDateTime",
      ss."EndSessionDateTime" as "endSessionDateTime",
      ss."Status" as session_status,
      a."Id" as appointment_id,
      a."PatientId" as "patientId",
      a."SpecialistId" as "specialistId",
      a."SessionCount" as "sessionCount",
      p."Id" as patient_id,
      p."Names" as patient_names,
      p."LastNamePaternal" as patient_lastnamepaternal,
      p."LastNameMaternal" as patient_lastnamematernal,
      p."MobileNumber" as patient_mobile,
      s."Id" as specialist_id,
      s."Names" as specialist_names,
      s."LastNamePaternal" as specialist_lastnamepaternal
    FROM "ScheduledSessions" ss
    INNER JOIN "Appointments" a ON ss."AppointmentId" = a."Id"
    INNER JOIN "Patients" p ON a."PatientId" = p."Id"
    INNER JOIN "Specialists" s ON a."SpecialistId" = s."Id"
    WHERE ss."StartSessionDateTime" BETWEEN NOW() AND NOW() + INTERVAL '${totalReminderMinutes} minutes'
    AND ss."Status" IN ('Scheduled', 'Confirmed')
    AND NOT EXISTS (
      SELECT 1 FROM "NotificationLog" nl 
      WHERE nl."scheduledsessionid" = ss."Id"
    )
  `;

    console.log(
      `🔍 Buscando sesiones en próximas ${config.notification.reminderHours}h ${config.notification.reminderMinutes}min...`
    );

    const result = await this.pool.query(query);

    console.log(`📊 Sesiones encontradas: ${result.rows.length}`);

    if (result.rows.length > 0) {
      console.log("📝 Sesiones por notificar:");
      result.rows.forEach((row: any, index: number) => {
        const sessionTime = new Date(row.startSessionDateTime);
        const timeLeft = Math.round(
          (sessionTime.getTime() - Date.now()) / (1000 * 60 * 60)
        );
        console.log(
          `   ${index + 1}. ${
            row.patient_names
          } - ${sessionTime.toLocaleString()} - En ${timeLeft} horas`
        );
      });
    }

    return result.rows.map((row) => ({
      session: {
        id: row.session_id,
        appointmentId: row.appointmentId,
        startSessionDateTime: new Date(row.startSessionDateTime),
        endSessionDateTime: new Date(row.endSessionDateTime),
        status: row.session_status,
      },
      appointment: {
        id: row.appointment_id,
        patientId: row.patientId,
        specialistId: row.specialistId,
        sessionCount: row.sessionCount,
        scheduledSessions: [],
      },
      patient: {
        id: row.patient_id,
        names: row.patient_names,
        lastnamepaternal: row.patient_lastnamepaternal,
        lastnamematernal: row.patient_lastnamematernal,
        mobilenumber: row.patient_mobile,
      },
      specialist: {
        id: row.specialist_id,
        names: row.specialist_names,
        lastnamepaternal: row.specialist_lastnamepaternal,
      },
    }));
  }

  async markAsNotified(sessionId: string): Promise<void> {
    try {
      // Asegurar que la tabla existe antes de insertar
      await this.ensureNotificationTableExists();
      
      const { randomUUID } = await import("crypto");
      const notificationId = randomUUID();

      const query = `
      INSERT INTO "NotificationLog" ("id", "scheduledsessionid", "notifiedat", "createdat")
      VALUES ($1, $2, NOW(), NOW())
    `;
      await this.pool.query(query, [notificationId, sessionId]);
      console.log(`✅ Notificación registrada para sesión ${sessionId}`);
    } catch (error: any) {
      console.error(`❌ Error registrando notificación:`, error.message);
      throw error;
    }
  }

  async verifyNotificationTable(): Promise<void> {
    try {
      console.log("🔍 Verificando tabla NotificationLog...");
      
      // Asegurar que la tabla existe antes de verificar
      await this.ensureNotificationTableExists();

      // Verificar si la tabla existe
      const tableExists = await this.pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'NotificationLog'
        );
      `);

      console.log(
        `✅ Tabla NotificationLog existe: ${tableExists.rows[0].exists}`
      );

      if (tableExists.rows[0].exists) {
        // Ver estructura
        const structure = await this.pool.query(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_name = 'NotificationLog' 
          ORDER BY ordinal_position;
        `);

        console.log("📋 Estructura de NotificationLog:");
        structure.rows.forEach((col: any) => {
          console.log(
            `   ${col.column_name} (${col.data_type}) - nullable: ${col.is_nullable}`
          );
        });

        // Ver registros existentes
        const records = await this.pool.query(
          'SELECT COUNT(*) as total FROM "NotificationLog"'
        );
        console.log(
          `📊 Registros en NotificationLog: ${records.rows[0].total}`
        );
      }
    } catch (error) {
      console.error("❌ Error verificando tabla:", error);
      throw error;
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}