'use client'

import { SidebarTrigger } from '@/components/animate-ui/components/radix/sidebar'

export default function SidebarHeaderTrigger() {
  return (
    <div className="flex items-center border-b border-slate-200 bg-white h-15 px-6">
      <SidebarTrigger />
    </div>
  )
}
