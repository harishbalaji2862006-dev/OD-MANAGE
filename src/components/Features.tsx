import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Search, Calculator, Users, ShieldCheck, Sparkles, FileText } from 'lucide-react';

export const Features: React.FC = () => {
  const items = [
    {
      id: 'feat-1',
      title: 'AI Opportunity Matching',
      desc: 'Scan global federal, corporate, and private databases. Instantly receive optimized matching recommendations based on your historical publications and project abstract.',
      icon: <Search className="h-5 w-5 text-brand-400" />,
    },
    {
      id: 'feat-2',
      title: 'Intelligent Budget Builder',
      desc: 'Build sub-awards, personnel scales, and indirect costs automatically. GrantFlow monitors budget caps, multi-year rate hikes, and sponsor constraints in real time.',
      icon: <Calculator className="h-5 w-5 text-indigo-400" />,
    },
    {
      id: 'feat-3',
      title: 'Real-Time Writing Space',
      desc: 'Collaborate with co-investigators inside a unified editor. Insert reference libraries, draft abstracts with AI autocomplete, and outline layouts simultaneously.',
      icon: <Users className="h-5 w-5 text-purple-400" />,
    },
    {
      id: 'feat-4',
      title: 'Auto-Compliance Check',
      desc: 'Verify margin requirements, page limitations, font sizes, and standard bio-sketch formats. Our rule-engine keeps you 100% compliant with grant guidelines.',
      icon: <ShieldCheck className="h-5 w-5 text-emerald-400" />,
    },
    {
      id: 'feat-5',
      title: 'Smart Templates & Blurbs',
      desc: 'Repurpose existing data, facilities text, and team histories. The platform index matches prior successful proposals to compile boilerplates in seconds.',
      icon: <Sparkles className="h-5 w-5 text-pink-400" />,
    },
    {
      id: 'feat-6',
      title: 'Funder Report Automation',
      desc: 'Generate annual progress reports, track budget spend-downs against milestones, and compile compliance artifacts required by sponsoring agencies.',
      icon: <FileText className="h-5 w-5 text-blue-400" />,
    },
  ];

  return (
    <section id="features" className="relative py-24 md:py-32">
      {/* Background radial highlight */}
      <div className="absolute top-[30%] left-[10%] h-[500px] w-[500px] rounded-full bg-brand-500/5 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <h2 className="inline-flex items-center space-x-1.5 rounded-full border border-dark-800 bg-dark-900/60 px-3.5 py-1 text-xs font-semibold text-dark-300 uppercase tracking-wider mb-6">
            <span>Features</span>
          </h2>
          <h3 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            Unified Grant Intelligence, From Pitch to Award
          </h3>
          <p className="text-base sm:text-lg text-dark-400">
            Ditch separate trackers, formatting tools, and messy email chains. GrantFlow consolidates the complete grant cycle into a single, compliant workspace.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card key={item.id} hoverGlow className="bg-dark-900/40 border border-dark-800 p-8 flex flex-col h-full justify-between">
              <div>
                <CardHeader className="p-0 mb-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-dark-950 border border-dark-800/80 shadow-md">
                    {item.icon}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <CardTitle className="text-lg font-bold text-white mb-2">{item.title}</CardTitle>
                  <CardDescription className="text-sm text-dark-400 leading-relaxed">{item.desc}</CardDescription>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
