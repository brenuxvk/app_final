import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AntiPollucion Dashboard',
  description: 'Monitoramento inteligente de poluição industrial',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        {/* The manual <style> tag is removed from here */}
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}