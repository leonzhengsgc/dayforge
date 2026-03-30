import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export default function AuthForm() {
  const { signIn, signUp } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (isSignUp) {
        await signUp(email, password)
        setMessage('Check your email for a confirmation link!')
      } else {
        await signIn(email, password)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-xl text-sm animate-slide-up">
          {error}
        </div>
      )}
      {message && (
        <div className="bg-forge-500/10 border border-forge-500/20 text-forge-400 px-4 py-2.5 rounded-xl text-sm animate-slide-up">
          {message}
        </div>
      )}
      <div>
        <label className="block text-sm text-gray-400 mb-1.5 font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-100 focus:outline-none focus:border-forge-500/50 focus:shadow-[0_0_0_3px_rgba(34,197,94,0.1)] transition-all duration-200"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1.5 font-medium">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-100 focus:outline-none focus:border-forge-500/50 focus:shadow-[0_0_0_3px_rgba(34,197,94,0.1)] transition-all duration-200"
          placeholder="Min 6 characters"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-gradient-to-r from-forge-600 to-forge-500 hover:from-forge-500 hover:to-forge-400 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-lg shadow-forge-900/30 hover:shadow-forge-800/40 active:scale-[0.98]"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {isSignUp ? 'Creating account...' : 'Signing in...'}
          </span>
        ) : (
          isSignUp ? 'Sign Up' : 'Sign In'
        )}
      </button>
      <p className="text-center text-sm text-gray-400">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          type="button"
          onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage('') }}
          className="text-forge-400 hover:text-forge-300 cursor-pointer transition-colors duration-200 underline-offset-4 hover:underline"
        >
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </button>
      </p>
    </form>
  )
}
