'use client'

import Link from 'next/link'
import { Menu, X, HeartHandshake, ChevronDown } from 'lucide-react'
import { useState } from 'react'

const nav = [
  { label: 'About FLAT', href: '/about' },
  { label: 'Our Work', href: '/our-work' },
  { label: 'Ka Ṭhiante In', href: '/ka-thiante-in' },
  { label: 'Impact & Learning', href: '/impact' },
  { label: 'Stories & News', href: '/stories' },
  { label: 'Get Involved', href: '/get-involved' },
  { label: 'Contact', href: '/contact' },
]

export function Header() {
  const [open, setOpen] = useState(false)
  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <img src="/flat-logo.png" alt="Full Life Access Trust logo" />
          <span><b>FULL LIFE ACCESS TRUST</b><small>NUNTAM KAILAWN</small></span>
        </Link>
        <nav className="desktop-nav">
          {nav.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </nav>
        <Link href="/donate" className="support-btn"><HeartHandshake size={17} /> Support FLAT</Link>
        <button className="menu-btn" aria-label="Toggle menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && <div className="mobile-nav"><div className="container">{nav.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</Link>)}<Link href="/donate" className="support-btn" onClick={() => setOpen(false)}>Support FLAT</Link></div></div>}
    </header>
  )
}
