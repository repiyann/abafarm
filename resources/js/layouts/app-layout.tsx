import { AppContent } from '@/components/organisms/app-content'
import { AppShell } from '@/components/organisms/app-shell'
import { AppSidebar } from '@/components/organisms/app-sidebar'
import { AppSidebarHeader } from '@/components/organisms/app-sidebar-header'
import { type BreadcrumbItem } from '@/types'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode } from 'react'

interface AppLayoutProps {
  children: ReactNode
  breadcrumbs?: BreadcrumbItem[]
}

const queryClient = new QueryClient()

export default ({ children, breadcrumbs }: AppLayoutProps) => (
  <AppShell>
    <AppSidebar />
    <AppContent className="overflow-x-hidden">
      <AppSidebarHeader breadcrumbs={breadcrumbs} />
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </AppContent>
  </AppShell>
)
