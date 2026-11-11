import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, API_URL } from '../AuthContext'

function Education() {
  const { user, token, isAdmin } = useAuth()

  const [education, setEducation] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    institution: '',
    program: '',
    credential: '',
    duration: ''
  })

  async function loadEducation() {
    const response = await fetch(`${API_URL}/qualifications`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Unable to load education')
    }

    setEducation(data)
  }

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    async function fetchEducation() {
      try {
        await loadEducation()
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchEducation()
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
      institution: '',
      program: '',
      credential: '',
      duration: ''
    })

    setEditingId(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      const url = editingId
        ? `${API_URL}/qualifications/${editingId}`
        : `${API_URL}/qualifications`

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
        throw new Error(data.error || 'Unable to save education')
      }

      await loadEducation()

      setSuccess(
        editingId
          ? 'Education updated successfully!'
          : 'Education added successfully!'
      )

      resetForm()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  function handleEdit(item) {
    setEditingId(item._id)

    setFormData({
      institution: item.institution || '',
      program: item.program || '',
      credential: item.credential || '',
      duration: item.duration || ''
    })

    setError('')
    setSuccess('')

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this education record?')) {
      return
    }

    setError('')
    setSuccess('')

    try {
      const response = await fetch(
        `${API_URL}/qualifications/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to delete education')
      }

      await loadEducation()
      setSuccess('Education record deleted successfully!')
    } catch (err) {
      setError(err.message)
    }
  }

  if (!user) {
    return (
      <div className="page-container">
        <h1>Education</h1>
        <p>Please <Link to="/signin">sign in</Link> to view education.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="page-container">
        <h1>Education</h1>
        <p>Loading education...</p>
      </div>
    )
  }

  return (
    <div className="page-container">
      <h1>Education</h1>

      {error && <p className="error-message">{error}</p>}
      {success && <p>{success}</p>}

      {isAdmin && (
        <div className="contact-form">
          <h2>{editingId ? 'Edit Education' : 'Add Education'}</h2>

          <form onSubmit={handleSubmit}>
            <label htmlFor="institution">Institution</label>
            <input
              type="text"
              id="institution"
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              required
            />

            <label htmlFor="program">Program</label>
            <input
              type="text"
              id="program"
              name="program"
              value={formData.program}
              onChange={handleChange}
              required
            />

            <label htmlFor="credential">Credential</label>
            <input
              type="text"
              id="credential"
              name="credential"
              value={formData.credential}
              onChange={handleChange}
              required
            />

            <label htmlFor="duration">Duration</label>
            <input
              type="text"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="2026 - Present"
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
                  ? 'Update Education'
                  : 'Add Education'}
            </button>

            {editingId && (
              <button type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </form>
        </div>
      )}

      <div className="education-list">
        {education.map((item) => (
          <div className="education-card" key={item._id}>
            <h2>{item.institution}</h2>
            <h3>{item.program}</h3>
            <p><strong>Credential:</strong> {item.credential}</p>
            <p><strong>Duration:</strong> {item.duration}</p>

            {isAdmin && (
              <div>
                <button
                  type="button"
                  onClick={() => handleEdit(item)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(item._id)}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {education.length === 0 && (
        <p>No education records have been added yet.</p>
      )}
    </div>
  )
}

export default Education