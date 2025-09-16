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

// Função para calcular o AQI (simplificado) com base no valor de CO₂
export function getAqiInfo(co2Value: number | null | undefined) {
  if (co2Value === null || co2Value === undefined) {
    return { index: 0 };
  }

  let aqi = 0;
  
  // Fórmula de exemplo para converter ppm de CO₂ para uma escala de AQI
  if (co2Value <= 400) {
    aqi = (co2Value / 400) * 50;
  } else if (co2Value <= 1000) {
    aqi = 50 + ((co2Value - 400) / 600) * 50;
  } else if (co2Value <= 2000) {
    aqi = 100 + ((co2Value - 1000) / 1000) * 50;
  } else {
    aqi = 150 + ((co2Value - 2000) / 2000) * 50;
  }

  const finalAqi = Math.min(Math.round(aqi), 200);

  return {
    index: finalAqi,
  };
}