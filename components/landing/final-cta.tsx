import { lc } from '@/lib/landing-content';
import { ArrowRight } from 'lucide-react';

export default function FinalCta() {
  return (
    <section className="bg-slate-50 py-20 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">
          {lc.finalCta.headline}
        </h2>
        <p className="text-lg text-slate-600 mb-8 leading-relaxed">{lc.finalCta.body}</p>
        <a
          href="#scan"
          className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors"
        >
          {lc.finalCta.cta}
          <ArrowRight size={18} />
        </a>
      </div>
    </section>
  );
}
