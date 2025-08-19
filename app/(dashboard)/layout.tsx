'use client'

import NavBar from '@/components/NavBar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <NavBar />

      <main className="pt-0 px-0  mx-auto">
        {children}
      </main>
    </div>
  )
}
