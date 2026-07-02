import React from 'react';
import { Award, Github, Linkedin, Twitter } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const links = {
    product: [
      { label: 'AI Proposal Writer', href: '#' },
      { label: 'Opportunity Hub', href: '#' },
      { label: 'Budget Builder', href: '#' },
      { label: 'Security & Auth', href: '#' },
    ],
    resources: [
      { label: 'Federal Guidelines', href: '#' },
      { label: 'Developer Docs', href: '#' },
      { label: 'Success Case Studies', href: '#' },
      { label: 'Funder Calendars', href: '#' },
    ],
    company: [
      { label: 'About GrantFlow', href: '#' },
      { label: 'Research Integrity', href: '#' },
      { label: 'System Status', href: '#' },
      { label: 'Contact Support', href: '#' },
    ],
  };

  return (
    <footer className="relative border-t border-dark-900 bg-dark-950 pt-16 pb-8 overflow-hidden">
      {/* Decorative ambient lines */}
      <div className="absolute top-0 left-1/4 h-[1px] w-[50%] bg-gradient-to-r from-transparent via-dark-800 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 shadow-md">
                <Award className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-white">
                Grant<span className="text-brand-500">Flow</span>
              </span>
            </div>
            <p className="text-sm text-dark-400 max-w-xs leading-relaxed">
              The premier SaaS platform optimizing proposal writing, compliance validation, and post-award reporting workflows for institutions.
            </p>
            <div className="flex items-center space-x-4">
              <a href="#" className="h-9 w-9 rounded-lg bg-dark-900 border border-dark-800/80 hover:border-brand-500/30 flex items-center justify-center text-dark-400 hover:text-white transition-colors duration-200" aria-label="Twitter">
                <Twitter className="h-4.5 w-4.5" />
              </a>
              <a href="#" className="h-9 w-9 rounded-lg bg-dark-900 border border-dark-800/80 hover:border-brand-500/30 flex items-center justify-center text-dark-400 hover:text-white transition-colors duration-200" aria-label="LinkedIn">
                <Linkedin className="h-4.5 w-4.5" />
              </a>
              <a href="#" className="h-9 w-9 rounded-lg bg-dark-900 border border-dark-800/80 hover:border-brand-500/30 flex items-center justify-center text-dark-400 hover:text-white transition-colors duration-200" aria-label="GitHub">
                <Github className="h-4.5 w-4.5" />
              </a>
            </div>
          </div>

          {/* Links Grid */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2.5">
              {links.product.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-dark-400 hover:text-white transition-colors duration-200">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2.5">
              {links.resources.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-dark-400 hover:text-white transition-colors duration-200">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2.5">
              {links.company.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-dark-400 hover:text-white transition-colors duration-200">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-dark-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-dark-500">
          <p>© {currentYear} GrantFlow Inc. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <a href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors duration-200">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors duration-200">HIPAA Compliance</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
