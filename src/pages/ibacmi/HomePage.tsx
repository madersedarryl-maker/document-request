import React from 'react';
import { HeroBanner } from '../../components/ibacmi/HeroBanner';
import { QuickStats } from '../../components/ibacmi/QuickStats';
import { ProgramsSection } from '../../components/ibacmi/ProgramsSection';
import { FacilitiesSection } from '../../components/ibacmi/FacilitiesSection';
import { OnlineServicesHub } from '../../components/ibacmi/OnlineServicesHub';
import { AboutSection } from '../../components/ibacmi/AboutSection';
import { NewsSection } from '../../components/ibacmi/NewsSection';
import { ContactSection } from '../../components/ibacmi/ContactSection';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-0">
      {/* Hero Banner with Search & Direct Document Action */}
      <HeroBanner />

      {/* Quick Stats Bar */}
      <QuickStats />

      {/* Featured Programs Section */}
      <ProgramsSection
        initialCategory="all"
        limit={6}
        title="Academic Degrees & Offerings"
        subtitle="Explore our undergraduate degrees, TESDA certifications, and Senior High School strands."
      />

      {/* Online Document & Institutional Portals Hub */}
      <OnlineServicesHub />

      {/* Campus Facilities & Laboratories */}
      <FacilitiesSection />

      {/* About IBACMI: Vision, Mission & Core Values */}
      <AboutSection />

      {/* News & Events Bulletin */}
      <NewsSection limit={4} />

      {/* Contact & Campus Location */}
      <ContactSection />
    </div>
  );
};
