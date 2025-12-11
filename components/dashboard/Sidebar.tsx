'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  Sidebar as AnimateSidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/animate-ui/components/radix/sidebar'

const UserMenu = dynamic(() => import('./UserMenu'), { ssr: false })

export default function Sidebar() {
  return (
    <AnimateSidebar className="!bg-white border-r border-slate-200">
      <SidebarHeader className="p-4 border-b border-slate-200 !bg-white">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <h3 className="text-sm font-semibold text-slate-900">Admin Dashboard</h3>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3 !bg-white">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/dashboard" className="text-sm text-slate-900 hover:bg-slate-100">Dashboard</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/contenido" className="text-sm text-slate-900 hover:bg-slate-100">Contenido</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/servicios" className="text-sm text-slate-900 hover:bg-slate-100">Servicios</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/galeria" className="text-sm text-slate-900 hover:bg-slate-100">Galería</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/mensajes" className="text-sm text-slate-900 hover:bg-slate-100">Mensajes</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-slate-200 !bg-white">
        <UserMenu />
        <p className="text-xs text-slate-600 text-center mt-2">v1.0</p>
      </SidebarFooter>
    </AnimateSidebar>
  )
}
