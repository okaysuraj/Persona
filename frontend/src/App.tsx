import { useState, useEffect } from 'react';
import { Navbar } from './components/landing/Navbar';
import { HeroSection } from './components/landing/HeroSection';
import { WhyMobileOnly } from './components/landing/WhyMobileOnly';
import { CompanionSouls } from './components/landing/CompanionSouls';
import { FeaturesDeepDive } from './components/landing/FeaturesDeepDive';
import { MobileAppPreview } from './components/landing/MobileAppPreview';
import { TestimonialsSection } from './components/landing/TestimonialsSection';
import { FAQSection } from './components/landing/FAQSection';
import { Footer } from './components/landing/Footer';
import { WaitlistModal } from './components/landing/WaitlistModal';

export function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('persona_theme');
      return saved ? saved === 'dark' : true;
    } catch {
      return true;
    }
  });

  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [selectedPersonaId, setSelectedPersonaId] = useState('maya-01');

  // Sync theme with DOM and local storage
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    try {
      localStorage.setItem('persona_theme', isDarkMode ? 'dark' : 'light');
    } catch {
      // Storage access might be restricted
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleOpenWaitlist = (personaId?: string) => {
    if (personaId) {
      setSelectedPersonaId(personaId);
    }
    setIsWaitlistOpen(true);
  };

  const handleCloseWaitlist = () => {
    setIsWaitlistOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#141312] dark:bg-[#121211] dark:text-[#F5F2EC] selection:bg-[#C85A32]/25 selection:text-[#C85A32] font-sans transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onOpenWaitlist={() => handleOpenWaitlist()}
      />

      <main>
        {/* Hero with live phone interactive mockup */}
        <HeroSection onOpenWaitlist={() => handleOpenWaitlist()} />

        {/* Why mobile only philosophy comparison */}
        <WhyMobileOnly />

        {/* Curated companion souls interactive showcase */}
        <CompanionSouls
          onSelectCompanion={(id) => setSelectedPersonaId(id)}
          onOpenWaitlist={() => handleOpenWaitlist(selectedPersonaId)}
        />

        {/* Cognitive monologue & memory features deep dive */}
        <FeaturesDeepDive />

        {/* Mobile React Native / Expo quickstart & QR scan */}
        <MobileAppPreview onOpenWaitlist={() => handleOpenWaitlist()} />

        {/* Early mobile user testimonials */}
        <TestimonialsSection />

        {/* Comprehensive FAQ */}
        <FAQSection />
      </main>

      {/* Editorial Footer */}
      <Footer onOpenWaitlist={() => handleOpenWaitlist()} />

      {/* Interactive Waitlist / Mobile Beta Modal */}
      <WaitlistModal
        isOpen={isWaitlistOpen}
        onClose={handleCloseWaitlist}
        preselectedPersona={selectedPersonaId}
      />
    </div>
  );
}

export default App;
