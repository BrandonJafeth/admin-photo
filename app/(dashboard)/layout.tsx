import Sidebar from '@/components/dashboard/Sidebar'
import { SidebarProvider } from '@/components/animate-ui/components/radix/sidebar'
import SidebarHeaderTrigger from '@/components/dashboard/Header'

export const metadata = {
  title: 'Admin Dashboard',
}

export default function DashboardLayout({ }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div >
        <Sidebar />

              <SidebarHeaderTrigger />

      </div>
    </SidebarProvider>
  )
}
