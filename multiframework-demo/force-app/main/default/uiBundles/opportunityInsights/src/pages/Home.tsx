import { useState } from 'react';
import { OpportunityList } from '../components/OpportunityList';
import { OpportunitySpotlightCards } from '../components/OpportunitySpotlightCards';
import { CustomerSuccessCards } from '../components/CustomerSuccessCards';
import { OpportunityDetailDrawer } from '../components/OpportunityDetailDrawer';
import { CustomerSuccessDetailDrawer } from '../components/CustomerSuccessDetailDrawer';
import { OpportunitySpotlight } from '../api/opportunitySpotlight';
import { CustomerSuccessHighlight } from '../api/customerSuccessData';

export default function Home() {
  const [selectedSpotlight, setSelectedSpotlight] = useState<OpportunitySpotlight | null>(null);
  const [selectedProject, setSelectedProject] = useState<CustomerSuccessHighlight | null>(null);

  return (
    <div className="min-h-screen bg-[#0b0b0b]">
      {/* Page header */}
      <div className="border-b border-[#252525]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#c9a96e] mb-3">
            Opportunity Front-Page
          </p>
          <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-[#f0ece6] leading-tight">
            Pipeline Intelligence
          </h1>
          <p className="mt-2 text-[14px] text-[#6b6560] max-w-lg leading-relaxed">
            AI-generated health signals and next-step recommendations across your open opportunities.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Two-column intelligence feed — both columns have 3 cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <OpportunitySpotlightCards onSelect={setSelectedSpotlight} />
          <CustomerSuccessCards onSelect={setSelectedProject} />
        </div>

        {/* Full-width opportunity list */}
        <OpportunityList
          onOpportunityClick={(opp) => {
            console.log('Opportunity clicked:', opp);
          }}
        />
      </div>

      <OpportunityDetailDrawer
        open={!!selectedSpotlight}
        spotlight={selectedSpotlight}
        primaryContact={null}
        onClose={() => setSelectedSpotlight(null)}
      />
      <CustomerSuccessDetailDrawer
        open={!!selectedProject}
        highlight={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
}
