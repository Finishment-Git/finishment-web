import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DealerShell } from '@/components/dealer/dealer-shell'

export default async function DealerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/dealer-login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_primary')
    .eq('id', user.id)
    .single()

  return (
    <DealerShell isPrimary={profile?.is_primary ?? false}>
      {children}
    </DealerShell>
  )
}
