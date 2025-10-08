"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus,
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
  ArrowUpDown,
  Search,
} from "lucide-react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts"
import PredictionPanel from "../components/prediction-panel"
import { NotificationCenter } from "../components/notifications"
import { UserMenu } from "../components/user-menu"
import { useTheme } from "../contexts/theme-context"
import type { PredictionData } from "../components/prediction-ai"
import { MetricCardSkeleton } from "../components/loading-skeleton"
import { getAqiInfo, getAQIStatus } from "../lib/utils"

type TimePeriod = '24h' | '7d' | '30d';
type SortKey = 'id' | 'location' | 'status' | 'aqi' | 'co2';
type SortDirection = 'asc' | 'desc';

export default function PollutionDashboard({ onLogout }: { onLogout: () => void }) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [currentData, setCurrentData] = useState<any>(null)
  const [sensorData, setSensorData] = useState<any[]>([])
  const [sensors, setSensors] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([]) 
  const [trendData, setTrendData] = useState<{ percentageChange: number, trend: string } | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('24h');
  const [isRealTimeActive, setIsRealTimeActive] = useState(false)
  const [fullscreenChart, setFullscreenChart] = useState<string | null>(null)
  const { theme, toggleTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'aqi', direction: 'desc' });

  const fetchData = useCallback(async (period: TimePeriod) => {
    if (!currentData) {
        setIsLoading(true);
    }
    try {
      const [currentRes, historicalRes, sensorsRes, trendRes] = await Promise.all([
        fetch('/api/data/latest'),
        fetch(`/api/data/historical?period=${period}`),
        fetch('/api/data/sensors'),
        fetch('/api/data/trend')
      ]);

      if (!currentRes.ok || !historicalRes.ok || !sensorsRes.ok || !trendRes.ok) {
        throw new Error('Falha ao buscar dados da API');
      }

      const currentPayload = await currentRes.json();
      const historical = await historicalRes.json();
      const sensorsData = await sensorsRes.json();
      const trend = await trendRes.json();

      setCurrentData(currentPayload.latestData);
      setAlerts(currentPayload.alerts);
      setTrendData(trend);
      
      const aqiHistorical = historical.map((d: any) => ({
        ...d,
        aqi: getAqiInfo(d.value).index,
        time: d.dia_formatado || new Date(d.dia).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      }));
      
      setSensorData(aqiHistorical);
      setSensors(sensorsData);

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentData]);

  useEffect(() => {
    fetchData(timePeriod);
  }, [fetchData, timePeriod]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    if (!isRealTimeActive) return;
    const interval = setInterval(() => fetchData(timePeriod), 5000);
    return () => clearInterval(interval);
  }, [isRealTimeActive, fetchData, timePeriod]);
  
  const toggleRealTime = useCallback(() => setIsRealTimeActive(prev => !prev), []);

  const handlePeriodChange = (newPeriod: TimePeriod) => {
    setTimePeriod(newPeriod);
  };
  
  const handleManualUpdate = useCallback(() => {
    fetchData(timePeriod);
  }, [fetchData, timePeriod]);

  const filteredAndSortedSensors = useMemo(() => {
    let sortableSensors = [...sensors];
    if (searchTerm) {
      sortableSensors = sortableSensors.filter(sensor =>
        sensor.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sensor.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    sortableSensors.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sortableSensors;
  }, [sensors, searchTerm, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  if (isLoading || !currentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 dark:from-slate-900 dark:to-slate-800 p-8">
        <div className="max-w-7xl mx-auto animate-pulse">
          <div className="h-16 mb-8 bg-gray-200 dark:bg-slate-700 rounded-lg w-full"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </div>
          <div className="h-48 bg-gray-200 dark:bg-slate-700 rounded-lg w-full mb-8"></div>
          <div className="h-96 bg-gray-200 dark:bg-slate-700 rounded-lg w-full"></div>
        </div>
      </div>
    );
  }

  const aqiInfo = getAqiInfo(currentData?.value);
  const aqiStatus = getAQIStatus(aqiInfo.index);
  const onlineSensors = sensors.filter((s) => s.status === "online").length;

  const predictionData: PredictionData[] = sensorData.map((point) => ({
    timestamp: new Date(point.dia).getTime(),
    aqi: point.aqi,
    pm25: 0,
    pm10: 0,
    co2: parseFloat(point.value) || 0,
  }));
  
  const lastReadingTimestamp = new Date(currentData.dia).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const renderTrend = () => {
    if (!trendData) return null;
    const { percentageChange, trend } = trendData;
    const isPositive = percentageChange > 0;
    const color = trend === 'increasing' ? 'text-yellow-600 dark:text-yellow-400' : trend === 'decreasing' ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400';
    const Icon = trend === 'increasing' ? TrendingUp : trend === 'decreasing' ? TrendingDown : Minus;
    return (
      <div className={`flex items-center text-sm ${color} mt-1`}>
        <Icon className="w-3 h-3 mr-1" />
        {isPositive ? '+' : ''}{percentageChange}% vs ontem
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
       {fullscreenChart && (
        <div className="fixed inset-0 z-[10000] bg-black/80 flex items-center justify-center p-4">
          <Card className="w-full max-w-6xl h-[80vh] bg-slate-50 dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-emerald-600 dark:text-emerald-400">
                {fullscreenChart === "aqi" ? "Qualidade do Ar" : "Níveis de Poluente"}
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setFullscreenChart(null)} className="border-emerald-300 dark:border-emerald-600">
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
                    <Bar dataKey="value" fill="#10b981" />
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
              <div className="flex flex-col">
                <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">AntiPollucion</h1>
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                  <MapPin className="w-3 h-3 mr-1" />
                  {currentData.location}
                </div>
              </div>
              <div className="flex items-center ml-6 text-emerald-600 dark:text-emerald-400">
                <Clock className="h-4 w-4 mr-2" />
                <div className="text-xs">
                  <span className="text-slate-600 dark:text-slate-300">Última Leitura: </span>
                  <span className="font-mono">{lastReadingTimestamp}</span>
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
              <Button variant="outline" size="sm" className="border-emerald-300 dark:border-emerald-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 bg-transparent" onClick={() => handleManualUpdate()}>
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
              <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Poluente Principal (Valor)</CardTitle>
              <Zap className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {currentData?.value ?? 'N/A'} <span className="text-sm font-normal text-slate-400 dark:text-slate-500">ppm</span>
              </div>
              {renderTrend()}
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
              {alerts.length > 0 ? (
                alerts.map((alert: any) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-700">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{alert.title}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{alert.message}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="destructive">{alert.level}</Badge>
                      <Button variant="ghost" size="sm" className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
                  <p className="font-medium text-slate-900 dark:text-slate-100">Nenhum alerta crítico no momento.</p>
                </div>
              )}
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
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Período:</span>
              <Button
                variant={timePeriod === '24h' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePeriodChange('24h')}
                className="data-[variant=outline]:bg-transparent data-[variant=default]:bg-emerald-600 data-[variant=default]:text-white"
              >
                24 Horas
              </Button>
              <Button
                variant={timePeriod === '7d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePeriodChange('7d')}
                className="data-[variant=outline]:bg-transparent data-[variant=default]:bg-emerald-600 data-[variant=default]:text-white"
              >
                7 Dias
              </Button>
              <Button
                variant={timePeriod === '30d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePeriodChange('30d')}
                className="data-[variant=outline]:bg-transparent data-[variant=default]:bg-emerald-600 data-[variant=default]:text-white"
              >
                30 Dias
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm border-emerald-200 dark:border-emerald-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-emerald-600 dark:text-emerald-400">Qualidade do Ar - {
                      { '24h': 'Últimas 24h', '7d': 'Últimos 7 Dias', '30d': 'Últimos 30 Dias' }[timePeriod]
                    }</CardTitle>
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
                    <CardTitle className="text-emerald-600 dark:text-emerald-400">Níveis de Poluente</CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-300">Concentração do poluente principal (ppm)</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setFullscreenChart("value")} className="text-emerald-600 dark:text-emerald-400">
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
                      <Bar dataKey="value" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sensors">
            <Card className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm border-emerald-200 dark:border-emerald-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-emerald-600 dark:text-emerald-400">Status dos Sensores</CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-300">
                            Pesquise ou ordene para encontrar informações específicas.
                        </CardDescription>
                    </div>
                    <div className="relative w-full max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                            type="text"
                            placeholder="Pesquisar por local ou ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-emerald-200 dark:border-emerald-700 hover:bg-slate-100/50 dark:hover:bg-slate-700/50">
                      <TableHead><Button variant="ghost" onClick={() => requestSort('id')} className="px-2 py-1 h-auto"><ArrowUpDown className="w-4 h-4 mr-2" />Sensor ID</Button></TableHead>
                      <TableHead><Button variant="ghost" onClick={() => requestSort('location')} className="px-2 py-1 h-auto"><ArrowUpDown className="w-4 h-4 mr-2" />Localização</Button></TableHead>
                      <TableHead><Button variant="ghost" onClick={() => requestSort('status')} className="px-2 py-1 h-auto"><ArrowUpDown className="w-4 h-4 mr-2" />Status</Button></TableHead>
                      <TableHead><Button variant="ghost" onClick={() => requestSort('aqi')} className="px-2 py-1 h-auto"><ArrowUpDown className="w-4 h-4 mr-2" />AQI</Button></TableHead>
                      <TableHead><Button variant="ghost" onClick={() => requestSort('co2')} className="px-2 py-1 h-auto"><ArrowUpDown className="w-4 h-4 mr-2" />Valor (ppm)</Button></TableHead>
                      <TableHead>Última Atualização</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedSensors.map((sensor) => (
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