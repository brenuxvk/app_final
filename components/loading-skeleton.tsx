"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function MetricCardSkeleton() {
  return (
    <Card className="bg-white border-emerald-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
      </CardHeader>
      <CardContent>
        <div className="h-8 bg-gray-200 rounded w-16 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-20 mb-3 animate-pulse"></div>
        <div className="h-2 bg-gray-200 rounded w-full animate-pulse"></div>
      </CardContent>
    </Card>
  )
}

export function ChartSkeleton() {
  return (
    <Card className="bg-white border-emerald-200">
      <CardHeader>
        <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] bg-gray-100 rounded flex items-center justify-center">
          <div className="text-gray-400">Carregando gráfico...</div>
        </div>
      </CardContent>
    </Card>
  )
}

export function TableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 bg-gray-200 rounded w-40 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex space-x-4">
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
