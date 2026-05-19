import HeroSection from "../components/home/HeroSection";
import CategoryIcons from "../components/home/CategoryIcons";
import GiftFinderSection from "../components/home/GiftFinderSection";
import WhyChooseSection from "../components/home/WhyChooseSection";
import ChatSection from "../components/home/ChatSection";
import AboutSection from "../components/home/AboutSection";
import CTASection from "../components/home/CTASection";

function Home() {
  return (
    <div className="min-h-screen bg-[#F5F2EF] text-[#1E1B1B]">
      <HeroSection />
      <CategoryIcons />
      <GiftFinderSection />
      <WhyChooseSection />
      <ChatSection />
      <AboutSection />
      <CTASection />
    </div>
  );
}

export default Home;