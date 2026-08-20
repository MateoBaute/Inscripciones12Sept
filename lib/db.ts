import mysql from "mysql2/promise";

const caCert = process.env.db_ca_cert_base64
  ? Buffer.from(process.env.db_ca_cert_base64, "base64").toString("utf-8")
  : undefined;
  
const globalForDatabase = globalThis as unknown as {
  pool?: mysql.Pool;
};

export const db = globalForDatabase.pool ?? mysql.createPool({
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "inscriptos",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: caCert
    ? {
        ca: caCert,
        rejectUnauthorized: true,
      }
    : undefined,
});

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.pool = db;
}