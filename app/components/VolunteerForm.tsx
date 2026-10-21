
'use client'

import { FormEvent, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function VolunteerForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [interest, setInterest] = useState('Youth activities')
  const [availability, setAvailability] = useState('Flexible')
  const [motivation, setMotivation] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('')
    setSuccess(false)

    if (!supabase) {
      setStatus('Application service is not configured. Please try again later.')
      return
    }

    setBusy(true)

    try {
      const { error } = await supabase
        .from('volunteer_applications')
        .insert({
          full_name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          location: location.trim() || null,
          area_of_interest: interest,
          availability,
          motivation: motivation.trim(),
        })

      if (error) {
        console.error('Volunteer application failed:', error.message)
        setStatus('Your application could not be submitted. Please try again later.')
        return
      }

      setSuccess(true)
      setStatus('Thank you for your interest. Your application has been received.')
      setName('')
      setEmail('')
      setPhone('')
      setLocation('')
      setInterest('Youth activities')
      setAvailability('Flexible')
      setMotivation('')
    } catch (error) {
      console.error('Volunteer application error:', error)
      setStatus('Something went wrong. Please try again later.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="office volunteer-form-card" style={{ marginTop: 32 }}>
      <span className="eyebrow">VOLUNTEER WITH FLAT</span>
      <h2>Tell us how you would like to contribute.</h2>
      <p>
        Share your interests and availability. Our team can review your
        application and follow up where appropriate.
      </p>

      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="contact-form-grid">
          <div className="contact-field">
            <label htmlFor="volunteer-name">Full name *</label>
            <input
              id="volunteer-name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={120}
              placeholder="Your full name"
            />
          </div>

          <div className="contact-field">
            <label htmlFor="volunteer-email">Email address *</label>
            <input
              id="volunteer-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={254}
              placeholder="you@example.com"
            />
          </div>

          <div className="contact-field">
            <label htmlFor="volunteer-phone">Phone number (optional)</label>
            <input
              id="volunteer-phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={30}
              placeholder="Your contact number"
            />
          </div>

          <div className="contact-field">
            <label htmlFor="volunteer-location">Town / District (optional)</label>
            <input
              id="volunteer-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={120}
              placeholder="e.g. Lunglei"
            />
          </div>

          <div className="contact-field">
            <label htmlFor="volunteer-interest">Area of interest *</label>
            <select
              id="volunteer-interest"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              required
            >
              <option>Youth activities</option>
              <option>Peer leadership</option>
              <option>Life skills and workshops</option>
              <option>Child protection and awareness</option>
              <option>Events and outreach</option>
              <option>Professional skills and mentoring</option>
              <option>Administration and communications</option>
              <option>Other</option>
            </select>
          </div>

          <div className="contact-field">
            <label htmlFor="volunteer-availability">Availability *</label>
            <select
              id="volunteer-availability"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              required
            >
              <option>Flexible</option>
              <option>Weekdays</option>
              <option>Weekends</option>
              <option>Occasional events</option>
              <option>Remote / online</option>
            </select>
          </div>

          <div className="contact-field contact-field-full">
            <label htmlFor="volunteer-motivation">
              Why would you like to volunteer with FLAT? *
            </label>
            <textarea
              id="volunteer-motivation"
              rows={5}
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              required
              minLength={10}
              maxLength={3000}
              placeholder="Tell us about your interests, skills or motivation."
            />
          </div>
        </div>

        <p className="admin-help">
          Please do not include sensitive personal information. Submitting an
          application does not guarantee a volunteer placement.
        </p>

        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? 'Submitting application…' : 'Submit volunteer application'}
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
