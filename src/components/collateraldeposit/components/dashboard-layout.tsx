"use client"

import type React from "react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-0">
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
