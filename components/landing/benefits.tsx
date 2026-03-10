import { lc } from '@/lib/landing-content';
import { Users, MessageCircle, Eye } from 'lucide-react';

const icons = [Users, MessageCircle, Eye];

export default function Benefits() {
  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
          {lc.benefits.headline}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {lc.benefits.items.map((item, i) => {
            const Icon = icons[i];
            return (
              <div key={item.title} className="text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon size={24} className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2 text-lg">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
