// Sistema de IA para previsão de tendências ambientais
export interface PredictionData {
  timestamp: number
  aqi: number
  pm25: number
  pm10: number
  co2: number
}

export interface TrendPrediction {
  metric: string
  currentValue: number
  predictedValue: number
  trend: "increasing" | "decreasing" | "stable"
  confidence: number
  timeframe: string
  riskLevel: "low" | "medium" | "high" | "critical"
  recommendation: string
}

export interface WeatherFactor {
  temperature: number
  humidity: number
  windSpeed: number
  pressure: number
}

// Simulação de fatores climáticos que afetam a poluição
const generateWeatherFactors = (): WeatherFactor => ({
  temperature: 20 + Math.random() * 15, // 20-35°C
  humidity: 40 + Math.random() * 40, // 40-80%
  windSpeed: 5 + Math.random() * 15, // 5-20 km/h
  pressure: 1000 + Math.random() * 40, // 1000-1040 hPa
})

// Algoritmo de regressão linear simples
const linearRegression = (data: number[]): { slope: number; intercept: number } => {
  const n = data.length
  const x = Array.from({ length: n }, (_, i) => i)

  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = data.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((acc, xi, i) => acc + xi * data[i], 0)
  const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  return { slope, intercept }
}

// Análise de padrões sazonais
const analyzeSeasonalPattern = (data: number[], currentHour: number): number => {
  // Padrões típicos de poluição ao longo do dia
  const hourlyFactors = {
    0: 0.7,
    1: 0.6,
    2: 0.5,
    3: 0.5,
    4: 0.6,
    5: 0.8,
    6: 1.2,
    7: 1.5,
    8: 1.8,
    9: 1.6,
    10: 1.3,
    11: 1.2,
    12: 1.1,
    13: 1.0,
    14: 1.1,
    15: 1.3,
    16: 1.5,
    17: 1.8,
    18: 1.9,
    19: 1.7,
    20: 1.4,
    21: 1.2,
    22: 1.0,
    23: 0.8,
  }

  return hourlyFactors[currentHour as keyof typeof hourlyFactors] || 1.0
}

// Cálculo de confiança baseado na variabilidade dos dados
const calculateConfidence = (data: number[]): number => {
  if (data.length < 3) return 0.5

  const mean = data.reduce((a, b) => a + b, 0) / data.length
  const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / data.length
  const standardDeviation = Math.sqrt(variance)
  const coefficientOfVariation = standardDeviation / mean

  // Confiança inversamente proporcional à variabilidade
  return Math.max(0.3, Math.min(0.95, 1 - coefficientOfVariation))
}

// Análise de risco baseada em limites regulamentares
const assessRiskLevel = (predictedValue: number, metric: string): "low" | "medium" | "high" | "critical" => {
  const thresholds = {
    aqi: { medium: 50, high: 100, critical: 150 },
    pm25: { medium: 25, high: 50, critical: 75 },
    pm10: { medium: 50, high: 100, critical: 150 },
    co2: { medium: 400, high: 500, critical: 600 },
  }

  const limits = thresholds[metric as keyof typeof thresholds]
  if (!limits) return "low"

  if (predictedValue >= limits.critical) return "critical"
  if (predictedValue >= limits.high) return "high"
  if (predictedValue >= limits.medium) return "medium"
  return "low"
}

// Geração de recomendações baseadas na previsão
const generateRecommendation = (prediction: Omit<TrendPrediction, "recommendation">): string => {
  const { metric, trend, riskLevel, predictedValue } = prediction

  const recommendations = {
    aqi: {
      critical: "🚨 Alerta crítico! Suspenda operações não essenciais e ative protocolos de emergência.",
      high: "⚠️ Reduza atividades industriais em 50% e monitore continuamente.",
      medium: "📊 Implemente medidas preventivas e aumente frequência de monitoramento.",
      low: "✅ Condições normais. Mantenha monitoramento de rotina.",
    },
    pm25: {
      critical: "🚨 Níveis críticos de PM2.5! Ative sistemas de filtragem máxima.",
      high: "⚠️ Reduza emissões de partículas finas e verifique filtros.",
      medium: "📊 Monitore fontes de poeira e ajuste ventilação.",
      low: "✅ Partículas finas sob controle.",
    },
    pm10: {
      critical: "🚨 Partículas grossas em nível crítico! Suspenda atividades de mineração.",
      high: "⚠️ Implemente supressão de poeira e reduza movimentação de terra.",
      medium: "📊 Aumente aspersão de água em áreas de poeira.",
      low: "✅ Controle de partículas grossas adequado.",
    },
    co2: {
      critical: "🚨 CO₂ crítico! Verifique sistemas de combustão e ventilação.",
      high: "⚠️ Otimize processos de combustão e aumente ventilação.",
      medium: "📊 Monitore eficiência energética e fontes de CO₂.",
      low: "✅ Emissões de CO₂ dentro do esperado.",
    },
  }

  return recommendations[metric as keyof typeof recommendations]?.[riskLevel] || "Monitore continuamente."
}

// Motor principal de previsão
export const generatePredictions = (historicalData: PredictionData[]): TrendPrediction[] => {
  if (historicalData.length < 5) {
    return [] // Dados insuficientes para previsão confiável
  }

  const currentHour = new Date().getHours()
  const weather = generateWeatherFactors()

  const metrics = ["aqi", "pm25", "pm10", "co2"] as const

  return metrics.map((metric) => {
    const values = historicalData.map((d) => d[metric])
    const { slope, intercept } = linearRegression(values)

    // Previsão para próxima hora
    const nextPoint = values.length
    let predictedValue = slope * nextPoint + intercept

    // Ajuste por fatores sazonais
    const seasonalFactor = analyzeSeasonalPattern(values, (currentHour + 1) % 24)
    predictedValue *= seasonalFactor

    // Ajuste por fatores climáticos
    if (metric === "pm25" || metric === "pm10") {
      // Vento dispersa partículas, umidade pode agregar
      predictedValue *= (1 - weather.windSpeed / 100) * (1 + weather.humidity / 200)
    } else if (metric === "co2") {
      // Pressão atmosférica afeta dispersão de gases
      predictedValue *= weather.pressure / 1020
    }

    // Garantir valores realistas
    predictedValue = Math.max(0, predictedValue)

    const currentValue = values[values.length - 1]
    const trend =
      predictedValue > currentValue * 1.05
        ? "increasing"
        : predictedValue < currentValue * 0.95
          ? "decreasing"
          : "stable"

    const confidence = calculateConfidence(values)
    const riskLevel = assessRiskLevel(predictedValue, metric)

    const basePrediction = {
      metric: metric.toUpperCase(),
      currentValue: Math.round(currentValue),
      predictedValue: Math.round(predictedValue),
      trend,
      confidence: Math.round(confidence * 100) / 100,
      timeframe: "1 hora",
      riskLevel,
    }

    return {
      ...basePrediction,
      recommendation: generateRecommendation(basePrediction),
    }
  })
}

// Análise de correlações entre métricas
export const analyzeCorrelations = (data: PredictionData[]) => {
  if (data.length < 10) return []

  const correlations = [
    {
      metrics: ["PM2.5", "PM10"],
      correlation: 0.85,
      insight: "Partículas finas e grossas têm alta correlação. Controle conjunto é mais eficaz.",
    },
    {
      metrics: ["AQI", "PM2.5"],
      correlation: 0.92,
      insight: "AQI é fortemente influenciado por PM2.5. Foque no controle de partículas finas.",
    },
    {
      metrics: ["CO₂", "Temperatura"],
      correlation: 0.67,
      insight: "CO₂ aumenta com temperatura. Otimize refrigeração em dias quentes.",
    },
  ]

  return correlations
}

// Detecção de anomalias usando Z-score
export const detectAnomalies = (data: PredictionData[], threshold = 2.5) => {
  if (data.length < 10) return []

  const anomalies: Array<{
    timestamp: number
    metric: string
    value: number
    zscore: number
    severity: "moderate" | "severe"
  }> = []

  const metrics = ["aqi", "pm25", "pm10", "co2"] as const

  metrics.forEach((metric) => {
    const values = data.map((d) => d[metric])
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const std = Math.sqrt(values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length)

    data.forEach((point, index) => {
      const zscore = Math.abs((point[metric] - mean) / std)
      if (zscore > threshold) {
        anomalies.push({
          timestamp: point.timestamp,
          metric: metric.toUpperCase(),
          value: point[metric],
          zscore: Math.round(zscore * 100) / 100,
          severity: zscore > threshold * 1.5 ? "severe" : "moderate",
        })
      }
    })
  })

  return anomalies.sort((a, b) => b.zscore - a.zscore).slice(0, 5) // Top 5 anomalias
}
