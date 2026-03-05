import dynamic from 'next/dynamic'
import Navbar from "../components/navbar"
import Hero from "../components/hero"

const HowItWorks = dynamic(() => import("../components/howitworks"))
const WhyUs = dynamic(() => import("../components/whyus"))
const FAQ = dynamic(() => import("../components/faq"))
const ContactUs = dynamic(() => import("../components/contactus"))

export default function Page() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      <HowItWorks />
      <WhyUs />
      <FAQ />
      <ContactUs />
    </main>
  );
}
