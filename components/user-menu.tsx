"use client"

import { useState, useRef } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Settings, LogOut, Download, BarChart3, Shield } from "lucide-react"

interface UserMenuProps {
  onLogout: () => void
}

export function UserMenu({ onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const exportData = () => {
    // Simular exportação de dados
    const data = {
      timestamp: new Date().toISOString(),
      sensors: 5,
      aqi_average: 78,
      co2_average: 445,
      alerts: 2,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `pollution-data-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 bg-transparent dark:border-emerald-400 dark:text-emerald-400"
      >
        <Avatar className="w-6 h-6 mr-2">
          <AvatarFallback className="bg-emerald-100 text-emerald-600 text-xs">AD</AvatarFallback>
        </Avatar>
        Admin
      </Button>

      {isOpen &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[99999]" onClick={() => setIsOpen(false)}>
            <Card
              className="absolute w-64 bg-slate-50 dark:bg-slate-800 border-emerald-200 dark:border-emerald-700 shadow-2xl border-2"
              style={{
                top: `${buttonRef.current?.getBoundingClientRect().bottom + 8}px`,
                right: `${window.innerWidth - (buttonRef.current?.getBoundingClientRect().right || 0)}px`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-emerald-100 text-emerald-600">AD</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-sm text-slate-900 dark:text-slate-100">Admin User</CardTitle>
                    <p className="text-xs text-slate-500 dark:text-slate-400">admin@mineradorasul.com</p>
                  </div>
                </div>
                <Badge className="w-fit bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-300">
                  <Shield className="w-3 h-3 mr-1" />
                  Administrador
                </Badge>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-slate-700 dark:text-slate-300"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Perfil
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-slate-700 dark:text-slate-300"
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configurações
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-slate-700 dark:text-slate-300"
                    onClick={exportData}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Dados
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-slate-700 dark:text-slate-300"
                    onClick={() => setIsOpen(false)}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Relatórios
                  </Button>
                  <hr className="my-2 border-slate-200 dark:border-slate-600" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={onLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>,
          document.body,
        )}
    </div>
  )
}
