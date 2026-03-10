'use client';

import { useState } from 'react';
import { lc } from '@/lib/landing-content';
import { ArrowRight, CheckCircle2, AlertCircle, XCircle, Loader2 } from 'lucide-react';

type CheckStatus = 'ok' | 'warn' | 'bad';

type Check = {
  key: string;
  label: string;
  status: CheckStatus;
  detail: string;
};

type ScanResult = {
  scores: {
    seoHygiene: number;
    aiRecommendability: number;
    capReasons?: string[];
  };
  checks: Check[];
  interpretation?: {
    summary?: string;
    top_risks?: string[];
    quick_wins?: string[];
  } | null;
  finalUrl: string;
};

export default function ScanForm() {
  const [clinic, setClinic] = useState('');
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ScanResult | null>(null);

  const normalizeUrl = (raw: string): string => {
    const u = raw.trim();
    return /^https?:\/\//i.test(u) ? u : `https://${u}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!website.trim() || !email.trim()) {
      setError('Lūdzu aizpildiet mājaslapas adresi un e-pastu.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    const normalizedUrl = normalizeUrl(website);

    try {
      const [miniRes] = await Promise.allSettled([
        fetch('/api/mini-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: normalizedUrl }),
        }),
        // fire-and-forget: lead capture
        fetch('/api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clinic: clinic.trim() || undefined,
            website: normalizedUrl,
            email: email.trim(),
            specialty: '',
            source: 'free_scan',
          }),
        }),
      ]);

      if (miniRes.status === 'fulfilled' && miniRes.value.ok) {
        const data = await miniRes.value.json();
        if (data.success) {
          setResult({
            scores: {
              seoHygiene: data.scores?.seoHygiene ?? data.score,
              aiRecommendability: data.scores?.aiRecommendability ?? data.score,
              capReasons: data.scores?.capReasons ?? [],
            },
            checks: data.checks ?? [],
            interpretation: data.interpretation ?? null,
            finalUrl: data.finalUrl ?? normalizedUrl,
          });
          return;
        }
        setError(data.details || data.error || 'Neizdevās pārbaudīt mājaslapu.');
      } else {
        setError('Neizdevās ielādēt mājaslapu. Pārbaudiet adresi un mēģiniet vēlreiz.');
      }
    } catch {
      setError('Savienojuma kļūda. Lūdzu mēģiniet vēlreiz.');
    } finally {
      setLoading(false);
    }
  };

  const scrollToPaid = () => {
    document.getElementById('paid-audit')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="scan" className="bg-white py-20 px-6 border-t border-slate-100">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-900 mb-3">
          {lc.scanForm.headline}
        </h2>
        <p className="text-lg text-slate-600 mb-8">{lc.scanForm.body}</p>

        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {lc.scanForm.fields.clinic}
              </label>
              <input
                type="text"
                value={clinic}
                onChange={(e) => setClinic(e.target.value)}
                placeholder="piem. Vivendi centrs"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {lc.scanForm.fields.website}{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="piem. klinika.lv"
                required
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {lc.scanForm.fields.email}{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="epasts@klinika.lv"
                required
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {lc.scanForm.loadingText}
                </>
              ) : (
                <>
                  {lc.scanForm.submitCta}
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <p className="text-xs text-slate-500 text-center">{lc.scanForm.helperText}</p>
          </form>
        ) : (
          <ScanResults result={result} clinic={clinic} onPaidAudit={scrollToPaid} />
        )}
      </div>
    </section>
  );
}

function ScanResults({
  result,
  clinic,
  onPaidAudit,
}: {
  result: ScanResult;
  clinic: string;
  onPaidAudit: () => void;
}) {
  const ai = result.scores.aiRecommendability;
  const seo = result.scores.seoHygiene;

  const scoreColor = (n: number) =>
    n >= 70 ? 'text-green-600' : n >= 40 ? 'text-amber-600' : 'text-red-600';

  const scoreBadge = (n: number) =>
    n >= 70
      ? 'bg-green-50 text-green-700'
      : n >= 40
      ? 'bg-amber-50 text-amber-700'
      : 'bg-red-50 text-red-700';

  const scoreLabel = (n: number) =>
    n >= 70 ? 'Laba redzamība' : n >= 40 ? 'Uzlabojams' : 'Vāja redzamība';

  const statusIcon = (s: CheckStatus) =>
    s === 'ok' ? (
      <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
    ) : s === 'warn' ? (
      <AlertCircle size={16} className="text-amber-500 flex-shrink-0" />
    ) : (
      <XCircle size={16} className="text-red-500 flex-shrink-0" />
    );

  return (
    <div className="space-y-5">
      {/* Score header */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            {clinic ? `${clinic} — ` : ''}AI Visibility Score
          </p>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${scoreBadge(ai)}`}>
            {scoreLabel(ai)}
          </span>
        </div>
        <div className="flex items-end gap-6">
          <div>
            <span className={`text-5xl font-bold ${scoreColor(ai)}`}>{ai}</span>
            <span className="text-slate-400 text-xl ml-1">/100</span>
            <p className="text-xs text-slate-500 mt-1">AI Redzamība</p>
          </div>
          <div className="border-l border-slate-200 pl-6">
            <span className={`text-3xl font-bold ${scoreColor(seo)}`}>{seo}</span>
            <span className="text-slate-400 text-base ml-1">/100</span>
            <p className="text-xs text-slate-500 mt-1">SEO Higiēna</p>
          </div>
        </div>
      </div>

      {/* Score cap reasons */}
      {(result.scores.capReasons?.length ?? 0) > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-amber-800 mb-2">Score ierobežojums</p>
          <ul className="space-y-1">
            {result.scores.capReasons!.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* LLM summary */}
      {result.interpretation?.summary && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-sm font-semibold text-blue-800 mb-1">
            AI iespaids par Jūsu lapu
          </p>
          <p className="text-sm text-blue-900">{result.interpretation.summary}</p>
        </div>
      )}

      {/* Checks */}
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-3">Detalizēti rezultāti</p>
        <div className="space-y-2">
          {result.checks.map((check) => (
            <div
              key={check.key}
              className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0"
            >
              {statusIcon(check.status)}
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900">{check.label}</p>
                <p className="text-xs text-slate-500">{check.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick wins */}
      {(result.interpretation?.quick_wins?.length ?? 0) > 0 && (
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <p className="text-sm font-semibold text-green-800 mb-2">Ātrākie uzlabojumi</p>
          <ul className="space-y-1">
            {result.interpretation!.quick_wins!.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-green-700">
                <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Paid audit CTA */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 text-center">
        <p className="font-bold text-lg mb-2">
          Saņemiet pilnu AI auditu ar konkrētu rīcības plānu
        </p>
        <p className="text-slate-300 text-sm mb-5">
          Detalizēts audits parādīs, ko tieši labot un kādā secībā — €500.
        </p>
        <button
          onClick={onPaidAudit}
          className="inline-flex items-center gap-2 bg-white text-slate-900 font-semibold px-6 py-3 rounded-xl hover:bg-slate-100 transition-colors"
        >
          Uzzināt vairāk par pilno auditu
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
