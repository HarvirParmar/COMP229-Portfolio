import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, API_URL } from '../AuthContext'

function Contact() {
  const { user, token, isAdmin } = useAuth()

  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    message: ''
  })

  async function loadContacts() {
    const response = await fetch(`${API_URL}/contacts`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Unable to load contact messages')
    }

    setContacts(data)
  }

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    async function fetchContacts() {
      try {
        await loadContacts()
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()
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
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      message: ''
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
        ? `${API_URL}/contacts/${editingId}`
        : `${API_URL}/contacts`

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(editingId && {
            Authorization: `Bearer ${token}`
          })
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to submit contact message')
      }

      if (token) {
        await loadContacts()
      }

      setSuccess(
        editingId
          ? 'Contact message updated successfully!'
          : 'Your message has been sent successfully!'
      )

      resetForm()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  function handleEdit(contact) {
    setEditingId(contact._id)

    setFormData({
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      phone: contact.phone || '',
      email: contact.email || '',
      message: contact.message || ''
    })

    setError('')
    setSuccess('')

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return
    }

    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${API_URL}/contacts/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to delete message')
      }

      await loadContacts()
      setSuccess('Contact message deleted successfully!')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page-container">
      <h1>Contact Me</h1>

      <div className="contact-info">
        <h2>Contact Information</h2>
        <p>
          Email:{' '}
          <a href="mailto:harvirparmar6@gmail.com">
            harvirparmar6@gmail.com
          </a>
        </p>
        <p>Phone: (555) 010-1234</p>
      </div>

      <form className="contact-form" onSubmit={handleSubmit}>
        <h2>{editingId ? 'Edit Contact Message' : 'Send a Message'}</h2>

        <label htmlFor="firstName">First Name</label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
        />

        <label htmlFor="lastName">Last Name</label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
        />

        <label htmlFor="phone">Contact Number</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />

        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          rows="6"
          value={formData.message}
          onChange={handleChange}
          required
        />

        {error && <p className="error-message">{error}</p>}
        {success && <p>{success}</p>}

        <button
          type="submit"
          className="home-button"
          disabled={submitting}
        >
          {submitting
            ? 'Saving...'
            : editingId
              ? 'Update Message'
              : 'Send Message'}
        </button>

        {editingId && (
          <button type="button" onClick={resetForm}>
            Cancel
          </button>
        )}
      </form>

      {user && (
        <div className="contact-messages">
          <h2>Contact Messages</h2>

          {loading ? (
            <p>Loading messages...</p>
          ) : (
            <>
              {contacts.map((contact) => (
                <div className="project-card" key={contact._id}>
                  <h3>
                    {contact.firstName} {contact.lastName}
                  </h3>

                  <p><strong>Email:</strong> {contact.email}</p>
                  <p><strong>Phone:</strong> {contact.phone}</p>
                  <p><strong>Message:</strong> {contact.message}</p>

                  {isAdmin && (
                    <div>
                      <button
                        type="button"
                        onClick={() => handleEdit(contact)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(contact._id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {contacts.length === 0 && (
                <p>No contact messages have been submitted yet.</p>
              )}
            </>
          )}
        </div>
      )}

      {!user && (
        <p>
          <Link to="/signin">Sign in</Link> to view contact messages.
        </p>
      )}
    </div>
  )
}

export default Contact