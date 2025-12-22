import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import WhyUs from "@/components/WhyUs";
import ContactUs from "@/components/ContactUs"; // <--- Change this from Contact to ContactUs

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <navbar />
      <hero />
      <howitworks />
      <whyus />
      <contactus /> {/* <--- Change this from Contact to ContactUs */}
      <footer className="py-10 border-t border-gray-100 text-center text-gray-500 text-sm">
        <p>&copy; 2024 Finishment Clone. Built with Next.js.</p>
      </footer>
    </main>
  );
}

