import { getCurrentAdminUser } from '@/lib/auth'
import { AdminShell } from '@/components/admin/admin-shell'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const adminUser = await getCurrentAdminUser()

  if (!adminUser) {
    return <>{children}</>
  }

  return (
    <AdminShell adminUser={adminUser}>
      {children}
    </AdminShell>
  )
}
