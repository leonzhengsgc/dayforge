import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AuthForm from '../components/auth/AuthForm'

export default function LoginPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-forge-500/30 border-t-forge-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (user) return <Navigate to="/" replace />

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-forge-500/[0.07] rounded-full blur-[120px]" />

      <div className="w-full max-w-sm relative z-10 animate-scale-in">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3 drop-shadow-[0_0_12px_rgba(74,222,128,0.3)]">
            &#x2692;
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-forge-400">Day</span>
            <span className="text-gray-100">Forge</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm tracking-wide">Forge your productivity, one day at a time</p>
        </div>
        <div className="glass card p-8">
          <AuthForm />
        </div>
      </div>
    </div>
  )
}
