import { OpportunityList } from '../components/OpportunityList';

export default function Home() {
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
        <OpportunityList
          onOpportunityClick={(opp) => {
            console.log('Opportunity clicked:', opp);
          }}
        />
      </div>

    </div>
  );
}
