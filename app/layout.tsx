import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { ClientProviders } from "@/components/client-providers"
import "./globals.css"

// Force dynamic rendering for all pages to prevent SSR context errors
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { Geist, Geist_Mono } from 'next/font/google'

// Initialize fonts with simpler configuration
const geist = Geist({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-geist'
})

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-geist-mono'
})

export const metadata: Metadata = {
  title: "Smart Study Habit Tracker",
  description: "Track your study sessions, analyze learning patterns, and optimize your study habits",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${geistMono.variable}`}>
      <body className={`font-sans antialiased`}>
        <ClientProviders>
          {children}
        </ClientProviders>
        <Analytics />
      </body>
    </html>
  )
}
