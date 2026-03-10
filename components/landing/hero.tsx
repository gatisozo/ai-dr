'use client';

import { lc } from '@/lib/landing-content';
import { ArrowRight, TrendingUp } from 'lucide-react';

export default function Hero() {
  const scrollToScan = () => {
    document.getElementById('scan')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToExample = () => {
    document.getElementById('case-study')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="bg-white py-20 px-6 border-b border-slate-100">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1.5 rounded-full mb-6">
              <TrendingUp size={14} />
              AI meklēšana klīnikām
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-6">
              {lc.hero.headline}
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              {lc.hero.subheadline}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button
                onClick={scrollToScan}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-blue-700 transition-colors"
              >
                {lc.hero.primaryCta}
                <ArrowRight size={18} />
              </button>
              <button
                onClick={scrollToExample}
                className="inline-flex items-center justify-center gap-2 border border-slate-300 text-slate-700 font-semibold px-6 py-3.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                {lc.hero.secondaryCta}
              </button>
            </div>

            <p className="text-sm text-slate-500 leading-relaxed">
              {lc.hero.trustText}
            </p>
          </div>

          {/* Right: example score card */}
          <div className="hidden lg:flex justify-end">
            <ExampleScoreCard />
          </div>

        </div>
      </div>
    </section>
  );
}

function ExampleScoreCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-6 w-72">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
        Piemērs — AI Visibility Report
      </p>

      <div className="flex items-end gap-2 mb-5">
        <span className="text-5xl font-bold text-amber-600">42</span>
        <span className="text-slate-400 text-xl mb-1">/100</span>
        <span className="ml-auto bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          Uzlabojams
        </span>
      </div>

      <div className="space-y-2.5 mb-5">
        <MetricRow label="ChatGPT citējamība" value="Zema" pill="bg-red-50 text-red-600" />
        <MetricRow label="Google AI citējamība" value="Vidēja" pill="bg-amber-50 text-amber-600" />
      </div>

      <div className="border-t border-slate-100 pt-4">
        <p className="text-xs font-semibold text-slate-500 mb-2">Galvenās problēmas</p>
        <ul className="space-y-1.5">
          {['Nav FAQ', 'Vāja Schema.org', 'Neskaidra pakalpojumu struktūra'].map((issue) => (
            <li key={issue} className="flex items-center gap-2 text-xs text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
              {issue}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MetricRow({
  label,
  value,
  pill,
}: {
  label: string;
  value: string;
  pill: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pill}`}>{value}</span>
    </div>
  );
}
