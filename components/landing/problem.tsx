import { lc } from '@/lib/landing-content';

export default function Problem() {
  return (
    <section className="bg-slate-50 py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">
          {lc.problem.headline}
        </h2>
        <p className="text-lg text-slate-600 mb-4">{lc.problem.body}</p>
        <ul className="space-y-3 mb-8">
          {lc.problem.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-3 text-slate-700">
              <span className="mt-2 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
              <span className="text-lg">{bullet}</span>
            </li>
          ))}
        </ul>
        <p className="text-lg font-semibold text-slate-900 border-l-4 border-blue-500 pl-4">
          {lc.problem.closing}
        </p>
      </div>
    </section>
  );
}
