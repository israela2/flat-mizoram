
import Link from 'next/link'
import { ArrowRight, HeartHandshake } from 'lucide-react'
import { Pillars } from '@/components/Pillars'
import { SectionHeading } from '@/components/SectionHeading'
import { NewsletterForm } from './components/NewsletterForm'

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="kicker">
              FULL LIFE ACCESS TRUST · NUNTAM KAILAWN
            </span>
            <h1>Co-creating safe spaces with young people in Mizoram.</h1>
            <p>
              Prevention-first youth development, rooted in Mizoram. We work
              with children, adolescents and young people to build wellbeing,
              safety, confidence, skills and leadership.
            </p>
            <div className="hero-actions">
              <Link href="/our-work" className="btn btn-primary">
                Explore Our Work <ArrowRight size={17} />
              </Link>
              <Link href="/donate" className="btn btn-outline">
                Support FLAT
              </Link>
            </div>
          </div>

          <div className="hero-card">
            <img className="mark" src="/flat-logo.png" alt="FLAT logo" />
            <h3>A place to be heard, safe, skilled and leading.</h3>
            <p>
              FLAT connects young people with safe spaces, learning, support
              and pathways to meaningful participation.
            </p>
          </div>
        </div>
      </section>

      <Pillars />

      <section className="section">
        <div className="container split">
          <div className="story-card">
            <div className="quote">
              “Where do young people go when they need to talk, feel safe, be
              understood, or simply be themselves?”
            </div>
          </div>
          <div>
            <SectionHeading
              eyebrow="Why FLAT exists"
              title="Young people need spaces where they feel heard, accepted and supported."
              text="FLAT began from concern about the emotional struggles, identity issues, relationships, pressure and fear of judgment that many young people carry silently."
            />
            <Link
              href="/about#story"
              className="btn"
              style={{ background: 'var(--dark)', color: '#fff' }}
            >
              Discover our story <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section cream" id="fifth-space">
        <div className="container split">
          <div>
            <SectionHeading
              eyebrow="Our approach"
              title="The Fifth Space"
              text="FLAT functions as a complementary space that bridges the gaps between home, school, church, peers and society."
            />
            <div className="space-chain">
              <span>Home</span>
              <span>School</span>
              <span>Church</span>
              <span>Peers</span>
              <span>Society</span>
            </div>
            <Link
              href="/about#fifth-space"
              className="btn"
              style={{ background: 'var(--green)', color: '#fff' }}
            >
              Discover the Fifth Space
            </Link>
          </div>

          <div className="fifth">
            <span className="eyebrow" style={{ color: '#8fe0a6' }}>
              A complementary space
            </span>
            <h2>Belong. Express. Learn. Grow.</h2>
            <p>
              A space where young people can express themselves freely,
              explore identity and emotions, access guidance and mentoring,
              build life skills and leadership, and experience belonging.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="What we do"
            title="Our work connects safe spaces, skills, protection and leadership."
          />
          <div className="cards">
            <div className="card">
              <span className="tag">01 · HEARD</span>
              <h3>Safe Spaces & Emotional Wellbeing</h3>
              <p>
                Ka Ṭhiante In, Listening Room, Talk It Out Café, mental health
                and psychosocial support.
              </p>
              <Link href="/our-work">Explore programme →</Link>
            </div>

            <div className="card">
              <span className="tag">02 · SKILLED</span>
              <h3>Life Skills & Personal Development</h3>
              <p>
                Core life skills alongside career readiness, digital literacy
                and entrepreneurship exposure.
              </p>
              <Link href="/our-work">Explore programme →</Link>
            </div>

            <div className="card">
              <span className="tag">03 · SAFE</span>
              <h3>Safety & Protection</h3>
              <p>
                Personal Safety Education Programme working with children,
                parents, teachers, schools and communities.
              </p>
              <Link href="/our-work">Explore programme →</Link>
            </div>

            <div className="card">
              <span className="tag">04 · LEADING</span>
              <h3>Youth Leadership & Participation</h3>
              <p>
                Youth groups, leadership workshops, peer-led initiatives and
                community engagement.
              </p>
              <Link href="/our-work">Explore programme →</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section cream">
        <div className="container">
          <SectionHeading
            eyebrow="The FLAT journey"
            title="From belonging to contribution."
            text="Programmes can form developmental pathways rather than isolated activities."
          />
          <div className="journey">
            <span>BELONG</span>
            <i>→</i>
            <span>EXPRESS</span>
            <i>→</i>
            <span>LEARN</span>
            <i>→</i>
            <span>GROW</span>
            <i>→</i>
            <span>LEAD</span>
            <i>→</i>
            <span>CONTRIBUTE</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Ka Ṭhiante In"
            title="My Friend’s Place"
            text="A youth-centred safe space in Lunglei: a hangout space, listening space, learning hub and youth resource centre."
          />

          <div className="split">
            <div className="fifth">
              <span className="eyebrow" style={{ color: '#8fe0a6' }}>
                Since 2017
              </span>
              <h2>You can talk. Reflect. Learn. Connect.</h2>
              <p>
                Ka Ṭhiante In includes a Listening Room, Reading Room, Youth
                Café and informal discussion and mentoring spaces.
              </p>
              <Link href="/ka-thiante-in" className="btn btn-primary">
                Visit Ka Ṭhiante In <ArrowRight size={16} />
              </Link>
            </div>

            <div className="numbers">
              <div className="number">
                <strong>3,000+</strong>
                <span>
                  children reached through Personal Safety Education Programs
                </span>
              </div>
              <div className="number">
                <strong>990+</strong>
                <span>young people engaged through Life Skills Education</span>
              </div>
              <div className="number">
                <strong>9,400+</strong>
                <span>visitors welcomed at Ka Ṭhiante In since 2017</span>
              </div>
              <div className="number">
                <strong>2015</strong>
                <span>FLAT founded by young social work graduates</span>
              </div>
            </div>

            <p className="impact-note">
              Figures are drawn from the current FLAT Organisation Profile.
              Reporting periods and current totals should be verified before
              publication.
            </p>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container cta-inner">
          <div>
            <h2>Help build spaces where young people can thrive.</h2>
            <p>Partner, volunteer, participate or support FLAT.</p>
          </div>
          <Link href="/get-involved" className="btn btn-primary">
            Get Involved <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="section cream" id="newsletter">
        <div className="container split">
          <div>
            <SectionHeading
              eyebrow="STAY CONNECTED"
              title="Keep in touch with FLAT."
              text="Receive updates, stories and news about our work with children, adolescents and young people in Mizoram."
            />
          </div>
          <div className="office">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  )
}
