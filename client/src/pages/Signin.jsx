import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'

function Signin() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-container">
      <h1>Sign In</h1>

      <form className="contact-form" onSubmit={handleSubmit}>
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        {error && <p className="error-message">{error}</p>}

        <button
          type="submit"
          className="home-button"
          disabled={submitting}
        >
          {submitting ? 'Signing In...' : 'Sign In'}
        </button>

        <p>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </form>
    </div>
  )
}

export default Signin