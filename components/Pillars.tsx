import Link from 'next/link'

const pillars = [
  ['HEARD', 'Safe Spaces & Wellbeing', 'A place to express, listen, belong and find support.'],
  ['SAFE', 'Safety & Protection', 'Prevention, awareness and safeguarding for children and communities.'],
  ['SKILLED', 'Life Skills & Career', 'Practical skills, confidence, digital literacy and future readiness.'],
  ['LEADING', 'Youth Leadership', 'Pathways from participation to leadership and social contribution.'],
]
export function Pillars() { return <section className="pillars-section"><div className="container"><div className="pillar-grid">{pillars.map(([key,title,text]) => <Link href="/our-work" className="pillar-card" key={key}><span>{key}</span><h3>{title}</h3><p>{text}</p><b>Explore →</b></Link>)}</div></div></section> }
