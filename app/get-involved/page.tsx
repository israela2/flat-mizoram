
import { SectionHeading } from '@/components/SectionHeading'
import Link from 'next/link'
import { VolunteerForm } from '../components/VolunteerForm'
const people = [
  ['Young People', 'Join FLAT, youth membership, Ka Ṭhiante In, youth activities, volunteering and peer leadership.'],
  ['Schools & Colleges', 'PSEP, life skills, workshops, youth programmes and institutional partnerships.'],
  ['Churches & Communities', 'Community partnership, youth engagement and awareness/prevention collaboration.'],
  ['Professionals', 'Counsellors, resource persons, trainers, facilitators, mentors and consultants.'],
  ['Corporate / CSR', 'CSR partnerships, institutional giving, programme sponsorship and employee engagement.'],
  ['Volunteers & Careers', 'Volunteer applications, internships, vacancies and opportunities to contribute.'],
]

export default function GetInvolved() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">GET INVOLVED</span>
          <h1>There are many ways to walk alongside young people.</h1>
          <p>
            Choose the pathway that fits you — participate, partner, volunteer,
            share expertise, support a programme or help strengthen the
            ecosystem around young people.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cards">
            {people.map(([title, description]) => (
              <div className="card" key={title}>
                <span className="tag">GET INVOLVED</span>
                <h3>{title}</h3>
                <p>{description}</p>
                {title === 'Volunteers & Careers' ? (
                  <a href="#volunteer-application">Apply to volunteer ↓</a>
                ) : (
                  <Link href="/contact">Start a conversation →</Link>
                )}
              </div>
            ))}
          </div>

          <div id="volunteer-application">
            <VolunteerForm />
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container cta-inner">
          <div>
            <h2>Support FLAT</h2>
            <p>
              Help strengthen safe spaces, child protection, life skills,
              wellbeing and youth leadership.
            </p>
          </div>
          <Link href="/donate" className="btn btn-primary">
            Support FLAT
          </Link>
        </div>
      </section>
    </>
  )
}
