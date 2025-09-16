"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState, useEffect, useCallback } from "react"
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Cloud,
  MapPin,
  Settings,
  TrendingDown,
  TrendingUp,
  Eye,
  Zap,
  Download,
  RefreshCw,
  Filter,
  Shield,
  Clock,
  LogOut,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts"
import PredictionPanel from "./components/prediction-panel"
import type { PredictionData } from "./utils/prediction-ai"

// Função para gerar dados dinâmicos
const generateRandomData = () => {
  const baseAQI = 65 + Math.random() * 30 // AQI entre 65-95
  const basePM25 = 35 + Math.random() * 25 // PM2.5 entre 35-60
  const basePM10 = 45 + Math.random() * 20 // PM10 entre 45-65
  const baseCO2 = 420 + Math.random() * 50 // CO2 entre 420-470

  return {
    aqi: Math.round(baseAQI),
    pm25: Math.round(basePM25),
    pm10: Math.round(basePM10),
    co2: Math.round(baseCO2),
  }
}

// Função para gerar dados históricos das últimas 24h
const generateHistoricalData = () => {
  const data = []
  const now = new Date()

  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000)
    const timeStr = time.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    const randomData = generateRandomData()

    data.push({
      time: timeStr,
      pm25: randomData.pm25,
      pm10: randomData.pm10,
      co2: randomData.co2,
      aqi: randomData.aqi,
    })
  }

  return data
}

// Função para gerar status dos sensores dinamicamente
const generateSensorStatus = () => {
  const locations = ["Pedreira Norte", "Usina Siderúrgica", "Fábrica de Cimento", "Mineradora Sul", "Indústria Química"]

  return locations.map((location, index) => {
    const data = generateRandomData()
    const isOnline = Math.random() > 0.1 // 90% chance de estar online
    const lastUpdateMinutes = Math.floor(Math.random() * 10) + 1

    return {
      id: `S00${index + 1}`,
      location,
      status: isOnline ? "online" : "offline",
      aqi: isOnline ? data.aqi : 0,
      pm25: isOnline ? data.pm25 : 0,
      pm10: isOnline ? data.pm10 : 0,
      lastUpdate: isOnline ? `${lastUpdateMinutes} min` : "2h",
    }
  })
}

const getAQIStatus = (aqi: number) => {
  if (aqi <= 50)
    return { label: "Excelente", color: "bg-green-600", textColor: "text-green-700", bgColor: "bg-green-50" }
  if (aqi <= 100) return { label: "Bom", color: "bg-green-500", textColor: "text-green-600", bgColor: "bg-green-50" }
  if (aqi <= 150)
    return { label: "Moderado", color: "bg-yellow-500", textColor: "text-yellow-600", bgColor: "bg-yellow-50" }
  return { label: "Ruim", color: "bg-red-500", textColor: "text-red-700", bgColor: "bg-red-50" }
}

export default function PollutionDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [currentData, setCurrentData] = useState(generateRandomData())
  const [sensorData, setSensorData] = useState(generateHistoricalData())
  const [sensors, setSensors] = useState(generateSensorStatus())
  const [isRealTimeActive, setIsRealTimeActive] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Converter dados para formato de IA
  const predictionData: PredictionData[] = sensorData.map((point, index) => ({
    timestamp: Date.now() - (sensorData.length - index - 1) * 60 * 60 * 1000,
    aqi: point.aqi,
    pm25: point.pm25,
    pm10: point.pm10,
    co2: point.co2,
  }))

  // Atualizar relógio a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Atualizar dados em tempo real
  useEffect(() => {
    if (!isRealTimeActive) return

    const interval = setInterval(() => {
      // Atualizar dados atuais
      setCurrentData(generateRandomData())

      // Atualizar sensores
      setSensors(generateSensorStatus())

      // Adicionar novo ponto aos dados históricos
      setSensorData((prevData) => {
        const newData = [...prevData]
        const now = new Date()
        const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
        const randomData = generateRandomData()

        // Remover o primeiro item e adicionar novo no final
        newData.shift()
        newData.push({
          time: timeStr,
          pm25: randomData.pm25,
          pm10: randomData.pm10,
          co2: randomData.co2,
          aqi: randomData.aqi,
        })

        return newData
      })

      setLastUpdate(new Date())
    }, 5000) // Atualizar a cada 5 segundos

    return () => clearInterval(interval)
  }, [isRealTimeActive])

  // Função para alternar modo tempo real
  const toggleRealTime = useCallback(() => {
    setIsRealTimeActive((prev) => !prev)
  }, [])

  // Função para atualização manual
  const handleManualUpdate = useCallback(() => {
    setCurrentData(generateRandomData())
    setSensors(generateSensorStatus())
    setSensorData(generateHistoricalData())
    setLastUpdate(new Date())
  }, [])

  const currentAQI = currentData.aqi
  const aqiStatus = getAQIStatus(currentAQI)
  const onlineSensors = sensors.filter((s) => s.status === "online").length

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-emerald-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-emerald-500 mr-3" />
              <h1 className="text-xl font-semibold text-white">AntiPollucion</h1>
              <div className="flex items-center ml-6 text-emerald-300">
                <Clock className="h-4 w-4 mr-2" />
                <span className="text-sm font-mono">{currentTime.toLocaleTimeString("pt-BR")}</span>
                <div className="ml-4 text-xs">
                  <span className="text-gray-400">Última atualização: </span>
                  <span>{lastUpdate.toLocaleTimeString("pt-BR")}</span>
                </div>
                {isRealTimeActive && (
                  <div className="ml-2 flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="ml-1 text-xs text-green-400">LIVE</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                className="border-emerald-300 text-emerald-300 hover:bg-emerald-300 hover:text-black bg-transparent"
                onClick={handleManualUpdate}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`border-emerald-300 text-emerald-300 hover:bg-emerald-300 hover:text-black bg-transparent ${
                  isRealTimeActive ? "bg-emerald-300 text-black" : ""
                }`}
                onClick={toggleRealTime}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRealTimeActive ? "animate-spin" : ""}`} />
                {isRealTimeActive ? "Parar Tempo Real" : "Tempo Real"}
              </Button>
              <Badge variant="outline" className="text-emerald-300 border-emerald-300 bg-black">
                <CheckCircle className="w-3 h-3 mr-1" />
                {onlineSensors}/{sensors.length} Sensores Online
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="border-emerald-300 text-emerald-300 hover:bg-emerald-300 hover:text-black bg-transparent"
              >
                <Settings className="w-4 h-4 mr-2" />
                Config
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-red-300 text-red-300 hover:bg-red-300 hover:text-black bg-transparent"
                onClick={() => window.location.reload()}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-emerald-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-400/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-600">Índice de Qualidade do Ar</CardTitle>
              <Activity className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{currentAQI}</div>
              <div className="flex items-center mt-2">
                <Badge className={`${aqiStatus.color} text-white hover:scale-105 transition-transform`}>
                  {aqiStatus.label}
                </Badge>
              </div>
              <Progress value={currentAQI} max={150} className="mt-3 bg-gray-200" />
            </CardContent>
          </Card>

          <Card className="bg-white border-emerald-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-400/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-600">PM2.5</CardTitle>
              <Cloud className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">
                {currentData.pm25} <span className="text-sm font-normal text-gray-400">μg/m³</span>
              </div>
              <div className="flex items-center text-sm text-red-400 mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +8% vs ontem
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-emerald-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-400/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-600">PM10</CardTitle>
              <Eye className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">
                {currentData.pm10} <span className="text-sm font-normal text-gray-400">μg/m³</span>
              </div>
              <div className="flex items-center text-sm text-green-400 mt-1">
                <TrendingDown className="w-3 h-3 mr-1" />
                -3% vs ontem
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-emerald-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-400/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-600">CO₂</CardTitle>
              <Zap className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">
                {currentData.co2} <span className="text-sm font-normal text-gray-400">ppm</span>
              </div>
              <div className="flex items-center text-sm text-yellow-400 mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +2% vs ontem
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertas */}
        <Card className="mb-8 border-emerald-200 bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-emerald-600 mr-2" />
                <CardTitle className="text-emerald-600">Alertas do Sistema</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-emerald-300 text-emerald-300 hover:bg-emerald-300 bg-transparent"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtrar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-emerald-200 hover:border-emerald-300 transition-all duration-300 cursor-pointer">
                <div>
                  <p className="font-medium text-black">Usina Siderúrgica - Sensor S002</p>
                  <p className="text-sm text-gray-400">AQI acima do limite recomendado (95)</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="destructive" className="hover:scale-105 transition-transform">
                    Alto
                  </Badge>
                  <Button variant="ghost" size="sm" className="text-emerald-500 hover:text-emerald-400">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-emerald-200 hover:border-emerald-300 transition-all duration-300 cursor-pointer">
                <div>
                  <p className="font-medium text-black">Sensor S004 - Offline</p>
                  <p className="text-sm text-gray-400">Sem comunicação há 2 horas</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="hover:scale-105 transition-transform">
                    Manutenção
                  </Badge>
                  <Button variant="ghost" size="sm" className="text-emerald-500 hover:text-emerald-400">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Painel de IA Preditiva */}
        <PredictionPanel historicalData={predictionData} isRealTimeActive={isRealTimeActive} />

        {/* Gráficos e Tabelas */}
        <Tabs defaultValue="trends" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full max-w-md grid-cols-3 bg-white border border-emerald-200">
              <TabsTrigger
                value="trends"
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-black text-emerald-600"
              >
                Tendências
              </TabsTrigger>
              <TabsTrigger
                value="sensors"
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-black text-emerald-600"
              >
                Sensores
              </TabsTrigger>
              <TabsTrigger
                value="map"
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-black text-emerald-600"
              >
                Mapa
              </TabsTrigger>
            </TabsList>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="border-emerald-300 text-emerald-300 hover:bg-emerald-300 hover:text-black bg-transparent"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-emerald-300 text-emerald-300 hover:bg-emerald-300 hover:text-black bg-transparent"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tempo Real
              </Button>
            </div>
          </div>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white border-emerald-200">
                <CardHeader>
                  <CardTitle className="text-emerald-600">Qualidade do Ar - Últimas 24h</CardTitle>
                  <CardDescription className="text-gray-400">
                    Índice de Qualidade do Ar ao longo do tempo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={sensorData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #10B981",
                          borderRadius: "8px",
                          color: "#000000",
                        }}
                      />
                      <Area type="monotone" dataKey="aqi" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white border-emerald-200">
                <CardHeader>
                  <CardTitle className="text-emerald-600">Partículas PM2.5 e PM10</CardTitle>
                  <CardDescription className="text-gray-400">Concentração de partículas (μg/m³)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={sensorData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                      <XAxis dataKey="time" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #10B981",
                          borderRadius: "8px",
                          color: "#000000",
                        }}
                      />
                      <Line type="monotone" dataKey="pm25" stroke="#ef4444" strokeWidth={2} />
                      <Line type="monotone" dataKey="pm10" stroke="#f97316" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white border-emerald-200">
              <CardHeader>
                <CardTitle className="text-emerald-600">Níveis de CO₂</CardTitle>
                <CardDescription className="text-gray-400">Concentração de dióxido de carbono (ppm)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sensorData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                    <XAxis dataKey="time" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #10B981",
                        borderRadius: "8px",
                        color: "#000000",
                      }}
                    />
                    <Bar dataKey="co2" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sensors">
            <Card>
              <CardHeader>
                <CardTitle>Status dos Sensores</CardTitle>
                <CardDescription>Monitoramento em tempo real de todos os sensores</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sensor ID</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>AQI</TableHead>
                      <TableHead>PM2.5</TableHead>
                      <TableHead>PM10</TableHead>
                      <TableHead>Última Atualização</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sensors.map((sensor) => (
                      <TableRow key={sensor.id}>
                        <TableCell className="font-medium">{sensor.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                            {sensor.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={sensor.status === "online" ? "default" : "destructive"}>
                            {sensor.status === "online" ? "Online" : "Offline"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="font-medium">{sensor.aqi}</span>
                            <Badge className={`ml-2 ${getAQIStatus(sensor.aqi).color} text-white`} variant="secondary">
                              {getAQIStatus(sensor.aqi).label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{sensor.pm25} μg/m³</TableCell>
                        <TableCell>{sensor.pm10} μg/m³</TableCell>
                        <TableCell className="text-muted-foreground">{sensor.lastUpdate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map">
            <Card>
              <CardHeader>
                <CardTitle>Mapa dos Sensores</CardTitle>
                <CardDescription>Localização geográfica e status dos sensores de poluição</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Mapa Interativo</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Integração com Google Maps ou Mapbox
                      <br />
                      mostrando localização dos sensores em tempo real
                    </p>
                  </div>
                </div>

                {/* Grid de sensores como alternativa ao mapa */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  {sensors.map((sensor) => (
                    <Card key={sensor.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{sensor.id}</h4>
                          <Badge variant={sensor.status === "online" ? "default" : "destructive"}>
                            {sensor.status === "online" ? "Online" : "Offline"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{sensor.location}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>AQI:</span>
                            <span className="font-medium">{sensor.aqi}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>PM2.5:</span>
                            <span>{sensor.pm25} μg/m³</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>PM10:</span>
                            <span>{sensor.pm10} μg/m³</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
