import Link from 'next/link'
import { PieChart, Users } from 'lucide-react'

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r min-h-screen flex flex-col">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <p className="text-sm text-gray-500 mt-1">Analytics Dashboard</p>
      </div>
      <nav className="p-4 flex-1">
        <ul className="space-y-2">
          <li>
            <Link href="/" className="flex items-center gap-2 p-2 rounded hover:bg-gray-100">
              <PieChart size={18} />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link href="/admin/users" className="flex items-center gap-2 p-2 rounded hover:bg-gray-100">
              <Users size={18} />
              <span>Users</span>
            </Link>
          </li>
        </ul>
      </nav>
      <div className="mt-auto p-4 text-sm text-gray-500">© Company</div>
    </aside>
  )
}
