// src/interfaces/appointment.interface.ts
export interface ScheduledSession {
  id: string;
  appointmentId: string;
  startSessionDateTime: Date;
  endSessionDateTime: Date;
  status: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  specialistId: string;
  sessionCount: number;
  scheduledSessions: ScheduledSession[];
}

export interface Patient {
  id: string;
  names: string;
  lastnamepaternal: string;
  lastnamematernal: string | null;
  mobilenumber: string;
}

export interface Specialist {
  id: string;
  names: string;
  lastnamepaternal: string;
}