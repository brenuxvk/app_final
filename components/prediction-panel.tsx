"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useEffect } from "react"
import { Brain, TrendingUp, TrendingDown, Minus, BarChart3, Activity, RefreshCw } from "lucide-react"
import { generatePredictions, analyzeCorrelations, type PredictionData, type TrendPrediction } from "./prediction-ai"

interface PredictionPanelProps {
  historicalData: PredictionData[]
  isRealTimeActive: boolean
}

export default function PredictionPanel({ historicalData, isRealTimeActive }: PredictionPanelProps) {
  const [predictions, setPredictions] = useState<TrendPrediction[]>([])
  const [correlations, setCorrelations] = useState<any[]>([])
  const [lastAnalysis, setLastAnalysis] = useState<Date>(new Date())

  const runAIAnalysis = () => {
    if (historicalData.length < 5) return

    const newPredictions = generatePredictions(historicalData)
    const newCorrelations = analyzeCorrelations(historicalData)

    setPredictions(newPredictions)
    setCorrelations(newCorrelations)
    setLastAnalysis(new Date())
  }

  useEffect(() => {
    runAIAnalysis()
  }, [historicalData])

  useEffect(() => {
    if (!isRealTimeActive) return

    const interval = setInterval(() => {
      runAIAnalysis()
    }, 10000)

    return () => clearInterval(interval)
  }, [isRealTimeActive, historicalData])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="w-4 h-4 text-red-500" />
      case "decreasing":
        return <TrendingDown className="w-4 h-4 text-green-500" />
      default:
        return <Minus className="w-4 h-4 text-yellow-500" />
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "bg-red-600"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      default:
        return "bg-green-500"
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600 dark:text-green-400"
    if (confidence >= 0.6) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  if (historicalData.length < 5) {
    return (
      <Card className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm border-emerald-200 dark:border-emerald-700 mb-8">
        <CardHeader>
          <div className="flex items-center">
            <Brain className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mr-2" />
            <CardTitle className="text-emerald-600 dark:text-emerald-400">IA Preditiva</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">Coletando dados para análise...</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
              Aguarde alguns minutos para previsões precisas
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm border-emerald-200 dark:border-emerald-700 mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mr-2" />
            <CardTitle className="text-emerald-600 dark:text-emerald-400">IA Preditiva</CardTitle>
            {isRealTimeActive && (
              <div className="ml-3 flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="ml-1 text-xs text-blue-600 dark:text-blue-400">ANALISANDO</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Última análise: {lastAnalysis.toLocaleTimeString("pt-BR")}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={runAIAnalysis}
              className="border-emerald-300 dark:border-emerald-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 bg-transparent"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Analisar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="predictions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 bg-emerald-50 dark:bg-emerald-900/20">
            <TabsTrigger
              value="predictions"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              Previsões
            </TabsTrigger>
            <TabsTrigger
              value="correlations"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              Correlações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="predictions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {predictions.map((prediction, index) => (
                <Card key={index} className="border-l-4 border-l-emerald-500 bg-white dark:bg-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">{prediction.metric}</h4>
                        {getTrendIcon(prediction.trend)}
                      </div>
                      <Badge className={`${getRiskColor(prediction.riskLevel)} text-white`}>
                        {prediction.riskLevel.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-300">Atual:</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {prediction.currentValue}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-300">Previsto ({prediction.timeframe}):</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {prediction.predictedValue}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-300">Confiança:</span>
                        <span className={`font-medium ${getConfidenceColor(prediction.confidence)}`}>
                          {Math.round(prediction.confidence * 100)}%
                        </span>
                      </div>
                    </div>

                    <Progress value={prediction.confidence * 100} className="mb-3 h-2" />

                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {prediction.recommendation}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="correlations" className="space-y-4">
            {correlations.length > 0 ? (
              <div className="space-y-3">
                {correlations.map((corr, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500 bg-white dark:bg-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {corr.metrics.join(" ↔ ")}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-400"
                        >
                          {Math.round(corr.correlation * 100)}% correlação
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{corr.insight}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">Analisando correlações...</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
