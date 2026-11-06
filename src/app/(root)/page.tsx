import Hero from "@/components/homepage/Hero";
import { Categories } from "@/components/homepage/Categories";
import { TopRatedStudios } from "@/components/homepage/TopRatedStudios";
import HowItWorks from "@/components/homepage/HowItWorks";
import GuaranteeAndSupport from "@/components/homepage/Guarantee&Support";

export default function Home() {
  return (
    <div>
      <Hero />
      <TopRatedStudios />
      <Categories />
      <HowItWorks />
      <GuaranteeAndSupport />
    </div>
  );
}
