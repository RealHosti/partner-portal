import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { PwaRegister } from '@/components/pwa-register'
import './globals.css'

export const metadata: Metadata = {
  title: 'Realhosti Partner Portal',
  description: 'Mobile-first Partner Portal fuer Twitch Kooperationen, Live-Chat, Forum und Blog Updates.',
  keywords: ['Twitch', 'Partner', 'Realhosti', 'Streaming', 'Gaming'],
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Realhosti Partner',
    statusBarStyle: 'black-translucent',
  },
}

export const viewport: Viewport = {
  themeColor: '#f97316',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" className="dark bg-background">
      <body className="font-sans antialiased min-h-screen">
        <PwaRegister />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
