import { About } from "@/components/launch_components/About";
import { Contact } from "@/components/launch_components/Contact";
import { Faculty } from "@/components/launch_components/Faculty";
import { Footer } from "@/components/launch_components/Footer";
import { Hero } from "@/components/launch_components/Hero";
import { Navigation } from "@/components/launch_components/Navigation";
import { Programs } from "@/components/launch_components/Programs";

export default function LaunchScreen() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navigation />
      <main>
        <Hero />
        <About />
        <Programs />
        <Faculty />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}