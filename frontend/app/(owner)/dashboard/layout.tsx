import { AppShell } from '@/components/shell/AppShell'
import { ToastHost } from '@/components/ui'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppShell role="owner">{children}</AppShell>
      <ToastHost />
    </>
  )
}
