import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.app",
}

function ErrorSuppression() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          // Suppress ResizeObserver loop errors (benign React Flow warnings)
          window.addEventListener('error', function(e) {
            if (e.message === 'ResizeObserver loop completed with undelivered notifications.' ||
                e.message === 'ResizeObserver loop limit exceeded') {
              e.stopImmediatePropagation();
            }
          });
        `,
      }}
    />
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <ErrorSuppression />
      </head>
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
