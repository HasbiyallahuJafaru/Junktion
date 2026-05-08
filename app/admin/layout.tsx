import { AdminAuthProvider } from '@/app/context/AdminAuthContext'
import { AdminShell } from './AdminShell'

export const metadata = { title: 'Junktion Admin' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  )
}
