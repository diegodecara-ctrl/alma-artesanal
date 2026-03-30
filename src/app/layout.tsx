import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant'
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans'
})

export const metadata: Metadata = {
  title: 'Alma Artesanal — Bijouterie',
  description: 'Bijouterie artesanal única, hecha a mano con amor.',
  openGraph: {
    title: 'Alma Artesanal',
    description: 'Bijouterie artesanal única, hecha a mano con amor.',
    type: 'website'
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body>
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#3d2b1f',
              color: '#c9a96e',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '14px',
              borderRadius: '8px'
            }
          }}
        />
      </body>
    </html>
  )
}
