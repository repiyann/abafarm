import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { dashboard } from '@/routes'
import { index as fatteningIndex } from '@/routes/fattening'
import { index as silageIndex } from '@/routes/silage'
import { type NavItem } from '@/types'
import { Link } from '@inertiajs/react'
import { NavUser } from '../molecules/nav-user'
import AppLogo from './app-logo'
import { NavMain } from './nav-main'
import { index } from '@/routes/pembelian'

const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: dashboard(),
  },
  {
    title: 'Penentuan Pakan',
    href: silageIndex(),
  },
  {
    title: 'Pemberian Pakan',
    href: '#',
  },
  {
    title: 'Pembelian Pakan',
    href: index(),
  },
  {
    title: 'Sisa Pakan',
    href: fatteningIndex(),
  },
]

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={dashboard()} prefetch>
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={mainNavItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
