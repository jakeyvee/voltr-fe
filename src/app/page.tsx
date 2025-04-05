import Hero from "@/components/hero-home";
import MarketsTable from "@/components/market-table";
import Waitlist from "@/components/waitlist";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-15.5rem)]">
      <Hero />
      {/* {process.env.NEXT_PUBLIC_PRODUCTION_FLAG === "1" && <Waitlist />} */}
      <MarketsTable />
    </div>
  );
}
