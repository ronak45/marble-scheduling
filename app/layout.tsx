import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import InterviewSidebar from "@/components/interview-sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Therapist Scheduling Interview",
  description: "An interview question about optimizing therapist scheduling",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
          <div className="flex min-h-screen">
            <InterviewSidebar />
            <div className="flex-1">
              {children}
            </div>
          </div>
      </body>
    </html>
  )
}
