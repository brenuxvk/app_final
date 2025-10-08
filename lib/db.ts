// ficheiro: lib/db.ts
import mysql from 'mysql2/promise';

export async function query({ query, values = [] }: { query: string, values?: any[] }) {
  const connectionString = process.env.DATABASE_URL;

  // A CORREÇÃO ESTÁ AQUI:
  // Verificamos se a connectionString foi encontrada. Se não, lançamos um erro.
  if (!connectionString) {
    throw new Error("A variável de ambiente DATABASE_URL não está definida ou não foi encontrada.");
  }

  let connection;
  try {
    // A partir daqui, o TypeScript sabe que connectionString é definitivamente uma string.
    connection = await mysql.createConnection(connectionString);
    
    const [results] = await connection.execute(query, values);
    
    await connection.end();
    
    return results;
  } catch (error) {
    console.error("ERRO NA QUERY DO BANCO DE DADOS:", error);
    if (connection) {
      await connection.end();
    }
    throw new Error('Falha ao comunicar com o banco de dados.');
  }
}