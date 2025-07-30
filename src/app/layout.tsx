import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
<<<<<<< HEAD
  title: 'Cerqueira Psicologia',
  description: 'Criado para ajudar a sua jornada emocional.'
=======
  title: 'Psicologia Cerqueira',
  description: 'O seu próximo melhor psicologo ;)'
>>>>>>> parent of 19ab1bd (Revert "Fix: LAyout and instagram route")
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  )
}
