import { useAuth } from '../../contexts/AuthContext'

export default function AppShell({ children }) {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight">
            <span className="text-forge-400">Day</span>
            <span className="text-gray-100">Forge</span>
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 hidden sm:block">{user?.email}</span>
            <button
              onClick={signOut}
              className="text-sm text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  )
}
