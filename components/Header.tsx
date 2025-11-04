import Link from 'next/link'
import { LogOut, User } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-white border-b">
      <div className="container flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Analytics</h3>
          <div className="text-sm text-gray-500">Overview</div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/users" className="flex items-center gap-2 text-sm text-gray-600 hover:underline">
            <User size={16} />
            <span>Users</span>
          </Link>
          <form method="post" action="/api/auth/logout">
            <button type="submit" className="flex items-center gap-2 text-sm bg-sky-600 text-white px-3 py-1 rounded">
              <LogOut size={16} />
              Logout
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
