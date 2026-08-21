import AdminDashboard from '@/components/admin/AdminDashboard'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Admin Control Center | Triple Stars',
  description: 'Triple Stars Esports Tournament Admin & Bracket Controller',
}

export default function AdminPage() {
  return <AdminDashboard />
}
