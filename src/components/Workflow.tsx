import React from 'react';
import { Compass, ScrollText, PenTool, ClipboardCheck, ArrowUpRight } from 'lucide-react';
import { Button } from './ui/Button';

export const Workflow: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Discover opportunities',
      desc: 'Our AI analyzes your research profile and matches it with thousands of open calls in real time.',
      icon: <Compass className="h-5 w-5 text-brand-400" />,
    },
    {
      num: '02',
      title: 'Auto-compile templates',
      desc: 'Instantly generate compliant document packages preconfigured to the funder’s specific rules.',
      icon: <ScrollText className="h-5 w-5 text-indigo-400" />,
    },
    {
      num: '03',
      title: 'Collaborative drafting',
      desc: 'Co-write sections alongside investigators with automated citations and AI autocomplete assistance.',
      icon: <PenTool className="h-5 w-5 text-purple-400" />,
    },
    {
      num: '04',
      title: 'Submit & monitor spend',
      desc: 'Submit proposals with institutional checks, and monitor fund distributions once won.',
      icon: <ClipboardCheck className="h-5 w-5 text-emerald-400" />,
    },
  ];

  return (
    <section id="workflow" className="relative py-24 md:py-32 bg-dark-950/40 border-t border-b border-dark-900/60">
      <div className="absolute bottom-[20%] right-[10%] h-[400px] w-[400px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <h2 className="inline-flex items-center space-x-1.5 rounded-full border border-dark-800 bg-dark-900/60 px-3.5 py-1 text-xs font-semibold text-dark-300 uppercase tracking-wider mb-6">
            <span>Workflow</span>
          </h2>
          <h3 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            A Structured Path to Higher Win Rates
          </h3>
          <p className="text-base sm:text-lg text-dark-400">
            From the initial search to final submission, GrantFlow keeps your investigators organized, compliant, and ahead of deadline schedules.
          </p>
        </div>

        {/* Workflow Timeline Items */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative mb-20">
          {/* Connector line for desktop */}
          <div className="hidden md:block absolute top-[54px] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-brand-500/20 via-indigo-500/20 to-emerald-500/20 z-0" />
          
          {steps.map((step) => (
            <div key={step.num} className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left group">
              {/* Step indicator */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-dark-950 border border-dark-800 shadow-md group-hover:border-brand-500/50 transition-colors duration-300 mb-6">
                {step.icon}
              </div>

              {/* Step details */}
              <span className="text-xs font-extrabold text-brand-500 mb-2">{step.num}</span>
              <h4 className="text-lg font-bold text-white mb-3">{step.title}</h4>
              <p className="text-sm text-dark-400 leading-relaxed max-w-xs">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* High impact final CTA panel */}
        <div className="relative overflow-hidden rounded-3xl border border-dark-800 bg-gradient-to-tr from-dark-950 to-dark-900/80 p-8 md:p-12 shadow-2xl">
          <div className="absolute top-0 right-0 h-80 w-80 bg-brand-500/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl text-center lg:text-left">
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white mb-4">
                Ready to transform your institutional pipeline?
              </h3>
              <p className="text-sm sm:text-base text-dark-300">
                Join leading research departments, laboratories, and universities using GrantFlow to maximize funding yields. Get set up in under 10 minutes.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto shrink-0">
              <Button variant="primary" size="lg" className="w-full sm:w-auto group">
                <span>Deploy GrantFlow</span>
                <ArrowUpRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Schedule pilot call
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
