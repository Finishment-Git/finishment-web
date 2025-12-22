import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import HowItWorks from "@/components/howitworks";
import WhyUs from "@/components/whyus";
import ContactUs from "@/components/contactus";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-white text-black">
      <Navbar />
      <Hero />
      <HowItWorks />
      <WhyUs />
      <ContactUs />
      
      <footer className="py-10 border-t border-gray-100 text-center text-gray-500 text-sm mt-auto">
        <p>&copy; 2024 Finishment Clone. Built with Next.js.</p>
      </footer>
    </main>
  );
}