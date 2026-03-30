import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AuthForm from '../components/auth/AuthForm'

export default function LoginPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-forge-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (user) return <Navigate to="/" replace />

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-forge-400">Day</span>
            <span className="text-gray-100">Forge</span>
          </h1>
          <p className="text-gray-400 mt-2">Forge your productivity, one day at a time</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <AuthForm />
        </div>
      </div>
    </div>
  )
}
