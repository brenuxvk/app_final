import mysql from "mysql2/promise";

let connection: any;

export async function query({ query, values = [] }: { query: string; values?: any[] }) {
  try {
    if (!connection) {
      console.log("🔌 Tentando conectar ao MySQL com URL:", process.env.DATABASE_URL);
      connection = await mysql.createConnection(process.env.DATABASE_URL as string);
      console.log("✅ Conectado ao banco MySQL");
    }

    const [results] = await connection.execute(query, values);
    return results;
  } catch (error) {
    console.error("❌ Erro no query:", error);
    throw error;
  }
}