import './globals.css'
import { ThemeProvider } from './ThemeProvider'

export const metadata = {
  title: 'TinyLink - URL Shortener',
  description: 'Create short links and track their performance',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
