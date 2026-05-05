import type { Metadata } from 'next'
import { Poppins, Open_Sans } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-heading',
  display: 'swap',
})

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Terratrace - Your Eco-Friendly Travel Planner',
  description: 'Plan sustainable journeys, track your carbon footprint, and discover eco-friendly destinations with Terratrace.',
  keywords: ['eco-friendly', 'sustainable travel', 'carbon footprint', 'green travel', 'travel planner'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${openSans.variable}`}>
      <body className="font-body bg-background text-text antialiased">
        {children}
      </body>
    </html>
  )
}
