import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função para definir a cor e o status do AQI
export const getAQIStatus = (aqi: number) => {
  if (aqi <= 50)
    return { label: "Excelente", color: "bg-green-600" }
  if (aqi <= 100) 
    return { label: "Bom", color: "bg-green-500" }
  if (aqi <= 150)
    return { label: "Moderado", color: "bg-yellow-500" }
  return { label: "Ruim", color: "bg-red-500" }
}

// Função para calcular o AQI (simplificado) com base no valor de CO₂ (ou outro poluente)
export function getAqiInfo(value: string | null | undefined) {
  // Retorna um valor padrão se o dado não existir
  if (value === null || value === undefined) {
    return {
      index: 0,
    };
  }

  // Converte o valor do banco (que é String) para Número
  const numericValue = parseFloat(value);
  if (isNaN(numericValue)) {
    return { index: 0 };
  }

  let aqi = 0;
  
  // Fórmula de exemplo para converter o valor para uma escala de AQI
  // Você pode ajustar estes valores conforme a necessidade do seu projeto
  if (numericValue <= 400) { // Nível ideal
    aqi = (numericValue / 400) * 50;
  } else if (numericValue <= 1000) { // Aceitável
    aqi = 50 + ((numericValue - 400) / 600) * 50;
  } else if (numericValue <= 2000) { // Ruim para sensíveis
    aqi = 100 + ((numericValue - 1000) / 1000) * 50;
  } else { // Ruim para todos
    aqi = 150 + ((numericValue - 2000) / 2000) * 50;
  }

  const finalAqi = Math.min(Math.round(aqi), 200);

  return {
    index: finalAqi,
  };
}