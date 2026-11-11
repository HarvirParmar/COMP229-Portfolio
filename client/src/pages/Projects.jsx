import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, API_URL } from '../AuthContext'

function Projects() {
  const { user, token, isAdmin } = useAuth()

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    role: '',
    outcome: ''
  })

  useEffect(() => {
    async function loadProjects() {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`${API_URL}/projects`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Unable to load projects')
        }

        setProjects(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [token])

  function handleChange(event) {
    const { name, value } = event.target

    setFormData({
      ...formData,
      [name]: value
    })
  }

  function resetForm() {
    setFormData({
      title: '',
      description: '',
      image: '',
      role: '',
      outcome: ''
    })

    setEditingId(null)
  }

  async function refreshProjects() {
    const response = await fetch(`${API_URL}/projects`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Unable to load projects')
    }

    setProjects(data)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      const url = editingId
        ? `${API_URL}/projects/${editingId}`
        : `${API_URL}/projects`

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to save project')
      }

      await refreshProjects()

      setSuccess(
        editingId
          ? 'Project updated successfully!'
          : 'Project added successfully!'
      )

      resetForm()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  function handleEdit(project) {
    setEditingId(project._id)

    setFormData({
      title: project.title || '',
      description: project.description || '',
      image: project.image || '',
      role: project.role || '',
      outcome: project.outcome || ''
    })

    setError('')
    setSuccess('')

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return
    }

    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${API_URL}/projects/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to delete project')
      }

      await refreshProjects()
      setSuccess('Project deleted successfully!')
    } catch (err) {
      setError(err.message)
    }
  }

  if (!user) {
    return (
      <div className="page-container">
        <h1>My Projects</h1>
        <p>Please <Link to="/signin">sign in</Link> to view projects.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="page-container">
        <h1>My Projects</h1>
        <p>Loading projects...</p>
      </div>
    )
  }

  return (
    <div className="page-container">
      <h1>My Projects</h1>

      {error && <p className="error-message">{error}</p>}
      {success && <p>{success}</p>}

      {isAdmin && (
        <div className="contact-form">
          <h2>{editingId ? 'Edit Project' : 'Add New Project'}</h2>

          <form onSubmit={handleSubmit}>
            <label htmlFor="title">Project Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              required
            />

            <label htmlFor="image">Project Image Path</label>
            <input
              type="text"
              id="image"
              name="image"
              placeholder="/images/project.svg"
              value={formData.image}
              onChange={handleChange}
            />

            <label htmlFor="role">My Role</label>
            <input
              type="text"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            />

            <label htmlFor="outcome">Project Outcome</label>
            <textarea
              id="outcome"
              name="outcome"
              rows="3"
              value={formData.outcome}
              onChange={handleChange}
              required
            />

            <button
              type="submit"
              className="home-button"
              disabled={submitting}
            >
              {submitting
                ? 'Saving...'
                : editingId
                  ? 'Update Project'
                  : 'Add Project'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </form>
        </div>
      )}

      <div className="projects-grid">
        {projects.map((project) => (
          <div className="project-card" key={project._id}>
            {project.image && (
              <img
                src={project.image}
                alt={project.title}
                className="project-image"
              />
            )}

            <h2>{project.title}</h2>

            <p>{project.description}</p>

            <p>
              <strong>My Role:</strong> {project.role}
            </p>

            <p>
              <strong>Outcome:</strong> {project.outcome}
            </p>

            {isAdmin && (
              <div>
                <button
                  type="button"
                  onClick={() => handleEdit(project)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(project._id)}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <p>No projects have been added yet.</p>
      )}
    </div>
  )
}

export default Projects