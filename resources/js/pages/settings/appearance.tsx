import { Head } from '@inertiajs/react'

import { type BreadcrumbItem } from '@/types'

import AppearanceToggleTab from '@/components/molecules/appearance-tabs'
import AppLayout from '@/layouts/app-layout'
import SettingsLayout from '@/layouts/settings-layout'
import { edit as editAppearance } from '@/routes/appearance'
import HeadingSmall from '@/components/atoms/heading-small'

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Appearance settings',
    href: editAppearance().url,
  },
]

export default function Appearance() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Appearance settings" />

      <SettingsLayout>
        <div className="space-y-6">
          <HeadingSmall
            title="Appearance settings"
            description="Update your account's appearance settings"
          />
          <AppearanceToggleTab />
        </div>
      </SettingsLayout>
    </AppLayout>
  )
}
