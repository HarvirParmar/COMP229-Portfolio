import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Contact() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    message: '',
  })

  function handleChange(event) {
    const { name, value } = event.target

    setFormData({
      ...formData,
      [name]: value,
    })
  }

  function handleSubmit(event) {
    event.preventDefault()
    navigate('/')
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
        ></textarea>

        <button type="submit" className="home-button">
          Send Message
        </button>
      </form>
    </div>
  )
}

export default Contact