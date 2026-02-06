import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'HomesteadHub - Self-Hosted Farm & Homestead Management',
  description: 'A comprehensive, self-hosted application for managing your homestead, farm, emergency supplies, and daily operations. No subscriptions, no cloud dependencies.',
  keywords: ['homestead', 'farm management', 'self-hosted', 'emergency preparedness', 'garden planning', 'livestock tracking'],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3b7048',
}

import { Providers } from "@/components/providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
