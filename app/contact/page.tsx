
import { SectionHeading } from '@/components/SectionHeading'
import { ContactForm } from '../components/ContactForm'
export default function Contact() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">CONTACT</span>
          <h1>Connect with FLAT.</h1>
          <p>
            For partnerships, programmes, volunteering, media or general
            enquiries, reach out through the appropriate route.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Our offices"
            title="Find us in Lunglei and Aizawl"
          />

          <div className="contact-box">
            <div className="office">
              <h3>Main / Head Office · Ka Ṭhiante In</h3>
              <p>
                Above LRP Flex &amp; Offset
                <br />
                Opp. District Industries Centre
                <br />
                Near Axis Bank, Venglai
                <br />
                Lunglei – 796701, Mizoram
              </p>
            </div>

            <div className="office">
              <h3>Registered Office</h3>
              <p>
                Block C, M II/13/1
                <br />
                Chaltlang Ruam Veng
                <br />
                Aizawl – 796012, Mizoram
              </p>
            </div>
          </div>

          <ContactForm />

          <div className="notice" style={{ marginTop: 20 }}>
            Phone numbers, email addresses, map links, opening hours and
            safeguarding contact routes should be verified against FLAT’s
            latest records before launch.
          </div>
        </div>
      </section>
    </>
  )
}
