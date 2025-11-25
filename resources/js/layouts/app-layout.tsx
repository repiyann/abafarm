import { AppContent } from '@/components/organisms/app-content'
import { AppShell } from '@/components/organisms/app-shell'
import { AppSidebar } from '@/components/organisms/app-sidebar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode } from 'react'

const queryClient = new QueryClient()

export default ({ children }: { children: ReactNode }) => (
  <AppShell>
    <AppSidebar />
    <AppContent className="overflow-x-hidden">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </AppContent>
  </AppShell>
)
