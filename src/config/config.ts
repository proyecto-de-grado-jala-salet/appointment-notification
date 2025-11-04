// src/config/config.ts
export const config = {
  database: {
    host: "shortline.proxy.rlwy.net",
    port: 40013,
    database: "railway",
    user: "postgres",
    password: "xlBFQtBPbXEdtmrgIyueIyOFlNnZmVBI",
  },
  whatsapp: {
    accessToken: "EAAUghei0XtMBPYAwKf4sOqnpRj3yRdqkPsMZBa97Ffb9YIzZAH25UaPWCNKd1ZCsbPxwnBQY8DgK9LUZAH5vdygfOGeSf4znHfTsZCEtYRKSYRPBs1kIVq7YU7zxyIOUUcdEWszzvQgl8vlzmtMHvwA0BfnPiNGYVSBUiZANMIxDvoRqoXU0xfXXBHADsBVG5LdQZDZD", // Tu token de Meta
    phoneNumberId: "831591943365796", // Tu phone number ID
  },
  notification: {
    checkInterval: "* * * * *", // Cada minuto
    reminderHours: 24, // ← CAMBIADO de minutos a horas
    reminderMinutes: 0
  },
};