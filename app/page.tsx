"use client"

import { useState } from "react"
import LoginPage from "./login"
import PollutionDashboard from "./dashboard"
import { ThemeProvider } from "../contexts/theme-context"

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  return (
    <ThemeProvider>
      <div>{!isLoggedIn ? <LoginPage onLogin={handleLogin} /> : <PollutionDashboard />}</div>
    </ThemeProvider>
  )
}
