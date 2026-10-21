
'use client'

import { FormEvent, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [enquiryType, setEnquiryType] = useState('General enquiry')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('')
    setSuccess(false)

    if (!supabase) {
      setStatus('The enquiry service is not configured. Please try again later.')
      return
    }

    setBusy(true)

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert({
          name: name.trim(),
          email: email.trim(),
          enquiry_type: enquiryType,
          message: message.trim(),
        })

      if (error) {
        console.error('Contact submission failed:', error.message)
        setStatus('Your message could not be submitted. Please try again later.')
        return
      }

      setSuccess(true)
      setStatus('Thank you. Your message has been submitted successfully.')
      setName('')
      setEmail('')
      setEnquiryType('General enquiry')
      setMessage('')
    } catch (error) {
      console.error('Contact form error:', error)
      setStatus('Something went wrong. Please try again later.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="office contact-form-card" style={{ marginTop: 28 }}>
      <h2>Send us a message</h2>
      <p>Contact FLAT for general enquiries, programmes or partnerships.</p>

      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="contact-form-grid">
          <div className="contact-field">
            <label htmlFor="contact-name">Full name</label>
            <input
              id="contact-name"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={120}
              placeholder="Enter your full name"
            />
          </div>

          <div className="contact-field">
            <label htmlFor="contact-email">Email address</label>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={254}
              placeholder="you@example.com"
            />
          </div>

          <div className="contact-field contact-field-full">
            <label htmlFor="contact-type">Enquiry type</label>
            <select
              id="contact-type"
              name="enquiry_type"
              value={enquiryType}
              onChange={(e) => setEnquiryType(e.target.value)}
              required
            >
              <option>General enquiry</option>
              <option>Partnership</option>
              <option>Programme</option>
              <option>Media</option>
              <option>Volunteering</option>
            </select>
          </div>

          <div className="contact-field contact-field-full">
            <label htmlFor="contact-message">Your message</label>
            <textarea
              id="contact-message"
              name="message"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              minLength={10}
              maxLength={5000}
              placeholder="How can FLAT help you?"
            />
          </div>
        </div>

        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? 'Submitting…' : 'Send message'}
        </button>

        {status && (
          <p
            className={`contact-form-status ${success ? 'is-success' : 'is-error'}`}
            role="status"
            aria-live="polite"
          >
            {status}
          </p>
        )}
      </form>
    </div>
  )
}
