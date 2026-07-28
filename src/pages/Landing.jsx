import LandingNav from '@/components/landing/LandingNav';
import Hero from '@/components/landing/Hero';
import TrustBar from '@/components/landing/TrustBar';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import Security from '@/components/landing/Security';
import Testimonials from '@/components/landing/Testimonials';
import Pricing from '@/components/landing/Pricing';
import FinalCTA from '@/components/landing/FinalCTA';
import LandingFooter from '@/components/landing/LandingFooter';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <LandingNav />
      <main>
        <Hero />
        <TrustBar />
        <Features />
        <HowItWorks />
        <Security />
        <Testimonials />
        <Pricing />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}