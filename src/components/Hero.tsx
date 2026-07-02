import React from 'react';
import { ArrowRight, Sparkles, TrendingUp, CheckCircle2, Clock, Coins, Search, Plus, FileText, ChevronRight } from 'lucide-react';
import { Button } from './ui/Button';

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
      {/* Glow backgrounds */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-brand-500/10 blur-[120px] pointer-events-none" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-16 md:mb-20">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm font-semibold text-brand-300 mb-6 animate-fade-in">
            <Sparkles className="h-4 w-4 text-brand-400" />
            <span>AI-Driven Proposal Automation v2.0</span>
          </div>

          {/* Heading */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight sm:leading-none">
            Empower Your Research.<br />
            <span className="bg-gradient-to-r from-brand-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
              Accelerate Your Funding.
            </span>
          </h1>

          {/* Paragraph */}
          <p className="text-lg md:text-xl text-dark-300 max-w-2xl mb-10 leading-relaxed">
            The intelligent platform for academic institutions and enterprise teams to discover funding, co-write proposals with compliance guardrails, and track budgets automatically.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full sm:w-auto group">
              <span>Start Free Trial</span>
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Book live demo
            </Button>
          </div>
        </div>

        {/* Dashboard Mockup Showcase */}
        <div className="relative mx-auto max-w-5xl rounded-2xl border border-dark-800/80 bg-dark-950/40 p-3 md:p-4 backdrop-blur-md shadow-2xl shadow-brand-500/5 animate-slide-up-delayed">
          {/* Border highlight effect */}
          <div className="absolute inset-0 rounded-2xl border border-brand-500/20 pointer-events-none" />

          {/* Mock Dashboard Shell */}
          <div className="overflow-hidden rounded-xl border border-dark-800 bg-dark-950 shadow-inner">
            {/* Window header */}
            <div className="flex items-center justify-between border-b border-dark-800 bg-dark-900/50 px-4 py-3">
              <div className="flex items-center space-x-2">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <span className="h-3 w-3 rounded-full bg-green-500/80" />
              </div>
              <div className="rounded-lg bg-dark-950 px-8 py-1 text-xs text-dark-500 border border-dark-800/80">
                app.grantflow.io/dashboard
              </div>
              <div className="w-14" />
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 md:grid-cols-4 min-h-[480px]">
              {/* Sidebar */}
              <div className="hidden md:flex flex-col border-r border-dark-800 bg-dark-950 p-4 space-y-6">
                <div className="flex items-center space-x-2 text-white">
                  <div className="h-6 w-6 rounded bg-brand-600 flex items-center justify-center text-xs font-bold">G</div>
                  <span className="text-sm font-semibold">GrantFlow Suite</span>
                </div>
                
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-dark-500 uppercase tracking-wider px-2">Navigation</span>
                  <div className="rounded-lg bg-brand-600/10 border border-brand-500/20 text-brand-400 px-3 py-2 text-xs font-semibold flex items-center space-x-2 cursor-pointer">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>Dashboard</span>
                  </div>
                  <div className="rounded-lg text-dark-400 hover:text-white px-3 py-2 text-xs font-medium flex items-center space-x-2 cursor-pointer transition-colors duration-200">
                    <Search className="h-3.5 w-3.5" />
                    <span>Opportunity Hub</span>
                  </div>
                  <div className="rounded-lg text-dark-400 hover:text-white px-3 py-2 text-xs font-medium flex items-center space-x-2 cursor-pointer transition-colors duration-200">
                    <FileText className="h-3.5 w-3.5" />
                    <span>Proposals (AI)</span>
                  </div>
                </div>

                <div className="mt-auto p-3 rounded-xl bg-dark-900 border border-dark-800/80 space-y-2">
                  <p className="text-[11px] text-dark-300 font-medium">Credits Used</p>
                  <div className="w-full bg-dark-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-brand-500 h-full w-2/3" />
                  </div>
                  <p className="text-[10px] text-dark-400">12,400 of 18,000 words</p>
                </div>
              </div>

              {/* Main Content Pane */}
              <div className="md:col-span-3 bg-dark-900/30 p-6 flex flex-col space-y-6">
                {/* Dashboard Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">Institutional Workspace</h2>
                    <p className="text-xs text-dark-400">Manage all Active Grants, Submissions, and Compliance metrics.</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="secondary" size="sm" className="h-8 text-xs">
                      Export CSV
                    </Button>
                    <Button variant="primary" size="sm" className="h-8 text-xs flex items-center space-x-1">
                      <Plus className="h-3.5 w-3.5" />
                      <span>New Proposal</span>
                    </Button>
                  </div>
                </div>

                {/* Dashboard Metric Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-dark-800/80 bg-dark-950 p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs text-dark-400">Total Awarded</p>
                      <p className="text-lg font-extrabold text-white">$14.2M</p>
                    </div>
                    <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                      <Coins className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="rounded-xl border border-dark-800/80 bg-dark-950 p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs text-dark-400">Win Rate</p>
                      <p className="text-lg font-extrabold text-white">74.5%</p>
                    </div>
                    <div className="h-8 w-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="rounded-xl border border-dark-800/80 bg-dark-950 p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs text-dark-400">In Review</p>
                      <p className="text-lg font-extrabold text-white">8 Proposals</p>
                    </div>
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <Clock className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {/* Application Table */}
                <div className="rounded-xl border border-dark-800/80 bg-dark-950 overflow-hidden">
                  <div className="border-b border-dark-800 px-4 py-3 flex items-center justify-between bg-dark-900/20">
                    <span className="text-xs font-semibold text-white">Active Pipelines</span>
                    <span className="text-[10px] text-dark-400 hover:text-white cursor-pointer flex items-center">
                      View Hub <ChevronRight className="h-3 w-3 ml-0.5" />
                    </span>
                  </div>
                  <div className="divide-y divide-dark-800/60">
                    <div className="px-4 py-3 flex items-center justify-between text-xs hover:bg-dark-900/20">
                      <div className="flex items-center space-x-3">
                        <div className="h-7 w-7 rounded bg-brand-600/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                          <FileText className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">NSF CAREER: Bio-ML</p>
                          <p className="text-[10px] text-dark-500">Target Submission: July 15</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-brand-500/10 border border-brand-500/30 px-2 py-0.5 text-[10px] font-semibold text-brand-300">
                        AI Draft
                      </span>
                    </div>

                    <div className="px-4 py-3 flex items-center justify-between text-xs hover:bg-dark-900/20">
                      <div className="flex items-center space-x-3">
                        <div className="h-7 w-7 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                          <Clock className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">NIH R01 Genome Analysis</p>
                          <p className="text-[10px] text-dark-500">Target Submission: August 02</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                        Peer Review
                      </span>
                    </div>

                    <div className="px-4 py-3 flex items-center justify-between text-xs hover:bg-dark-900/20">
                      <div className="flex items-center space-x-3">
                        <div className="h-7 w-7 rounded bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">DoE Renewable Grid Pilot</p>
                          <p className="text-[10px] text-dark-500">Submitted: June 22</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-green-500/10 border border-green-500/30 px-2 py-0.5 text-[10px] font-semibold text-green-400">
                        Submitted
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Absolute floating indicators overlay */}
          <div className="absolute -right-4 top-1/4 hidden lg:flex items-center space-x-3 rounded-xl border border-dark-700 bg-dark-950 p-3 shadow-xl backdrop-blur-md animate-float">
            <div className="rounded-full bg-green-500/10 p-2 text-green-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] text-dark-400">AI compliance score</p>
              <p className="text-sm font-extrabold text-white">100% Passed</p>
            </div>
          </div>

          <div className="absolute -left-4 bottom-1/4 hidden lg:flex items-center space-x-3 rounded-xl border border-dark-700 bg-dark-950 p-3 shadow-xl backdrop-blur-md animate-float-delayed">
            <div className="rounded-full bg-brand-500/10 p-2 text-brand-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] text-dark-400">AI generation</p>
              <p className="text-sm font-extrabold text-white">Abstract Generated</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
