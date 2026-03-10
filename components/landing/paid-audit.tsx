import { lc } from '@/lib/landing-content';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function PaidAudit() {
  return (
    <section id="paid-audit" className="bg-white py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-900 mb-3">
          {lc.paidAudit.headline}
        </h2>
        <p className="text-lg text-slate-600 mb-10">{lc.paidAudit.subheadline}</p>

        <div className="space-y-5 mb-10">
          {lc.paidAudit.items.map((item) => (
            <div key={item.title} className="flex gap-4">
              <CheckCircle2 size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">{item.title}</p>
                <p className="text-slate-600 text-sm mt-0.5 leading-relaxed">{item.body}</p>
              </div>
            </div>
          ))}
        </div>

        <a
          href="#scan"
          className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-blue-700 transition-colors"
        >
          {lc.paidAudit.cta}
          <ArrowRight size={18} />
        </a>
      </div>
    </section>
  );
}
