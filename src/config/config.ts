// src/config/config.ts
export const config = {
  database: {
    host: "switchyard.proxy.rlwy.net",
    port: 51836,
    database: "railway",
    user: "postgres",
    password: "IkHFPXbyXyDdmVOXQDnfAOKsqBwJXaCP",
  },
  whatsapp: {
    accessToken: "EAAUghei0XtMBPYAwKf4sOqnpRj3yRdqkPsMZBa97Ffb9YIzZAH25UaPWCNKd1ZCsbPxwnBQY8DgK9LUZAH5vdygfOGeSf4znHfTsZCEtYRKSYRPBs1kIVq7YU7zxyIOUUcdEWszzvQgl8vlzmtMHvwA0BfnPiNGYVSBUiZANMIxDvoRqoXU0xfXXBHADsBVG5LdQZDZD", // Tu token de Meta
    phoneNumberId: "1125367967319968", // Tu phone number ID
  },
  notification: {
    checkInterval: "* * * * *", // Cada minuto
    reminderHours: 24, // ← CAMBIADO de minutos a horas
    reminderMinutes: 0
  },
};