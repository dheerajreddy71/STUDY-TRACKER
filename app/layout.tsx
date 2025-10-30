import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { ClientProviders } from "@/components/client-providers"
import "./globals.css"

// Force dynamic rendering for all pages to prevent SSR context errors
export const dynamic = 'force-dynamic'
export const revalidate = 0

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
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ClientProviders>
          {children}
        </ClientProviders>
        <Analytics />
      </body>
    </html>
  )
}

