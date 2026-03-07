import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono, Instrument_Serif } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: '--font-mono'
});

const _instrumentSerif = Instrument_Serif({ 
  subsets: ["latin"],
  weight: "400",
  variable: '--font-serif'
});

export const metadata: Metadata = {
  title: 'Signal Monitor | Expansion Intelligence',
  description: 'Surface actionable expansion signals from your book of business using public data sources',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark bg-background">
      <body className="font-mono antialiased">
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
