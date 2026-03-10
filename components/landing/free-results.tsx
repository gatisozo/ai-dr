import { lc } from '@/lib/landing-content';
import { Bot, Search, BarChart2, AlertTriangle } from 'lucide-react';

const icons = [Bot, Search, BarChart2, AlertTriangle];

export default function FreeResults() {
  return (
    <section className="bg-slate-50 py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center">
          {lc.freeResults.headline}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {lc.freeResults.items.map((item, i) => {
            const Icon = icons[i];
            return (
              <div
                key={item.title}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={20} className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.body}</p>
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-slate-500 mt-8 max-w-xl mx-auto">
          {lc.freeResults.disclaimer}
        </p>
      </div>
    </section>
  );
}
