import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LeadFlow Pro',
  description: 'AI-powered lead automation for small businesses',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
