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
  MapPin,
  TrendingUp,
  Eye,
  Zap,
  Download,
  RefreshCw,
  Filter,
  Shield,
  Clock,
  Moon,
  Sun,
  Maximize2,
  Minimize2,
} from "lucide-react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts"
import PredictionPanel from "../components/prediction-panel"
import { NotificationCenter } from "../components/notifications"
import { UserMenu } from "../components/user-menu"
import { useTheme } from "../contexts/theme-context"
import type { PredictionData } from "../components/prediction-ai"
import { MetricCardSkeleton } from "../components/loading-skeleton"
import { getAqiInfo, getAQIStatus } from "../lib/utils"

export default function PollutionDashboard({ onLogout }: { onLogout: () => void }) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [currentData, setCurrentData] = useState<any>(null)
  const [sensorData, setSensorData] = useState<any[]>([])
  const [sensors, setSensors] = useState<any[]>([])
  const [isRealTimeActive, setIsRealTimeActive] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [fullscreenChart, setFullscreenChart] = useState<string | null>(null)
  const { theme, toggleTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [currentRes, historicalRes, sensorsRes] = await Promise.all([
        fetch('/api/data/latest'),
        fetch('/api/data/historical'),
        fetch('/api/data/sensors')
      ]);

      if (!currentRes.ok || !historicalRes.ok || !sensorsRes.ok) {
        throw new Error('Falha ao buscar dados da API');
      }

      const current = await currentRes.json();
      const historical = await historicalRes.json();
      const sensorsData = await sensorsRes.json();

      setCurrentData(current);
      
      const aqiHistorical = historical.map((d: any) => ({
        ...d,
        aqi: getAqiInfo(d.co2).index,
        time: new Date(d.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      }));
      
      setSensorData(aqiHistorical);
      setSensors(sensorsData);
      setLastUpdate(new Date());

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    if (!isRealTimeActive) return;
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [isRealTimeActive, fetchData]);
  
  const toggleRealTime = useCallback(() => setIsRealTimeActive(prev => !prev), []);

  const handleManualUpdate = useCallback(() => {
    setIsLoading(true);
    fetchData();
  }, [fetchData]);

  if (isLoading || !currentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 dark:from-slate-900 dark:to-slate-800 p-8">
        <div className="max-w-7xl mx-auto animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  const aqiInfo = getAqiInfo(currentData?.co2);
  const aqiStatus = getAQIStatus(aqiInfo.index);
  const onlineSensors = sensors.filter((s) => s.status === "online").length;

  const predictionData: PredictionData[] = sensorData.map((point) => ({
    timestamp: new Date(point.timestamp).getTime(),
    aqi: point.aqi,
    pm25: 0,
    pm10: 0,
    co2: point.co2,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
       {fullscreenChart && (
        <div className="fixed inset-0 z-[10000] bg-black/80 flex items-center justify-center p-4">
          <Card className="w-full max-w-6xl h-[80vh] bg-slate-50 dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-emerald-600 dark:text-emerald-400">
                {fullscreenChart === "aqi" ? "Qualidade do Ar - Últimas 24h" : "Níveis de CO₂"}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFullscreenChart(null)}
                className="border-emerald-300 dark:border-emerald-600"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="h-full">
              <ResponsiveContainer width="100%" height="90%">
                {fullscreenChart === "aqi" ? (
                  <AreaChart data={sensorData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#374151" : "#d1d5db"} />
                    <XAxis dataKey="time" stroke={theme === "dark" ? "#9CA3AF" : "#6b7280"} />
                    <YAxis stroke={theme === "dark" ? "#9CA3AF" : "#6b7280"} />
                    <Tooltip contentStyle={{ backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff", border: "1px solid #10B981" }} />
                    <Area type="monotone" dataKey="aqi" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                  </AreaChart>
                ) : (
                  <BarChart data={sensorData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#374151" : "#d1d5db"} />
                    <XAxis dataKey="time" stroke={theme === "dark" ? "#9CA3AF" : "#6b7280"} />
                    <YAxis stroke={theme === "dark" ? "#9CA3AF" : "#6b7280"} />
                    <Tooltip contentStyle={{ backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff", border: "1px solid #10B981" }} />
                    <Bar dataKey="co2" fill="#10b981" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      <header className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-emerald-200 dark:border-emerald-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mr-3" />
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">AntiPollucion</h1>
              <div className="flex items-center ml-6 text-emerald-600 dark:text-emerald-400">
                <Clock className="h-4 w-4 mr-2" />
                <span className="text-sm font-mono">{currentTime.toLocaleTimeString("pt-BR")}</span>
                <div className="ml-4 text-xs">
                  <span className="text-slate-600 dark:text-slate-300">Última atualização: </span>
                  <span>{lastUpdate?.toLocaleTimeString("pt-BR") ?? '...'}</span>
                </div>
                {isRealTimeActive && (
                  <div className="ml-2 flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="ml-1 text-xs text-green-600 dark:text-green-400">LIVE</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={toggleTheme} className="border-emerald-300 dark:border-emerald-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 bg-transparent">
                {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="sm" className="border-emerald-300 dark:border-emerald-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 bg-transparent" onClick={handleManualUpdate}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
              <Button variant="outline" size="sm" className={`border-emerald-300 dark:border-emerald-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 bg-transparent ${isRealTimeActive ? "bg-emerald-50 dark:bg-emerald-900/20" : ""}`} onClick={toggleRealTime}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isRealTimeActive ? "animate-spin" : ""}`} />
                {isRealTimeActive ? "Parar Tempo Real" : "Tempo Real"}
              </Button>
              <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-600 bg-slate-50 dark:bg-slate-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                {onlineSensors}/{sensors.length} Sensores Online
              </Badge>
              <NotificationCenter />
              <UserMenu onLogout={onLogout} />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm border-emerald-200 dark:border-emerald-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Índice de Qualidade do Ar</CardTitle>
              <Activity className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{aqiInfo.index}</div>
              <div className="flex items-center mt-2">
                <Badge className={`${aqiStatus.color} text-white`}>{aqiStatus.label}</Badge>
              </div>
              <Progress value={aqiInfo.index} max={200} className="mt-3" />
            </CardContent>
          </Card>
          <Card className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm border-emerald-200 dark:border-emerald-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">CO₂</CardTitle>
              <Zap className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {currentData?.co2 ?? 'N/A'} <span className="text-sm font-normal text-slate-400 dark:text-slate-500">ppm</span>
              </div>
              <div className="flex items-center text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +2% vs ontem
              </div>
            </CardContent>
          </Card>
        </div>
        <Card className="mb-8 border-emerald-200 dark:border-emerald-700 bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mr-2" />
                <CardTitle className="text-emerald-600 dark:text-emerald-400">Alertas do Sistema</CardTitle>
              </div>
              <Button variant="outline" size="sm" className="border-emerald-300 dark:border-emerald-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 bg-transparent">
                <Filter className="w-4 h-4 mr-2" />
                Filtrar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
                  <p className="font-medium text-slate-900 dark:text-slate-100">Nenhum alerta crítico no momento.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <PredictionPanel historicalData={predictionData} isRealTimeActive={isRealTimeActive} />
        <Tabs defaultValue="trends" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm border border-emerald-200 dark:border-emerald-700">
              <TabsTrigger value="trends" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-emerald-600 dark:text-emerald-400">Tendências</TabsTrigger>
              <TabsTrigger value="sensors" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-emerald-600 dark:text-emerald-400">Sensores</TabsTrigger>
            </TabsList>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="border-emerald-300 dark:border-emerald-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm border-emerald-200 dark:border-emerald-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-emerald-600 dark:text-emerald-400">Qualidade do Ar - Últimas 24h</CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-300">Índice de Qualidade do Ar ao longo do tempo</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setFullscreenChart("aqi")} className="text-emerald-600 dark:text-emerald-400">
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={sensorData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#374151" : "#d1d5db"} />
                      <XAxis dataKey="time" stroke={theme === "dark" ? "#9CA3AF" : "#6b7280"} />
                      <YAxis stroke={theme === "dark" ? "#9CA3AF" : "#6b7280"} />
                      <Tooltip contentStyle={{ backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff", border: "1px solid #10B981"}} />
                      <Area type="monotone" dataKey="aqi" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm border-emerald-200 dark:border-emerald-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-emerald-600 dark:text-emerald-400">Níveis de CO₂</CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-300">Concentração de dióxido de carbono (ppm)</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setFullscreenChart("co2")} className="text-emerald-600 dark:text-emerald-400">
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sensorData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#374151" : "#d1d5db"} />
                      <XAxis dataKey="time" stroke={theme === "dark" ? "#9CA3AF" : "#6b7280"} />
                      <YAxis stroke={theme === "dark" ? "#9CA3AF" : "#6b7280"} />
                      <Tooltip contentStyle={{ backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff", border: "1px solid #10B981" }} />
                      <Bar dataKey="co2" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sensors">
            <Card className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm border-emerald-200 dark:border-emerald-700">
              <CardHeader>
                <CardTitle className="text-emerald-600 dark:text-emerald-400">Status dos Sensores</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-300">Monitoramento em tempo real de todos os sensores</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-emerald-200 dark:border-emerald-700">
                      <TableHead className="text-slate-700 dark:text-slate-300">Sensor ID</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300">Localização</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300">AQI</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300">CO₂</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300">Última Atualização</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sensors.map((sensor) => (
                      <TableRow key={sensor.id} className="border-emerald-100 dark:border-emerald-800">
                        <TableCell className="font-medium text-slate-900 dark:text-slate-100">{sensor.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-slate-400 dark:text-slate-500" />
                            <span className="text-slate-700 dark:text-slate-300">{sensor.location}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={sensor.status === "online" ? "default" : "destructive"}>
                            {sensor.status === "online" ? "Online" : "Offline"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="font-medium text-slate-900 dark:text-slate-100">{sensor.aqi}</span>
                            <Badge className={`ml-2 ${getAQIStatus(sensor.aqi).color} text-white`} variant="secondary">
                              {getAQIStatus(sensor.aqi).label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-700 dark:text-slate-300">{sensor.co2} ppm</TableCell>
                        <TableCell className="text-slate-500 dark:text-slate-400">{sensor.lastUpdate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}