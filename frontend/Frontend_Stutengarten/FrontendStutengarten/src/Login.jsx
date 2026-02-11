import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export default function Login() {
  const navigate = useNavigate()

  useEffect(() => {
    console.log('Login.jsx mounted')
  }, [])

  return (
    <main className="page-center" aria-labelledby="login-title">
      <h1 id="login-title">Login Seite</h1>
      <p>Hier gibst du Username & Passwort ein</p>
      <p id="login-debug" style={{ opacity: 0.8 }}>DEBUG: Login component rendered</p>

      <button
        onClick={() => navigate('/dashboard')}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        Weiter
      </button>
    </main>
  )
}
