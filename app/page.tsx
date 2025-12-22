import Navbar from "../components/navbar";
import Hero from "../components/hero";
import HowItWorks from "../components/howitworks";
import WhyUs from "../components/whyus";
import ContactUs from "../components/contactus";

export default function Page() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      <HowItWorks />
      <WhyUs />
      <ContactUs />
    </main>
  );
}