function Projects() {
  return (
    <div className="page-container">
      <h1>My Projects</h1>

      <div className="projects-grid">
        <div className="project-card">
          <img
            src="/images/react-project.svg"
            alt="React portfolio project"
            className="project-image"
          />

          <h2>React Portfolio Website</h2>
          <p>
            A personal portfolio website built with React and React Router.
            This project demonstrates page navigation, component-based
            development, and responsive design.
          </p>
          <p><strong>My Role:</strong> Developer</p>
          <p>
            <strong>Outcome:</strong> Created a functional multi-page portfolio
            website.
          </p>
        </div>

        <div className="project-card">
          <img
            src="/images/java-project.svg"
            alt="Java programming project"
            className="project-image"
          />

          <h2>Java Programming Project</h2>
          <p>
            A Java programming project created as part of my college studies.
            The project focuses on object-oriented programming and organized
            Java classes.
          </p>
          <p><strong>My Role:</strong> Developer</p>
          <p>
            <strong>Outcome:</strong> Practiced Java programming and
            problem-solving skills.
          </p>
        </div>

        <div className="project-card">
          <img
            src="/images/web-project.svg"
            alt="Web development project"
            className="project-image"
          />

          <h2>Web Development Project</h2>
          <p>
            A web development project focused on creating an interactive and
            user-friendly application using modern web technologies.
          </p>
          <p><strong>My Role:</strong> Developer</p>
          <p>
            <strong>Outcome:</strong> Improved my skills in front-end web
            development.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Projects