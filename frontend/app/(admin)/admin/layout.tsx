import { AppShell } from '@/components/shell/AppShell'
import { ToastHost } from '@/components/ui'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppShell role="admin">{children}</AppShell>
      <ToastHost />
    </>
  )
}
