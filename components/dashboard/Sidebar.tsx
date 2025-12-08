'use client'

import Link from 'next/link'
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

export default function Sidebar() {
  return (
    <AnimateSidebar className="border-r bg-whi">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <h3 className="text-sm font-semibold text-white">Admin Dashboard</h3>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/dashboard" className="text-sm">Dashboard</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/contenido" className="text-sm">Contenido</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/servicios" className="text-sm">Servicios</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/galeria" className="text-sm">Galería</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/mensajes" className="text-sm">Mensajes</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t text-xs">v1.0</SidebarFooter>
    </AnimateSidebar>
  )
}
