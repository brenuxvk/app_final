"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, X, AlertTriangle, Info, CheckCircle } from "lucide-react"

interface Notification {
  id: string
  type: "info" | "warning" | "success" | "error"
  title: string
  message: string
  timestamp: Date
  read: boolean
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    // Simular notificações
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "warning",
        title: "AQI Alto Detectado",
        message: "Sensor S002 registrou AQI de 95. Considere medidas preventivas.",
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false,
      },
      {
        id: "2",
        type: "info",
        title: "Manutenção Programada",
        message: "Sensor S004 entrará em manutenção às 14:00.",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: false,
      },
      {
        id: "3",
        type: "success",
        title: "Qualidade do Ar Melhorou",
        message: "AQI médio reduziu 15% nas últimas 2 horas.",
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        read: true,
      },
    ]
    setNotifications(mockNotifications)
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const getIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative border-emerald-300 text-emerald-600 hover:bg-emerald-50 bg-transparent dark:border-emerald-400 dark:text-emerald-400"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 bg-red-500 text-white text-xs">{unreadCount}</Badge>
        )}
      </Button>

      {isOpen &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[99999]" onClick={() => setIsOpen(false)}>
            <Card
              className="absolute w-80 max-h-96 overflow-y-auto bg-slate-50 dark:bg-slate-800 border-emerald-200 dark:border-emerald-700 shadow-2xl border-2"
              style={{
                top: `${buttonRef.current?.getBoundingClientRect().bottom + 8}px`,
                right: `${window.innerWidth - (buttonRef.current?.getBoundingClientRect().right || 0)}px`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Notificações</h3>
                  <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">Nenhuma notificação</p>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          notification.read
                            ? "bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                            : "bg-white dark:bg-slate-600 border-emerald-200 dark:border-emerald-600"
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-2 flex-1">
                            {getIcon(notification.type)}
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                {notification.title}
                              </h4>
                              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{notification.message}</p>
                              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                                {notification.timestamp.toLocaleTimeString("pt-BR")}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeNotification(notification.id)
                            }}
                            className="ml-2"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>,
          document.body,
        )}
    </div>
  )
}
