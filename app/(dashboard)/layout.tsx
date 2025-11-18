import Sidebar from '@/components/dashboard/Sidebar'
import { SidebarProvider } from '@/components/animate-ui/components/radix/sidebar'
import SidebarHeaderTrigger from '@/components/dashboard/Header'

export const metadata = {
  title: 'Admin Dashboard',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar />
        <main className="flex-1">
          <SidebarHeaderTrigger />
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
