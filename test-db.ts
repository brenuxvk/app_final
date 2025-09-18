import { query } from "./lib/db";

async function main() {
  console.log("Iniciando teste...");
  try {
    const result = await query({ query: "SELECT 1 + 1 AS result" });
    console.log("Resultado do banco:", result);
  } catch (error) {
    console.error("Erro ao testar DB:", error);
  }
}

main();