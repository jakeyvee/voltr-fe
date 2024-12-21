import Hero from "@/components/hero-home";
import Waitlist from "@/components/waitlist";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-15.5rem)]">
      <Hero />
      <Waitlist />
    </div>
  );
}
