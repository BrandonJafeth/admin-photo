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
    <AnimateSidebar className="w-64">
      <SidebarHeader className="p-3">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <h3 className="text-sm font-semibold">Admin</h3>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/dashboard">Dashboard</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/contenido">Contenido</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/servicios">Servicios</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/galeria">Galería</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/mensajes">Mensajes</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-3 text-xs text-gray-500">v1.0</SidebarFooter>
    </AnimateSidebar>
  )
}
