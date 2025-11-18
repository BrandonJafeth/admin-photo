"use client"

import React from 'react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // Nested layouts must not render <html> or <body>. Return a wrapper element only.
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      {children}
    </div>
  )
}
