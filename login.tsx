"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Shield, Eye, EyeOff, Users, BarChart3 } from "lucide-react"

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleTestLogin = async () => {
    setIsLoading(true)
    // Simula um delay de autenticação
    setTimeout(() => {
      setIsLoading(false)
      onLogin()
    }, 1500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Verificar credenciais de teste
    if (email === "admin@mineradorasul.com" && password === "demo123") {
      setTimeout(() => {
        setIsLoading(false)
        onLogin()
      }, 1500)
    } else {
      // Simula autenticação para outras credenciais
      setTimeout(() => {
        setIsLoading(false)
        onLogin()
      }, 1500)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block space-y-8">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-6">
              <Shield className="h-12 w-12 text-emerald-600 mr-4" />
              <h1 className="text-4xl font-bold text-gray-900">AntiPollucion</h1>
            </div>
            <p className="text-xl text-gray-600 mb-8">Proteção ambiental inteligente para sua indústria</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4 p-4 bg-white/50 rounded-lg backdrop-blur-sm">
              <Shield className="h-8 w-8 text-emerald-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Conformidade Regulatória</h3>
                <p className="text-gray-600">Mantenha-se em conformidade com as normas ambientais</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-white/50 rounded-lg backdrop-blur-sm">
              <BarChart3 className="h-8 w-8 text-emerald-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Relatórios Detalhados</h3>
                <p className="text-gray-600">Análises completas dos seus dados ambientais</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-white/50 rounded-lg backdrop-blur-sm">
              <Users className="h-8 w-8 text-emerald-600" />
              <div>
                <h3 className="font-semibolt text-gray-900">Suporte Especializado</h3>
                <p className="text-gray-600">Equipe técnica dedicada ao seu sucesso</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="border-emerald-200 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4 lg:hidden">
                <Shield className="h-8 w-8 text-emerald-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">AntiPollucion</h1>
              </div>
              <CardTitle className="text-2xl text-gray-900">Acesso ao Portal</CardTitle>
              <CardDescription className="text-gray-600">
                Entre com suas credenciais para acessar o dashboard
              </CardDescription>
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <h4 className="text-sm font-semibold text-emerald-800 mb-2">🏭 Credenciais de Teste</h4>
                <div className="text-xs text-emerald-700 space-y-1">
                  <p>
                    <strong>Email:</strong> admin@mineradorasul.com
                  </p>
                  <p>
                    <strong>Senha:</strong> demo123
                  </p>
                  <p className="text-emerald-600 mt-2">Use essas credenciais para testar o sistema</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">
                    Email corporativo
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 pr-10"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" className="border-emerald-300" disabled={isLoading} />
                    <Label htmlFor="remember" className="text-sm text-gray-600">
                      Lembrar de mim
                    </Label>
                  </div>
                  <Button variant="link" className="text-emerald-600 hover:text-emerald-700 p-0" disabled={isLoading}>
                    Esqueceu a senha?
                  </Button>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white transition-colors duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? "Entrando..." : "Entrar no Dashboard"}
                </Button>
              </form>

              {/* Botão de Login de Teste */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-emerald-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Ou</span>
                </div>
              </div>

              <Button
                onClick={handleTestLogin}
                variant="outline"
                className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 transition-colors duration-200 bg-transparent"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600 mr-2"></div>
                    Conectando...
                  </div>
                ) : (
                  "🧪 Login de Teste (Demo)"
                )}
              </Button>

              <div className="text-center pt-4 border-t border-emerald-100">
                <p className="text-sm text-gray-600">
                  Não tem acesso?{" "}
                  <Button variant="link" className="text-emerald-600 hover:text-emerald-700 p-0" disabled={isLoading}>
                    Solicite uma demonstração
                  </Button>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>© 2024 AntiPollucion. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
