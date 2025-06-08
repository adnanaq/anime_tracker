import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getAuthService } from '../services/auth'
// import { AnimeSource } from '../types/anime'

export const AuthCallback = () => {
  const navigate = useNavigate()
  const { source } = useParams<{ source: string }>()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')

      if (error) {
        setStatus('error')
        setMessage(`OAuth Error: ${error}`)
        return
      }

      if (!code) {
        setStatus('error')
        setMessage('No authorization code received')
        return
      }

      if (!source || (source !== 'mal' && source !== 'anilist')) {
        setStatus('error')
        setMessage('Invalid source parameter')
        return
      }

      const authService = getAuthService(source)
      if (!authService) {
        setStatus('error')
        setMessage(`Auth service not available for ${source}`)
        return
      }

      try {
        const token = await authService.exchangeCodeForToken(code)
        
        if (token) {
          setStatus('success')
          setMessage(`Successfully logged in to ${source === 'mal' ? 'MyAnimeList' : 'AniList'}!`)
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/')
          }, 2000)
        } else {
          setStatus('error')
          setMessage('Failed to exchange authorization code for token')
        }
      } catch (err) {
        console.error('OAuth callback error:', err)
        setStatus('error')
        setMessage(err instanceof Error ? err.message : 'Authentication failed')
      }
    }

    handleCallback()
  }, [searchParams, source, navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Login</h2>
              <p className="text-gray-600">Please wait while we complete your authentication...</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Login Successful!</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">Redirecting you to the dashboard...</p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Login Failed</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <button
                onClick={() => navigate('/')}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Return to Dashboard
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}