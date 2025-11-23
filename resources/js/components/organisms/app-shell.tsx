import { SidebarProvider } from '@/components/ui/sidebar'
import { SharedData } from '@/types'
import { usePage } from '@inertiajs/react'

export function AppShell({ children }: { children: React.ReactNode }) {
  const isOpen = usePage<SharedData>().props.sidebarOpen

  return <SidebarProvider defaultOpen={isOpen}>{children}</SidebarProvider>
}
