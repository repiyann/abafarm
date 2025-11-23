import { index } from '@/actions/App/Http/Controllers/Feeders/SilageController'
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
import { type NavItem } from '@/types'
import { Link } from '@inertiajs/react'
import AppLogo from './app-logo'
import { NavMain } from './nav-main'
import { NavUser } from '../molecules/nav-user'

const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: dashboard(),
  },
  {
    title: 'Silase',
    href: index(),
  },
  {
    title: 'Konsentrat Breeding',
    href: '#',
  },
  {
    title: 'Konsentrat Fattening',
    href: '#',
  },
  {
    title: 'Complete Feed',
    href: '#',
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
