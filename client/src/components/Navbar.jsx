import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'

function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">
          <span className="logo-mark">HP</span>
          <span className="logo-text">My Portfolio</span>
        </Link>
      </div>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/projects">Projects</Link>
        <Link to="/education">Education</Link>
        <Link to="/services">Services</Link>
        <Link to="/contact">Contact</Link>

        {!user ? (
          <>
            <Link to="/signin">Sign In</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        ) : (
          <>
            <span>
              {user.name} ({isAdmin ? 'Admin' : 'User'})
            </span>

            <button type="button" onClick={handleLogout}>
              Sign Out
            </button>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar