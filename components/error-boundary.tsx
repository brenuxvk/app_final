"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <CardTitle className="text-red-600">Erro no Sistema</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-red-700">
                Ocorreu um erro inesperado. Por favor, recarregue a página ou entre em contato com o suporte.
              </p>
              {this.state.error && (
                <details className="text-sm text-red-600">
                  <summary className="cursor-pointer font-medium">Detalhes técnicos</summary>
                  <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto">{this.state.error.message}</pre>
                </details>
              )}
              <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 text-white">
                <RefreshCw className="w-4 h-4 mr-2" />
                Recarregar Página
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

export function withErrorBoundary<P extends object>(Component: React.ComponentType<P>, fallback?: React.ReactNode) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}
