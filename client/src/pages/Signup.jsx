import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'

function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await signup(name, email, password)
      navigate('/signin', {
        state: { message: 'Account created successfully. Please sign in.' }
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-container">
      <h1>Create Account</h1>

      <form className="contact-form" onSubmit={handleSubmit}>
        <label htmlFor="name">Full Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />

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
          minLength="8"
          required
        />

        {error && <p className="error-message">{error}</p>}

        <button
          type="submit"
          className="home-button"
          disabled={submitting}
        >
          {submitting ? 'Creating Account...' : 'Sign Up'}
        </button>

        <p>
          Already have an account? <Link to="/signin">Sign In</Link>
        </p>
      </form>
    </div>
  )
}

export default Signup