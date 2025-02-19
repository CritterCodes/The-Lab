import HeroSection from './components/landing/hero';
import AboutUsSection from './components/landing/about';
import MembershipHighlights from './components/landing/membership';
import ContactSection from './components/landing/contact';
import Footer from './components/layout/footer';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <AboutUsSection />
      <MembershipHighlights />
      <ContactSection />
      <Footer />
    </div>
  );
}
