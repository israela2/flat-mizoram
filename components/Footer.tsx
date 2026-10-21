import Link from 'next/link'
import { Facebook, Instagram, Youtube, Mail, MapPin } from 'lucide-react'

export function Footer() {
  return <footer className="footer">
    <div className="container footer-grid">
      <div className="footer-brand">
        <img src="/flat-logo.png" alt="FLAT" />
        <h3>FULL LIFE ACCESS TRUST</h3>
        <p>NUNTAM KAILAWN</p>
        <span>Co-creating safe spaces with young people in Mizoram.</span>
      </div>
      <div><h4>ABOUT</h4><Link href="/about">Who We Are</Link><Link href="/about#story">Our Story</Link><Link href="/about#values">Vision & PRIME</Link><Link href="/about#fifth-space">Fifth Space</Link></div>
      <div><h4>OUR WORK</h4><Link href="/our-work">Safe Spaces & Wellbeing</Link><Link href="/our-work">Life Skills</Link><Link href="/our-work">Safety & Protection</Link><Link href="/our-work">Youth Leadership</Link></div>
      <div><h4>LEARN</h4><Link href="/impact">Impact & Learning</Link><Link href="/stories">Stories & Youth Voices</Link><Link href="/reports">Annual Reports & Resources</Link><Link href="/transparency">Financial Transparency</Link></div>
      <div><h4>GET INVOLVED</h4><Link href="/donate">Donate / Support</Link><Link href="/get-involved">Partner with FLAT</Link><Link href="/get-involved">Volunteer & Internships</Link><Link href="/get-involved">Careers</Link></div>
      <div><h4>CONTACT</h4><p className="contact-line"><MapPin size={15}/> Ka Ṭhiante In, Lunglei</p><p className="contact-line"><MapPin size={15}/> Registered Office, Aizawl</p><Link className="contact-line" href="/contact"><Mail size={15}/> Contact FLAT</Link></div>
    </div>
    <div className="container footer-bottom">
      <div className="socials"><a href="https://facebook.com/FLAT2015" aria-label="Facebook" target="_blank" rel="noreferrer"><Facebook size={18}/></a><a href="https://instagram.com/ka_thiante_in" aria-label="Instagram" target="_blank" rel="noreferrer"><Instagram size={18}/></a><a href="https://www.youtube.com/" aria-label="YouTube" target="_blank" rel="noreferrer"><Youtube size={18}/></a></div>
      <span>© {new Date().getFullYear()} FLAT / Nuntam Kailawn</span>
      <div className="legal"><Link href="/transparency">Transparency</Link><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms of Use</Link><Link href="/safeguarding">Safeguarding</Link><Link href="/reports">Reports</Link></div>
    </div>
  </footer>
}
