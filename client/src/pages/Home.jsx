import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="home-content">
      <h1>Welcome to My Portfolio</h1>

      <p>
        Welcome to my personal portfolio website. This website showcases my
        education, projects, skills, and the services I can provide in web
        development and programming.
      </p>

      <p>
        My goal is to continue developing my technical skills and create
        useful, professional, and user-friendly applications.
      </p>

      <Link to="/about" className="home-button">
        Learn More About Me
      </Link>
    </div>
  )
}

export default Home