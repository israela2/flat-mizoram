
'use client'

import { FormEvent, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('')
    setSuccess(false)

    if (!consent) {
      setStatus('Please confirm that you agree to receive FLAT newsletter updates.')
      return
    }

    if (!supabase) {
      setStatus('The newsletter service is not configured yet.')
      return
    }

    setBusy(true)

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email: email.trim().toLowerCase(),
          consent: true,
        })

      if (error) {
        console.error('Newsletter signup failed:', error.code, error.message)

        if (error.code === '23505') {
          setStatus('This email address is already subscribed.')
        } else {
          setStatus('We could not complete your subscription. Please try again later.')
        }
        return
      }

      setEmail('')
      setConsent(false)
      setSuccess(true)
      setStatus('Thank you for subscribing to FLAT updates.')
    } catch (error) {
      console.error('Newsletter signup error:', error)
      setStatus('Something went wrong. Please try again later.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="newsletter-signup" aria-labelledby="newsletter-heading">
      <h2 id="newsletter-heading">Stay connected with FLAT</h2>
      <p>Receive updates, stories and news about our work with young people.</p>

      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="contact-field">
          <label htmlFor="newsletter-email">Email address</label>
          <input
            id="newsletter-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            maxLength={320}
            required
          />
        </div>

        <label className="newsletter-consent">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            required
          />
          <span>
            I agree to receive newsletter updates from FLAT. I understand I
            can unsubscribe from future updates.
          </span>
        </label>

        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? 'Subscribing…' : 'Subscribe'}
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
    </section>
  )
}
