import { lc } from '@/lib/landing-content';
import { TrendingUp } from 'lucide-react';

export default function CaseStudy() {
  return (
    <section id="case-study" className="bg-slate-900 text-white py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-10">{lc.caseStudy.headline}</h2>

        <div className="bg-white/10 border border-white/20 rounded-2xl p-8">
          <div className="flex items-start justify-between gap-6 mb-6 flex-wrap">
            <div>
              <p className="text-sm text-slate-400 mb-1">Klīnika</p>
              <p className="text-2xl font-bold">{lc.caseStudy.name}</p>
            </div>
            <div className="bg-green-500/20 border border-green-400/30 rounded-2xl px-6 py-4 text-center">
              <div className="flex items-center gap-2 justify-center">
                <TrendingUp size={20} className="text-green-400" />
                <span className="text-3xl font-bold text-green-400">{lc.caseStudy.metric}</span>
              </div>
              <p className="text-xs text-green-300 mt-1">{lc.caseStudy.metricLabel}</p>
            </div>
          </div>

          <p className="text-slate-200 leading-relaxed mb-5">{lc.caseStudy.body}</p>
          <p className="text-xs text-slate-400">{lc.caseStudy.disclaimer}</p>
        </div>
      </div>
    </section>
  );
}
