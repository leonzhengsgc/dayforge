import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

function getDisplayName(email) {
  if (!email) return ''
  const name = email.split('@')[0].replace(/[._-]/g, ' ')
  return name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

const NAV_ITEMS = [
  {
    to: '/',
    label: 'To Do List',
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
      </svg>
    ),
    color: 'forge',
    end: true,
  },
  {
    to: '/planning',
    label: 'Planning',
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
    color: 'amber',
  },
  {
    to: '/news',
    label: 'AI News',
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
      </svg>
    ),
    color: 'news',
  },
  {
    to: '/assistant',
    label: 'Assistant',
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    color: 'purple',
  },
]

// Chevron icon
function ChevronIcon({ collapsed }) {
  return (
    <svg
      className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  )
}

export default function AppShell({ children }) {
  const { user, signOut } = useAuth()
  const displayName = getDisplayName(user?.email)
  const [collapsed, setCollapsed] = useState(false)

  const sidebarWidth = collapsed ? 'w-16' : 'w-56'
  const mainMargin = collapsed ? 'ml-16' : 'ml-56'

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={`${sidebarWidth} flex-shrink-0 border-r border-gray-800/50 bg-gray-950/90 flex flex-col fixed inset-y-0 left-0 z-20 transition-all duration-300 ease-out overflow-hidden`}
      >
        {/* Logo + collapse toggle */}
        <div className="px-3 pt-4 pb-3 flex items-center justify-between min-w-0">
          <NavLink
            to="/"
            className={`flex items-center gap-2.5 transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(74,222,128,0.5)] min-w-0 ${collapsed ? 'justify-center' : ''}`}
          >
            <div className="w-8 h-8 rounded-lg bg-forge-500/15 border border-forge-500/20 flex items-center justify-center text-sm flex-shrink-0">
              &#x2692;
            </div>
            {!collapsed && (
              <span className="text-lg font-bold tracking-tight whitespace-nowrap overflow-hidden">
                <span className="text-forge-400">Day</span>
                <span className="text-gray-100">Forge</span>
              </span>
            )}
          </NavLink>
          <button
            onClick={() => setCollapsed(c => !c)}
            className={`p-1.5 rounded-md text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 transition-all duration-200 flex-shrink-0 ${collapsed ? 'mx-auto' : ''}`}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronIcon collapsed={collapsed} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 space-y-1 mt-1">
          {!collapsed && (
            <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-600 mb-2">Tools</p>
          )}
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) => {
                const activeColors = {
                  forge: 'text-forge-400 bg-forge-500/10 border-forge-500/20',
                  amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                  news: 'text-news-400 bg-news-500/10 border-news-500/20',
                  purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
                }
                return `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border ${collapsed ? 'justify-center' : ''} ${
                  isActive
                    ? activeColors[item.color]
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40 border-transparent'
                }`
              }}
            >
              {item.icon}
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-2 border-t border-gray-800/50">
          {collapsed ? (
            <button
              onClick={signOut}
              title="Sign out"
              className="w-full flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800/40 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </button>
          ) : (
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-forge-500 to-forge-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {displayName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{displayName}</p>
                <button
                  onClick={signOut}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors duration-200 cursor-pointer"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className={`flex-1 ${mainMargin} min-h-screen transition-all duration-300 ease-out`}>
        <div className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
