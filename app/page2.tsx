import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import WhyUs from "../components/WhyUs";
import ContactUs from "../components/ContactUs";

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