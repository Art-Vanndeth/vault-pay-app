"use client"

import type React from "react"

import { useState } from "react"
import { Navbar } from "@/components/common/navbar"
import { Sidebar } from "@/components/common/sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} showMenuButton={true} />

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-6 lg:ml-64">{children}</main>
      </div>
    </div>
  )
}
