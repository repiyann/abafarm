import { SidebarInset } from '@/components/ui/sidebar'
import { ComponentProps } from 'react'

export function AppContent({ children, ...props }: ComponentProps<'main'>) {
  return <SidebarInset {...props}>{children}</SidebarInset>
}
