import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/landing/HeroSection';
import { DemoChat } from '@/components/landing/DemoChat';
import { FloatingSideCards } from '@/components/landing/FloatingSideCards';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Testimonials } from '@/components/landing/Testimonials';
import { PricingSection } from '@/components/landing/PricingSection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main>
        <div className="relative">
          <FloatingSideCards />
          <HeroSection />
          <DemoChat />
        </div>
        <FeaturesGrid />
        <HowItWorks />
        <Testimonials />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}
