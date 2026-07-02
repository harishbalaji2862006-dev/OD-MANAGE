import React from 'react';
import { Card } from './ui/Card';
import { ShieldCheck, BarChart3, Zap, Globe } from 'lucide-react';

export const Stats: React.FC = () => {
  const statistics = [
    {
      id: 'stat-1',
      metric: '$4.2B+',
      label: 'Research Funds Tracked',
      desc: 'Secured and managed by top university and enterprise research teams globally.',
      icon: <Globe className="h-5 w-5 text-indigo-400" />,
    },
    {
      id: 'stat-2',
      metric: '98.7%',
      label: 'Compliance Pass Rate',
      desc: 'Proposals verified against institutional federal, state, and private guidelines.',
      icon: <ShieldCheck className="h-5 w-5 text-emerald-400" />,
    },
    {
      id: 'stat-3',
      metric: '3.2x',
      label: 'Faster Submissions',
      desc: 'Accelerating collaborative document writing and outline approvals.',
      icon: <Zap className="h-5 w-5 text-brand-400" />,
    },
    {
      id: 'stat-4',
      metric: '18k+',
      label: 'Proposals Written',
      desc: 'High-quality outlines and compliance drafts output with AI assistance.',
      icon: <BarChart3 className="h-5 w-5 text-purple-400" />,
    },
  ];

  return (
    <section id="stats" className="relative py-20 border-t border-dark-900 bg-dark-950/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statistics.map((stat) => (
            <Card key={stat.id} hoverGlow className="flex flex-col justify-between p-8 border border-dark-800 bg-dark-900/30">
              <div className="space-y-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-dark-950 border border-dark-800 shadow-inner">
                  {stat.icon}
                </div>
                <div>
                  <h3 className="font-display text-4xl font-extrabold tracking-tight text-white mb-1">
                    {stat.metric}
                  </h3>
                  <p className="text-sm font-semibold text-dark-200">
                    {stat.label}
                  </p>
                </div>
                <p className="text-xs leading-relaxed text-dark-400">
                  {stat.desc}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
