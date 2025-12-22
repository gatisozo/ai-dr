'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Zap, Search, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';
import AIVisibilityCards from './components/AIVisibilityCards';
import AICostComparison from './components/AICostComparison';

// ==========================================
// FOKUSS: tikai fleboloģija (ārsti)
// ==========================================
const SPECIALTY_VALUE = 'fleboloģija';
const SPECIALTY_LABEL = 'Fleboloģija';

const preGeneratedQueries: string[] = [
  'Kur Rīgā pieņem augsti kvalificēts flebologs?',
  'Kur ārstēt vēnu varikozi Latvijā?',
  'Labākais flebologs Rīgā',
  'Kur ārstēt kāju vēnas Rīgā?',
  'Kādas ir vēnu operācijas cenas?',
];

function getRandomQuery(): string {
  return preGeneratedQueries[Math.floor(Math.random() * preGeneratedQueries.length)];
}

// ==========================================
// Liquid-glass UI helpers
// ==========================================
function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function GlassCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      {...props}
      className={cx(
        'rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl',
        'shadow-[0_10px_50px_rgba(0,0,0,0.12)]',
        'ring-1 ring-white/10',
        'transition-all hover:translate-y-[-1px] hover:shadow-[0_16px_70px_rgba(0,0,0,0.16)]',
        className
      )}
    >
      {children}
    </div>
  );
}

function GlassButton({
  children,
  className,
  disabled,
  type = 'button',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        'group relative overflow-hidden rounded-2xl px-6 py-4 font-semibold',
        'text-white',
        'bg-gradient-to-b from-blue-500/95 via-blue-600/95 to-indigo-700/95',
        'before:absolute before:inset-0 before:bg-[radial-gradient(120%_80%_at_10%_10%,rgba(255,255,255,0.35),transparent_55%)] before:opacity-90',
        'after:absolute after:inset-0 after:bg-[linear-gradient(to_bottom,rgba(255,255,255,0.22),transparent_45%)] after:opacity-80',
        'shadow-[0_10px_30px_rgba(37,99,235,0.25)]',
        'ring-1 ring-white/20',
        'transition-all hover:scale-[1.01] active:scale-[0.99]',
        disabled && 'opacity-50 cursor-not-allowed hover:scale-100',
        className
      )}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </button>
  );
}

// ==========================================
// URL helpers (profilu lapa, ne tikai domēns)
// ==========================================
function normalizeUrl(input: string): string {
  let v = (input || '').trim();
  if (!v) throw new Error('Ievadi profila lapas URL (piem. klinika.lv/arsti/janis-berzins)');

  // pieļaujam bez https
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`;

  const u = new URL(v);
  // sakārtojam host (noņemam www)
  u.hostname = u.hostname.replace(/^www\./i, '');
  return u.toString();
}

function cleanUrlInput(raw: string): string {
  let v = (raw || '').trim();
  v = v.replace(/^\s+|\s+$/g, '');
  v = v.replace(/^https?:\/\//i, '');
  v = v.replace(/^www\./i, '');
  v = v.replace(/\s/g, '');
  return v;
}

// ==========================================
// LocalStorage hook
// ==========================================
function useLocalStorageState<T>(key: string, initial: T) {
  const [value, setValue] = React.useState<T>(initial);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw));
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  }, [key, value]);

  return [value, setValue] as const;
}

// ==========================================
// Types
// ==========================================
type MiniResult = {
  score: number;
  scores?: {
    seoHygiene?: number;
    aiRecommendability?: number;
    pillars?: {
      access?: number;
      entitySchema?: number;
      trustSignals?: number;
      answerability?: number;
    };
    cap?: number | null;
    capReasons?: string[];
  };
  checks: Array<{ key: string; label: string; status: 'ok' | 'warn' | 'bad'; detail: string }>;
  interpretation?: {
    summary?: string;
    top_risks?: string[];
    quick_wins?: string[];
    confidence?: string;
  } | null;
  finalUrl?: string;
  clinicName?: string;
};

export default function Home() {
  // ==========================================
  // State
  // ==========================================
  const [budget, setBudget] = useState(1500);

  // Fleboloģija – fiksēts
  const specialty = SPECIALTY_VALUE;

  // AI tests
  const [queryInput, setQueryInput] = useState('');
  const [doctorName, setDoctorName] = useLocalStorageState<string>('lucera_doctorName', '');
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiResults, setAiResults] = useState<any>(null);
  const [apiError, setApiError] = useState('');

  // “Kāpēc rezultāti var atšķirties…”
  const [showWhyDifferent, setShowWhyDifferent] = useState(false);
  const [showGptFull, setShowGptFull] = useState(false);
  const [showClaudeFull, setShowClaudeFull] = useState(false);

  // Demo modal
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  // FAQ
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Sticky WhatsApp
  const [showWhatsApp, setShowWhatsApp] = useState(false);

  // Lead magnet (Personal AI Trust Check ārstam)
  const [leadProfileUrl, setLeadProfileUrl] = useLocalStorageState<string>('lucera_leadProfileUrl', '');
  const [leadDoctor, setLeadDoctor] = useLocalStorageState<string>('lucera_leadDoctor', '');
  const [leadEmail, setLeadEmail] = useLocalStorageState<string>('lucera_leadEmail', '');
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);

  // Mini-check
  const [miniUrl, setMiniUrl] = useState('');
  const [miniLoading, setMiniLoading] = useState(false);
  const [miniError, setMiniError] = useState('');
  const [miniResult, setMiniResult] = useState<MiniResult | null>(null);

  // ==========================================
  // SESSION TRACKING
  // ==========================================
  const sessionRef = useRef<{
    id: string;
    startedAt: number;
    path: string;
    ref: string;
    consent: { analytics: boolean; cookies: boolean };
    identity: { email?: string; doctor?: string; profileUrl?: string; specialty?: string };
    events: Array<Record<string, any>>;
    sent: boolean;
  } | null>(null);

  if (!sessionRef.current && typeof window !== 'undefined') {
    const sid =
      (window.crypto?.randomUUID && window.crypto.randomUUID()) ||
      `sid_${Math.random().toString(16).slice(2)}_${Date.now()}`;

    sessionRef.current = {
      id: sid,
      startedAt: Date.now(),
      path: window.location.pathname,
      ref: document.referrer || '',
      consent: { analytics: true, cookies: true },
      identity: { specialty: SPECIALTY_LABEL },
      events: [],
      sent: false,
    };
  }

  const track = (type: string, data: Record<string, any> = {}) => {
    const s = sessionRef.current;
    if (!s) return;
    s.events.push({ ts: Date.now(), type, ...data });
  };

  const updateIdentity = (data: Partial<{ email: string; doctor: string; profileUrl: string; specialty: string }>) => {
    const s = sessionRef.current;
    if (!s) return;
    s.identity = { ...s.identity, ...data };
  };

  const sendSummaryOnce = async (reason: string) => {
    const s = sessionRef.current;
    if (!s || s.sent) return;
    s.sent = true;

    const humanSummary =
      `Klients pieprasīja Personal AI Trust Check (ārstam).\n` +
      `Specialitāte: ${s.identity.specialty ?? SPECIALTY_LABEL}\n` +
      `Profila lapa: ${s.identity.profileUrl ?? '—'}\n` +
      `Ārsts: ${s.identity.doctor ?? '—'}\n` +
      `E-pasts: ${s.identity.email ?? '—'}\n` +
      `\nKo klients izdarīja lapā:\n` +
      s.events
        .filter((e) => ['mini_check_submit', 'ai_check_submit', 'ai_check_result', 'lead_submit'].includes(e.type))
        .map((e) => {
          if (e.type === 'mini_check_submit') return `• Veica mini-check (${e.url ?? ''})`;
          if (e.type === 'ai_check_submit') return `• Veica AI testu (${e.query ?? ''})`;
          if (e.type === 'ai_check_result') {
            const c1 = (e.chatgpt_clinics || []).slice(0, 3).join(', ');
            const c2 = (e.claude_clinics || []).slice(0, 3).join(', ');
            return `• AI tests pabeigts. ChatGPT minēja: ${c1 || '—'}. Claude minēja: ${c2 || '—'}.`;
          }
          if (e.type === 'lead_submit') return `• Pieprasīja Trust Check (aizpildīja formu)`;
          return `• ${e.type}`;
        })
        .join('\n');

    const payload = {
      sessionId: s.id,
      identity: s.identity,
      humanSummary,
      meta: {
        path: s.path,
        ref: s.ref,
        consent: s.consent,
        reason,
        startedAt: s.startedAt,
        durationMs: Date.now() - s.startedAt,
      },
      events: s.events,
    };

    try {
      const json = JSON.stringify(payload);

      if (navigator.sendBeacon) {
        const blob = new Blob([json], { type: 'application/json' });
        const ok = navigator.sendBeacon('/api/session-summary', blob);
        if (ok) return;
      }

      await fetch('/api/session-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: json,
        keepalive: true,
      });
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const onScroll = () => setShowWhatsApp(window.scrollY > 450);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    track('page_view', { path: window.location.pathname });

    const onPageHide = () => sendSummaryOnce('pagehide');
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') sendSummaryOnce('visibility_hidden');
    };

    window.addEventListener('pagehide', onPageHide);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('pagehide', onPageHide);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================================
  // Mini-check handlers
  // ==========================================
  const aiScore = miniResult?.scores?.aiRecommendability ?? null;
  const seoScore = miniResult?.scores?.seoHygiene ?? miniResult?.score ?? null;
  const pillars = miniResult?.scores?.pillars ?? null;
  const capReasons = miniResult?.scores?.capReasons ?? [];

  const normalizeUrlLoosely = (raw: string) => {
    let u = (raw || '').trim();
    if (!/^https?:\/\//i.test(u)) u = `https://${u}`;

    try {
      const parsed = new URL(u);
      parsed.hostname = parsed.hostname.replace(/^www\./i, '');
      return parsed.toString();
    } catch {
      return u;
    }
  };

  const handleMiniCheck = async () => {
    track('mini_check_submit', { url: normalizeUrlLoosely(miniUrl) });

    if (!miniUrl.trim()) {
      setMiniError('Lūdzu ievadiet mājaslapas adresi');
      return;
    }

    setMiniLoading(true);
    setMiniError('');
    setMiniResult(null);

    try {
      const res = await fetch('/api/mini-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizeUrlLoosely(miniUrl) }),
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.details || data?.error || 'Mini-check kļūda');
      }

      track('mini_check_result', {
        finalUrl: data.finalUrl,
        score: data.score,
        aiScore: data?.scores?.aiRecommendability ?? null,
        seoScore: data?.scores?.seoHygiene ?? null,
        pillars: data?.scores?.pillars ?? null,
        capReasons: data?.scores?.capReasons?.slice?.(0, 5) ?? [],
      });

      setMiniResult({
        score: data.score,
        scores: data.scores,
        checks: data.checks,
        interpretation: data.interpretation ?? null,
        finalUrl: data.finalUrl,
        clinicName: data.clinicName,
      });
    } catch (e) {
      track('mini_check_error', { message: e instanceof Error ? e.message : String(e) });
      setMiniError(e instanceof Error ? e.message : 'Neizdevās veikt mini-check');
    } finally {
      setMiniLoading(false);
    }
  };

  // ==========================================
  // ROI Calculator (UI ilustrācijai)
  // ==========================================
  const calculateROI = (monthlyBudget: number) => {
    const costPerPatient = 12;
    const adPatients = Math.floor(monthlyBudget / costPerPatient);

    const aiSearches = 1000;
    const aiTopShare = 0.35;
    const aiConversion = 0.25;
    const aiContacts = Math.floor(aiSearches * aiTopShare * aiConversion);

    const totalContacts = adPatients + aiContacts;
    const growthPercent = adPatients > 0 ? Math.floor((aiContacts / adPatients) * 100) : 0;

    return { costPerPatient, adPatients, aiSearches, aiTopShare, aiConversion, aiContacts, totalContacts, growthPercent };
  };

  const roi = useMemo(() => calculateROI(budget), [budget]);

  // ==========================================
  // Handlers
  // ==========================================
  const handleRandomQuery = () => {
    const randomQuery = getRandomQuery();
    setQueryInput(randomQuery);
    requestAnimationFrame(() => {
      document.getElementById('ai-question')?.focus();
    });
  };

  const handleRealAITest = async () => {
    if (!queryInput.trim()) {
      setApiError('Lūdzu ievadiet jautājumu');
      return;
    }

    track('ai_check_submit', { query: queryInput.trim(), doctorName: doctorName || null, specialty });

    setIsLoading(true);
    setShowResults(false);
    setApiError('');
    setAiResults(null);
    setShowGptFull(false);
    setShowClaudeFull(false);

    try {
      // API kontrakts paliek tas pats: clinicName izmantojam kā "ārsta vārds"
      const response = await fetch('/api/ai-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryInput,
          clinicName: doctorName || undefined,
        }),
      });

      if (!response.ok) throw new Error(`API kļūda: ${response.statusText}`);

      const data = await response.json();

      if (data.success) {
        setAiResults(data.results);
        setShowResults(true);

        track('ai_check_result', {
          doctorName: doctorName || null,
          userClinicFound: data?.results?.userClinicFound ?? null,
          chatgpt_ok: Boolean(data?.results?.chatgpt?.success),
          claude_ok: Boolean(data?.results?.claude?.success),
          chatgpt_clinics: data?.results?.chatgpt?.clinics?.slice?.(0, 5) ?? [],
          claude_clinics: data?.results?.claude?.clinics?.slice?.(0, 5) ?? [],
        });
      } else {
        setApiError(data.error || 'Nezināma kļūda');
        track('ai_check_error', { message: data.error || 'unknown_error' });
      }
    } catch (error) {
      track('ai_check_error', { message: error instanceof Error ? error.message : String(error) });
      setApiError(error instanceof Error ? error.message : 'Neizdevās savienoties ar API.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLeadSuccess(false);

    let profileUrl: string;
    try {
      profileUrl = normalizeUrl(leadProfileUrl);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Nederīgs URL');
      return;
    }

    if (!leadEmail.trim()) return;

    updateIdentity({
      email: leadEmail.trim() || undefined,
      doctor: leadDoctor.trim() || undefined,
      profileUrl: profileUrl || undefined,
      specialty: SPECIALTY_LABEL,
    });

    track('lead_submit', {
      email: leadEmail.trim() || null,
      doctor: leadDoctor.trim() || null,
      profileUrl,
      specialty,
    });

    setLeadSubmitting(true);

    try {
      // backendam nemainām kontraktu: clinic = ārsts, website = profila URL
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinic: leadDoctor.trim() || undefined,
          website: profileUrl,
          email: leadEmail.trim(),
          specialty: SPECIALTY_VALUE,
          source: 'doctor-trust-check',
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'Neizdevās nosūtīt. Pamēģini vēlreiz.');
      }

      track('lead_success', { email: leadEmail.trim() || null });
      setLeadSuccess(true);
      sendSummaryOnce('lead_success');

      // Prefill uz AI testu
      if (!doctorName.trim() && leadDoctor.trim()) setDoctorName(leadDoctor.trim());
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Neizdevās nosūtīt. Pamēģini vēlreiz.');
    } finally {
      setLeadSubmitting(false);
    }
  };

  // ==========================================
  // Styles + pillar helpers
  // ==========================================
  const inputBase =
    'w-full px-4 py-3 rounded-2xl bg-white/25 backdrop-blur-md ' +
    'border border-slate-300/70 ring-1 ring-white/10 ' +
    'text-slate-900 placeholder:text-slate-500 ' +
    'focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-400/70';

  const pillarTone = (v: number) => (v >= 80 ? 'good' : v >= 50 ? 'warn' : 'bad');

  const toneStyles = (tone: 'good' | 'warn' | 'bad') => {
    if (tone === 'good') {
      return {
        dot: 'bg-emerald-500',
        text: 'text-emerald-800',
        track: 'bg-emerald-100/70',
        fill: 'bg-emerald-600',
        border: 'border-emerald-200/60',
        bg: 'bg-emerald-50/30',
      };
    }
    if (tone === 'warn') {
      return {
        dot: 'bg-amber-500',
        text: 'text-amber-800',
        track: 'bg-amber-100/70',
        fill: 'bg-amber-500',
        border: 'border-amber-200/60',
        bg: 'bg-amber-50/30',
      };
    }
    return {
      dot: 'bg-red-500',
      text: 'text-red-800',
      track: 'bg-red-100/70',
      fill: 'bg-red-600',
      border: 'border-red-200/60',
      bg: 'bg-red-50/30',
    };
  };

  const pillarBusinessLine = (p: any) => {
    if (!p) return null;

    const items = [
      { k: 'trustSignals', label: 'Uzticamības signāli', msg: 'AI nevar droši identificēt ārstu → biežāk nemin.' },
      { k: 'entitySchema', label: 'Identitātes struktūra', msg: 'AI nesaprot, ko tieši darāt → sajauc ar citiem.' },
      { k: 'answerability', label: 'Atbildamība', msg: 'AI nespēj atbildēt ar jums → ieliek citus, kas skaidro labāk.' },
      { k: 'access', label: 'Pieejamība', msg: 'AI nevar pilnvērtīgi nolasīt profilu → jūs pazūdat kandidātos.' },
    ];

    const sorted = items
      .map((it) => ({ ...it, v: Number(p?.[it.k] ?? 0) }))
      .sort((a, b) => a.v - b.v);

    const worst = sorted[0];
    return { worstLabel: worst.label, worstValue: worst.v, message: worst.msg };
  };

  // ==========================================
  // DEMO screens (ārsts)
  // ==========================================
  const demoScreens = [
    {
      title: '1/3 — Ko pacients jautā AI (fleboloģija)',
      body: (
        <div className="space-y-3">
          <div className="text-sm text-slate-700">Pacients:</div>
          <div className="rounded-2xl border border-white/20 bg-white/14 p-4 text-slate-900">
            “Kur Rīgā pieņem augsti kvalificēts flebologs?”
          </div>
          <div className="text-sm text-slate-700 mt-3">AI atbilde (piemērs):</div>
          <div className="rounded-2xl border border-white/20 bg-white/14 p-4 text-sm text-slate-900">
            Varat apsvērt A klīniku/ārstu (pieredze + skaidri profili), B centru (diagnostika + operācijas), C…
          </div>
          <div className="text-xs text-slate-600">*Demo piemērs, lai parādītu mehānismu.</div>
        </div>
      ),
    },
    {
      title: '2/3 — Kur rodas risks ārstam',
      body: (
        <div className="space-y-3">
          <div className="rounded-2xl border border-red-200/60 bg-red-50/40 p-4">
            <div className="font-semibold text-red-900">Jūsu vārds nav minēts.</div>
            <div className="text-sm text-red-900/90 mt-1">
              Tas bieži nav par kvalitāti — AI vienkārši neredz pietiekami citējamus publiskus signālus par praksi.
            </div>
          </div>
          <div className="text-sm text-slate-700">Kas notiek pacienta galvā:</div>
          <ul className="text-sm text-slate-900 space-y-2 list-disc pl-5">
            <li>“AI ieteica citus — tātad tie ir drošāki.”</li>
            <li>“Man nav laika salīdzināt 10 profilus.”</li>
            <li>“Es pierakstos pie tiem, ko ieteica.”</li>
          </ul>
        </div>
      ),
    },
    {
      title: '3/3 — Ko mēs sakārtojam (4 pīlāri ārstam)',
      body: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Pieejamība', v: 45, hint: 'profils nolasāms / indeksējams' },
              { label: 'Identitāte', v: 35, hint: 'ārsts ↔ pakalpojumi ↔ metodes' },
              { label: 'Uzticamība', v: 55, hint: 'pieredze, sertifikāti, avoti' },
              { label: 'Atbildamība', v: 40, hint: 'FAQ, skaidri “kam palīdz / kā”' },
            ].map((p, idx) => {
              const tone = pillarTone(p.v);
              const s = toneStyles(tone);
              return (
                <div key={idx} className={cx('rounded-2xl border p-3', s.border, s.bg)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cx('h-2.5 w-2.5 rounded-full', s.dot)} />
                      <div className="text-sm font-semibold text-slate-900">{p.label}</div>
                    </div>
                    <div className={cx('text-sm font-bold', s.text)}>{p.v}/100</div>
                  </div>
                  <div className="text-xs text-slate-600 mt-1">{p.hint}</div>
                  <div className={cx('mt-2 h-2 w-full rounded-full overflow-hidden', s.track)}>
                    <div className={cx('h-full', s.fill)} style={{ width: `${p.v}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-blue-200/60 bg-blue-50/40 p-4">
            <div className="text-sm font-semibold text-slate-900">Ko tas nozīmē praksē:</div>
            <div className="text-sm text-slate-800 mt-1">
              Ja AI nevar droši sasaistīt jūsu vārdu ar vēnu ārstēšanu un metodēm, tas izvēlas drošāku variantu — ieteikt citus.
            </div>
            <div className="text-sm font-semibold text-slate-900 mt-3">Nākamais solis:</div>
            <div className="text-sm text-slate-800">Personal AI Trust Check (5 jautājumi + “fallback mode” iemesli) – 1 darba dienā.</div>
          </div>
        </div>
      ),
    },
  ];

  const nextDemo = () => setDemoStep((s) => Math.min(2, s + 1));
  const prevDemo = () => setDemoStep((s) => Math.max(0, s - 1));
  const closeDemo = () => {
    setDemoOpen(false);
    setDemoStep(0);
  };

  // ==========================================
  // FAQ data (ārsts)
  // ==========================================
  const faqs: Array<{ q: string; a: React.ReactNode }> = [
    {
      q: 'Vai šis ir mārketinga jautājums?',
      a: (
        <div className="space-y-3 text-slate-800 leading-relaxed">
          <p>
            <strong>Nē.</strong> Tas ir <span className="font-semibold">uzticības un profesionālās reputācijas</span> jautājums.
          </p>
          <div className="rounded-2xl border border-blue-200/60 bg-blue-50/40 p-4">
            <p className="font-semibold text-slate-900">Vienā teikumā:</p>
            <p className="mt-1">
              AI min ārstu tikai tad, ja publiski ir <span className="font-semibold">skaidri, citējami un saskaņoti signāli</span>, ka tieši jūs
              šo problēmu risināt.
            </p>
          </div>
        </div>
      ),
    },
    {
      q: 'Kāpēc AI dažreiz “neuzticas” un ieslēdzas fallback mode?',
      a: (
        <div className="space-y-4 text-slate-800 leading-relaxed">
          <div className="rounded-2xl border border-slate-200/60 bg-white/30 p-4">
            <p>
              AI <strong>neizdomā uzticību</strong>. Tas tikai <strong>atpazīst uzticību</strong>, ja tā jau ir publiski pierādāma un konsekventa.
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-900 mb-2">Fallback mode parasti ieslēdzas, ja:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>profilā nav skaidri aprakstīts “ko tieši daru” (metodes, indikācijas),</li>
              <li>nav citējamu pierādījumu (sertifikāti, pieredze, publikācijas/konferences),</li>
              <li>ārsts nav konsekventi sasaistīts ar fleboloģiju dažādos avotos,</li>
              <li>lapa ir grūti nolasāma (JS-only, noindex, nav satura).</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-amber-200/60 bg-amber-50/40 p-4">
            <p className="font-semibold text-amber-900">Ko tas nozīmē?</p>
            <p className="mt-1 text-amber-900/90">AI izvēlas drošāku ceļu — ieteikt citus, par kuriem ir vairāk skaidru signālu.</p>
          </div>
        </div>
      ),
    },
    {
      q: 'Vai varat garantēt, ka AI mani minēs?',
      a: (
        <div className="space-y-3 text-slate-800 leading-relaxed">
          <p>
            Konkrētu vietu vai “TOP-3” <strong>neviens godīgi negarantē</strong>, jo atbilde mainās pēc jautājuma un modeļa.
          </p>
          <div className="rounded-2xl border border-slate-200/60 bg-white/30 p-4">
            <p className="font-semibold text-slate-900">Ko mēs garantējam:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>pārbaudi 5 tipiskos pacientu jautājumos,</li>
              <li>skaidrus iemeslus, kāpēc jūs nemin,</li>
              <li>rīcības plānu (ko publicēt un kur),</li>
              <li>pārtestu pēc izmaiņām.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      q: 'Cik ātri var redzēt uzlabojumu efektu?',
      a: (
        <div className="space-y-3 text-slate-800 leading-relaxed">
          <p>
            Pirmos uzlabojumus parasti var redzēt <strong>2–4 nedēļu laikā</strong>.
          </p>
          <p>
            Stabilāka ietekme veidojas <strong>2–3 mēnešu laikā</strong>, atkarībā no konkurences un publiskās informācijas kvalitātes.
          </p>
        </div>
      ),
    },
  ];

  // ==========================================
  // UI
  // ==========================================
  return (
    <main id="top" className="min-h-screen text-slate-900">
      {/* Liquid background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50" />
        <div className="absolute -top-40 left-[-10%] h-[520px] w-[520px] rounded-full bg-blue-500/20 blur-[90px]" />
        <div className="absolute top-10 right-[-10%] h-[560px] w-[560px] rounded-full bg-cyan-400/20 blur-[90px]" />
        <div className="absolute bottom-[-20%] left-[10%] h-[520px] w-[520px] rounded-full bg-indigo-500/15 blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(59,130,246,0.10),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.75),rgba(255,255,255,0.45),rgba(255,255,255,0.85))]" />
      </div>

      {/* Sticky WhatsApp */}
      {showWhatsApp && (
        <a
          href="https://wa.me/37129229686"
          target="_blank"
          rel="noopener noreferrer"
          className={cx(
            'fixed bottom-4 right-4 z-50',
            'inline-flex items-center gap-2 rounded-full px-4 py-3',
            'border border-white/20 bg-white/20 backdrop-blur-xl',
            'text-slate-900 font-semibold shadow-lg ring-1 ring-white/10',
            'hover:bg-white/30 transition'
          )}
          aria-label="Rakstīt WhatsApp"
          title="Jautājums? Uzraksti WhatsApp"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          Jautājums? WhatsApp
        </a>
      )}

      {/* Sticky mini-nav (fast lane) */}
      <div className="sticky top-0 z-40">
        <div className="pointer-events-none absolute inset-0 border-b border-white/20 bg-white/55 backdrop-blur-xl" />

        <nav className="relative mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
          <a
            href="#top"
            className="pointer-events-auto flex items-center gap-2 rounded-2xl px-2 py-1 transition hover:bg-white/30"
            aria-label="Sākums"
          >
            <img src="/brand/lucera.png" alt="Lucera" className="h-10 w-auto sm:h-11" />
          </a>

          <div className="hidden h-6 w-px bg-slate-200/70 sm:block" />

          <div className="pointer-events-auto shrink-0 text-xs font-semibold text-slate-900 sm:text-sm">Fast lane:</div>

          <div className="pointer-events-auto flex min-w-0 flex-1 items-center gap-2 overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[
              { href: '#trust-check', label: 'Personal Trust Check' },
              { href: '#mini-check', label: 'Mini-check' },
              { href: '#ai-checker', label: 'AI tests' },
              { href: '#cost', label: 'Izmaksas' },
              { href: '#faq', label: 'FAQ' },
            ].map((it) => (
              <a
                key={it.href}
                href={it.href}
                className={cx(
                  'shrink-0 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-900',
                  'border border-white/20 bg-white/20 backdrop-blur-xl ring-1 ring-white/10',
                  'hover:bg-white/30 transition'
                )}
              >
                {it.label}
              </a>
            ))}
          </div>

          <button
            type="button"
            onClick={() => document.getElementById('trust-check')?.scrollIntoView({ behavior: 'smooth' })}
            className={cx(
              'pointer-events-auto hidden sm:inline-flex shrink-0 items-center rounded-2xl px-4 py-2',
              'text-xs font-bold text-white',
              'bg-slate-900/90 hover:bg-slate-900 transition',
              'ring-1 ring-white/10 shadow-sm'
            )}
          >
            Saņemt pārbaudi →
          </button>
        </nav>
      </div>

      {/* HERO */}
      <section className="relative py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/25 px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-white/10">
            Fokusā: <span className="font-extrabold">{SPECIALTY_LABEL}</span> (ārsti)
          </div>

          <h1 className="mt-6 text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
            Pacienti arvien biežāk
            <br />
            nevis meklē — bet
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600">
              prasa AI, pie kura flebologa pierakstīties.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-700 mb-8 max-w-4xl mx-auto leading-relaxed">
            Un AI bieži min tos ārstus, par kuriem ir skaidrāki publiskie pierādījumi (profils, metodes, pieredze, citējami avoti).
          </p>

          <GlassCard className="p-6 mb-6 max-w-2xl mx-auto">
            <div className="rounded-2xl border border-white/25 bg-white/25 backdrop-blur-xl px-6 py-5">
              <p className="text-2xl font-medium text-slate-900 italic">"Kur Rīgā pieņem augsti kvalificēts flebologs?"</p>
            </div>
          </GlassCard>

          <GlassCard className="p-6 mb-10 max-w-2xl mx-auto border-red-200/50">
            <div className="rounded-2xl border border-red-200/50 bg-red-50/40 backdrop-blur-xl px-6 py-5">
              <p className="text-xl md:text-2xl font-bold text-red-800">Ja AI jūs nemin — pacients aiziet pie citiem.</p>
            </div>
          </GlassCard>

          <GlassCard className="p-8 mb-4 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-2">Bezmaksas Personal AI Trust Check 1 darba dienas laikā</h2>
            <p className="text-slate-700 mb-6">
              Pārbaudām: vai AI spēj droši nosaukt jūs pacienta jautājumos (un kas traucē, ja nespēj).
            </p>

            <div className="space-y-3 mb-8 text-left max-w-xl mx-auto">
              {[
                'Jūsu pieminēšana 5 tipiskos pacientu jautājumos',
                'Kādus citus flebologus AI min jūsu vietā (un kāpēc)',
                'Top-5 trūkstošie signāli, kas izraisa “fallback mode”',
                'Rīcības plāns: ko publicēt un kur (1 mēnesim uz priekšu)',
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  <span className="text-lg text-slate-800">{t}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <GlassButton
                onClick={() => document.getElementById('trust-check')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-8 py-5 text-xl font-bold"
              >
                Saņemt Personal AI Trust Check
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </GlassButton>

              <button
                type="button"
                onClick={() => setDemoOpen(true)}
                className="rounded-2xl px-8 py-5 font-bold text-xl text-slate-900
               border border-white/20 bg-white/20 backdrop-blur-xl
               hover:bg-white/30 transition shadow-md"
              >
                30 sek. demo (bez datu ievades)
              </button>
            </div>

            <p className="text-sm text-slate-700 mt-4">
              Šī ir pārbaude un atskaite, nevis “pārdošanas zvans”. Mēs parādām datus — lēmumu pieņemat jūs.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* Demo cards section */}
      <section className="py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <AIVisibilityCards />
        </div>
      </section>

      {/* TRUST CHECK (Lead) */}
      <section id="trust-check" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold mb-3">Bezmaksas Personal AI Trust Check 1 darba dienas laikā</h2>
            <p className="text-slate-700">Fokusā: fleboloģija. Iedodiet profila lapu un vārdu — atsūtām pārbaudi uz e-pastu.</p>
          </div>

          <GlassCard className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="text-lg font-semibold mb-4">Ko jūs saņemsiet:</div>
                <div className="space-y-3">
                  {[
                    'Jūsu pieminēšana 5 tipiskos pacienta jautājumos',
                    'Kādus citus flebologus AI min jūsu vietā (un kāpēc)',
                    'Top-5 trūkstošie signāli (“fallback mode”)',
                    'Rīcības plāns: ko publicēt un kur (1 mēnesim uz priekšu)',
                  ].map((t, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                      <div className="text-slate-800">{t}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-blue-200/40 bg-blue-50/40 backdrop-blur-xl p-4">
                  <div className="font-semibold text-slate-900">Svarīgi:</div>
                  <p className="text-sm text-slate-800 mt-1">Mēs nepārņemam kontroli pār jūsu reputāciju — mēs parādām, ko AI šobrīd spēj droši pateikt.</p>
                </div>

                <div className="mt-6 rounded-2xl border border-white/20 bg-white/12 backdrop-blur-xl p-4">
                  <div className="text-sm font-semibold text-slate-900">Specialitāte:</div>
                  <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/25 px-3 py-1 text-sm font-bold">
                    {SPECIALTY_LABEL}
                  </div>
                  <div className="mt-2 text-xs text-slate-600">
                    Pirmā iterācija: tikai fleboloģija (lai ātri dabūtu perfektu piedāvājumu un flow).
                  </div>
                </div>
              </div>

              <div>
                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  <input
                    type="text"
                    inputMode="url"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="Profila lapa (piem. klinika.lv/arsti/janis-berzins)"
                    value={leadProfileUrl}
                    onChange={(e) => {
                      const v = e.target.value;
                      setLeadProfileUrl(v);
                      updateIdentity({ profileUrl: v.trim() || undefined });
                    }}
                    onBlur={() => setLeadProfileUrl(cleanUrlInput(leadProfileUrl))}
                    className={inputBase}
                    required
                  />

                  <input
                    type="text"
                    value={leadDoctor}
                    onChange={(e) => {
                      const v = e.target.value;
                      setLeadDoctor(v);
                      if (!doctorName.trim()) setDoctorName(v);
                      updateIdentity({ doctor: v.trim() || undefined });
                    }}
                    placeholder="Ārsta vārds, uzvārds (piem. Juris Rīts)"
                    className={inputBase}
                  />

                  <input
                    type="email"
                    value={leadEmail}
                    onChange={(e) => {
                      const v = e.target.value;
                      setLeadEmail(v);
                      updateIdentity({ email: v.trim() || undefined });
                    }}
                    placeholder="E-pasts (obligāti)"
                    className={inputBase}
                    required
                  />

                  <GlassButton type="submit" disabled={leadSubmitting} className="w-full">
                    {leadSubmitting ? 'Nosūta...' : 'Saņemt Personal AI Trust Check'}
                  </GlassButton>

                  <div className="text-xs text-slate-700 leading-relaxed">
                    Nosūtot, jūs piekrītat, ka saņemsiet rezultātus uz norādīto e-pastu. Bez spama. Varat atteikties jebkurā brīdī.
                  </div>

                  {leadSuccess && (
                    <div className="p-4 rounded-2xl border border-emerald-200/50 bg-emerald-50/40 backdrop-blur-xl">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-800 flex-shrink-0 mt-0.5" />
                        <div className="text-emerald-900">
                          <div className="font-semibold">Paldies! Pieprasījums saņemts.</div>
                          <div className="text-sm mt-1">Rezultāti būs 1 darba dienas laikā.</div>
                        </div>
                      </div>
                    </div>
                  )}
                </form>

                <div className="mt-6 flex items-center justify-between gap-3">
                  <div className="text-sm text-slate-700">Gribat uzreiz redzēt, ko AI saka?</div>
                  <button
                    onClick={() => document.getElementById('ai-checker')?.scrollIntoView({ behavior: 'smooth' })}
                    className="rounded-2xl px-5 py-3 font-semibold text-white bg-slate-900/90 hover:bg-slate-900 shadow-md ring-1 ring-white/10 transition"
                    type="button"
                  >
                    Paskatīties reālo AI testu →
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* MINI CHECK */}
      <section id="mini-check" className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <GlassCard className="p-8 border-blue-200/50">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div className="flex-1">
                <h2 className="text-3xl md:text-4xl font-bold mb-2">Ātra AI-lasāmības pārbaude (10–15 sekundēs)</h2>
                <p className="text-slate-700">Ievadiet mājaslapu un uzreiz redziet signālus, kas AI traucē nolasīt saturu.</p>
              </div>

              <div className="md:w-[420px]">
                <label className="block text-sm font-medium mb-2 text-slate-800">Mājaslapa (URL)</label>

                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleMiniCheck();
                  }}
                >
                  <input
                    type="text"
                    inputMode="url"
                    value={miniUrl}
                    onChange={(e) => setMiniUrl(e.target.value)}
                    placeholder="klinika.lv"
                    className={cx('flex-1', inputBase)}
                  />
                  <GlassButton type="submit" disabled={miniLoading || !miniUrl.trim()} className="px-5 py-3">
                    {miniLoading ? 'Pārbauda…' : 'Pārbaudīt'}
                  </GlassButton>
                </form>

                <p className="text-xs text-slate-600 mt-2">Mini-check = ātra tehniska + satura lasāmība (tas nav pilnais Trust Check).</p>
              </div>
            </div>

            {miniError && (
              <div className="mt-6 p-4 rounded-2xl border border-red-200/60 bg-red-50/40 backdrop-blur-xl">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-red-800">Mini-check kļūda</div>
                    <div className="text-sm text-red-800/90 mt-1">{miniError}</div>
                  </div>
                </div>
              </div>
            )}

            {miniResult && (
              <div className="mt-8 grid md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-white/20 bg-white/14 backdrop-blur-xl p-6 ring-1 ring-white/10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">AI-lasāmības signāli</h3>

                    <div className="text-right">
                      <div className="text-sm text-slate-600">
                        AI score:{' '}
                        <span
                          className={cx(
                            'font-bold',
                            aiScore === null
                              ? 'text-slate-500'
                              : aiScore >= 80
                              ? 'text-emerald-700'
                              : aiScore >= 50
                              ? 'text-amber-700'
                              : 'text-red-700'
                          )}
                        >
                          {aiScore ?? '—'}/100
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 mt-0.5">
                        Tehniskā pieejamība AI:{' '}
                        <span
                          className={cx(
                            'font-semibold',
                            seoScore === null
                              ? 'text-slate-500'
                              : seoScore >= 80
                              ? 'text-emerald-700'
                              : seoScore >= 50
                              ? 'text-amber-700'
                              : 'text-red-700'
                          )}
                        >
                          {seoScore ?? '—'}/100
                        </span>
                      </div>
                    </div>
                  </div>

                  {pillars && (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {[
                        { k: 'access', label: 'Tehniskā pieejamība', hint: 'indeksācija / render / satura minimums' },
                        { k: 'entitySchema', label: 'Identitāte', hint: 'ārsts / pakalpojumi / metodes' },
                        { k: 'trustSignals', label: 'Uzticamība', hint: 'pierādāmi signāli, kontakti' },
                        { k: 'answerability', label: 'Atbildamība', hint: 'FAQ, skaidrs saturs' },
                      ].map((p) => {
                        const v = (pillars as any)?.[p.k] ?? 0;
                        const tone = pillarTone(v);
                        const s = toneStyles(tone);

                        return (
                          <div key={p.k} className={cx('rounded-2xl border p-3', s.border, s.bg)}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={cx('h-2.5 w-2.5 rounded-full', s.dot)} />
                                <div className="text-sm font-semibold text-slate-900">{p.label}</div>
                              </div>

                              <div className={cx('text-sm font-bold', s.text)}>{v}/100</div>
                            </div>

                            <div className="text-xs text-slate-600 mt-1">{p.hint}</div>

                            <div className={cx('mt-2 h-2 w-full rounded-full overflow-hidden', s.track)}>
                              <div className={cx('h-full', s.fill)} style={{ width: `${Math.max(0, Math.min(100, v))}%` }} />
                            </div>

                            <div className={cx('mt-2 text-xs font-semibold', s.text)}>
                              {tone === 'good' ? 'Labi' : tone === 'warn' ? 'Vidēji' : 'Slikti'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {pillars && (
                    <div className="mt-4 rounded-2xl border border-blue-200/60 bg-blue-50/40 backdrop-blur-xl p-4">
                      {(() => {
                        const line = pillarBusinessLine(pillars as any);
                        if (!line) return null;

                        const t = pillarTone(Number(line.worstValue ?? 0));
                        const s = toneStyles(t);

                        return (
                          <div className="space-y-2">
                            <div className="text-sm font-semibold text-slate-900">Ko tas nozīmē ārstam:</div>

                            <div className="text-sm text-slate-800">
                              <span className={cx('inline-flex items-center gap-2 rounded-full border px-3 py-1 mr-2', s.border, s.bg)}>
                                <span className={cx('h-2.5 w-2.5 rounded-full', s.dot)} />
                                <span className={cx('font-semibold', s.text)}>{line.worstLabel}</span>
                                <span className={cx('font-bold', s.text)}>{line.worstValue}/100</span>
                              </span>
                              <span className="align-middle">{line.message}</span>
                            </div>

                            <div className="pt-3 border-t border-white/20">
                              <div className="text-sm font-semibold text-slate-900">Nākamais solis:</div>
                              <div className="text-sm text-slate-800">
                                Personal AI Trust Check (fleboloģija) – 1 darba dienā.
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {miniResult.finalUrl && <div className="text-xs text-slate-600 mt-2 break-all">Pārbaudīts: {miniResult.finalUrl}</div>}
                </div>

                <div className="rounded-2xl border border-white/20 bg-white/14 backdrop-blur-xl p-6 ring-1 ring-white/10">
                  <div className="text-sm font-semibold text-slate-700 mb-3">Īss kopsavilkums</div>

                  {miniResult.interpretation?.summary ? (
                    <div className="rounded-2xl border border-white/20 bg-white/12 backdrop-blur-xl p-4 text-sm text-slate-900">
                      {miniResult.interpretation.summary}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-700">Kopsavilkums nav pieejams (mini-check atgrieza tikai signālus).</div>
                  )}

                  {!!capReasons.length && (
                    <div className="mt-3 rounded-2xl border border-amber-200/60 bg-amber-50/40 backdrop-blur-xl p-4 space-y-3">
                      <div className="text-sm font-semibold text-amber-900">Kāpēc AI score ir ierobežots:</div>

                      <ul className="space-y-1 text-sm text-amber-900/90">
                        {capReasons.slice(0, 3).map((r, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-1">•</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="pt-3 border-t border-amber-200/50 text-sm text-amber-900/90 space-y-2">
                        <p className="font-semibold">Svarīgi saprast:</p>
                        <p>
                          AI neceļ uzticību no nulles. Tas tikai atpazīst uzticību, ja tā jau ir{' '}
                          <span className="font-semibold">publiski pierādāma un konsekventa</span>.
                        </p>
                      </div>
                    </div>
                  )}

                  {miniResult.interpretation?.quick_wins?.length ? (
                    <div className="mt-4 rounded-2xl border border-emerald-200/60 bg-emerald-50/40 backdrop-blur-xl p-4">
                      <div className="text-sm font-semibold text-emerald-900 mb-2">Ātrie uzlabojumi (quick wins):</div>
                      <ul className="space-y-1 text-sm text-emerald-900/90">
                        {miniResult.interpretation.quick_wins.slice(0, 3).map((w, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-1">•</span>
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <div className="mt-6 pt-5 border-t border-white/20 space-y-3">
                    <button
                      onClick={() => document.getElementById('trust-check')?.scrollIntoView({ behavior: 'smooth' })}
                      className={cx(
                        'w-full group relative overflow-hidden rounded-3xl px-7 py-5 text-left',
                        'text-white font-extrabold',
                        'bg-gradient-to-b from-emerald-500/95 via-emerald-600/95 to-teal-700/95',
                        'shadow-[0_18px_60px_rgba(16,185,129,0.28)]',
                        'ring-1 ring-white/30',
                        'transition-all hover:scale-[1.015] active:scale-[0.99]'
                      )}
                      type="button"
                    >
                      <span className="absolute inset-0 opacity-90 bg-[radial-gradient(120%_80%_at_10%_10%,rgba(255,255,255,0.35),transparent_55%)]" />
                      <span className="absolute inset-0 opacity-70 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.18),transparent_45%)]" />
                      <span className="relative z-10 flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                          <CheckCircle2 className="w-5 h-5" />
                        </span>
                        <span className="flex-1">
                          <span className="flex items-center justify-between gap-3">
                            <span className="leading-snug">
                              Saņemt Personal AI Trust Check (1 darba dienā)
                              <span className="inline-block group-hover:translate-x-0.5 transition-transform"> →</span>
                            </span>
                            <span className="shrink-0 rounded-full bg-white/22 px-3 py-1 text-xs font-extrabold ring-1 ring-white/30">24h</span>
                          </span>
                          <span className="block text-sm font-medium text-white/85 mt-1">Fleboloģija • ārsta pieminēšana AI atbildēs</span>
                        </span>
                      </span>
                    </button>

                    <button
                      onClick={() => document.getElementById('ai-checker')?.scrollIntoView({ behavior: 'smooth' })}
                      className={cx(
                        'w-full group relative overflow-hidden rounded-3xl px-7 py-5 text-left',
                        'text-white font-extrabold',
                        'bg-gradient-to-b from-purple-500/95 via-indigo-600/95 to-blue-700/95',
                        'shadow-[0_18px_60px_rgba(99,102,241,0.38)]',
                        'ring-1 ring-white/30',
                        'transition-all hover:scale-[1.015] active:scale-[0.99]'
                      )}
                      type="button"
                    >
                      <span className="absolute inset-0 opacity-90 bg-[radial-gradient(120%_80%_at_10%_10%,rgba(255,255,255,0.35),transparent_55%)]" />
                      <span className="absolute inset-0 opacity-70 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.18),transparent_45%)]" />
                      <span className="relative z-10 flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                          <Zap className="w-5 h-5" />
                        </span>

                        <span className="flex-1">
                          <span className="flex items-center justify-between gap-3">
                            <span className="leading-snug">
                              Parādīt reālo AI testu (ChatGPT + Claude)
                              <span className="inline-block group-hover:translate-x-0.5 transition-transform"> →</span>
                            </span>
                            <span className="shrink-0 rounded-full bg-white/22 px-3 py-1 text-xs font-extrabold ring-1 ring-white/30">10 sek.</span>
                          </span>

                          <span className="block text-sm font-medium text-white/85 mt-1">Ātrs “proof” bez pilnā check gaidīšanas.</span>
                        </span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </section>

      {/* COST */}
      <section className="py-16 px-4" id="cost">
        <div className="max-w-6xl mx-auto">
          <AICostComparison />
        </div>
      </section>

      {/* AI TEST */}
      <section id="ai-checker" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-3">Pārbaudiet paši: ko AI iesaka fleboloģijā</h2>
          <p className="text-center text-slate-700 mb-10">
            Reāla atbilde no ChatGPT un Claude. (Pirmā iterācija: tikai fleboloģija.)
          </p>

          <GlassCard className="p-8">
            <div className="space-y-4 mb-6">
              <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-4 ring-1 ring-white/10">
                <div className="flex items-center justify-between mb-3 text-sm text-slate-700">
                  <span>
                    Nezini, ko rakstīt? Spied <span className="font-semibold">🎲</span> — ieliksim tipisku pacienta jautājumu.
                  </span>

                  <button
                    type="button"
                    onClick={handleRandomQuery}
                    className={cx(
                      'h-10 w-10 inline-flex items-center justify-center rounded-2xl',
                      'border border-white/20 bg-white/14 backdrop-blur-xl',
                      'ring-1 ring-white/10 text-slate-900',
                      'hover:bg-white/20 transition'
                    )}
                    title="Ģenerēt jautājumu"
                    aria-label="Ģenerēt jautājumu"
                  >
                    <span aria-hidden className="text-lg leading-none">
                      🎲
                    </span>
                  </button>
                </div>

                <label className="block text-sm font-medium mb-2 text-slate-800">Jautājums AI:</label>
                <input
                  id="ai-question"
                  type="text"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder="Kur Rīgā pieņem augsti kvalificēts flebologs?"
                  className={inputBase}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-slate-800">Ārsta vārds, uzvārds (optional):</label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => {
                    const v = e.target.value;
                    setDoctorName(v);
                    if (!leadDoctor.trim()) setLeadDoctor(v);
                    updateIdentity({ doctor: v.trim() || undefined });
                  }}
                  placeholder="Piemēram: Juris Rīts"
                  className={inputBase}
                />
                <div className="mt-2 text-xs text-slate-600">
                  * AI ne vienmēr min ārstu vārdus. Ja vārds nav minēts, tas bieži nozīmē, ka publiskie signāli par praksi nav pietiekami citējami.
                </div>
              </div>
            </div>

            <GlassButton onClick={handleRealAITest} disabled={isLoading || !queryInput.trim()} className="w-full">
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Jautā ChatGPT un Claude...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Testēt ar REĀLU AI (ChatGPT + Claude)
                </>
              )}
            </GlassButton>

            {/* WHY DIFFERENT */}
            <div className="mt-5 rounded-2xl border border-white/20 bg-white/10">
              <button
                type="button"
                onClick={() => setShowWhyDifferent((v) => !v)}
                className="w-full px-4 py-3 flex justify-between text-left font-medium"
              >
                Kāpēc rezultāti var atšķirties no tiem, ko redzu es?
                <ChevronDown className={cx('w-5 h-5 transition', showWhyDifferent && 'rotate-180')} />
              </button>

              {showWhyDifferent && (
                <div className="px-4 pb-4 text-sm text-slate-800 space-y-2">
                  <p>AI neveido oficiālus reitingus. Tas apkopo publiski pieejamu informāciju un interpretē to atkarībā no jautājuma.</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>ChatGPT un Claude darbojas atšķirīgi</li>
                    <li>Jautājuma formulējums maina ieteikumus</li>
                    <li>Atbilde pacientam ≠ atbilde profesionālim</li>
                  </ul>

                  <GlassButton
                    onClick={() => document.getElementById('trust-check')?.scrollIntoView({ behavior: 'smooth' })}
                    className="mt-3 w-full bg-slate-900"
                  >
                    Vēlies Personal AI Trust Check (1 darba dienā)?
                  </GlassButton>
                </div>
              )}
            </div>

            {apiError && (
              <div className="mt-6 p-4 rounded-2xl border border-red-200/60 bg-red-50/40 backdrop-blur-xl">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-red-800">API kļūda</div>
                    <div className="text-sm text-red-800/90 mt-1">{apiError}</div>
                  </div>
                </div>
              </div>
            )}

            {showResults && aiResults && (
              <div className="mt-8 space-y-6">
                {aiResults.chatgpt && (
                  <GlassCard className="p-6 border-emerald-200/60">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-white/25 backdrop-blur-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">🤖</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-lg mb-2 text-emerald-900">ChatGPT atbilde:</div>

                        {aiResults.chatgpt.success ? (
                          <>
                            <div className="rounded-2xl border border-white/20 bg-white/14 backdrop-blur-xl p-4 mb-4">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-semibold text-slate-900">Kopsavilkums</div>

                                  {doctorName ? (
                                    aiResults.userClinicFound?.chatgpt ? (
                                      <div className="mt-2 flex items-center gap-2 text-emerald-900 font-semibold">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span>Ārsts ir minēts</span>
                                      </div>
                                    ) : (
                                      <div className="mt-2 flex items-center gap-2 text-red-800 font-semibold">
                                        <AlertCircle className="w-5 h-5" />
                                        <span>Ārsts nav minēts</span>
                                      </div>
                                    )
                                  ) : (
                                    <div className="mt-2 text-sm text-slate-700">Ievadi ārsta vārdu, lai pārbaudītu “vai minēts”.</div>
                                  )}

                                  {aiResults.chatgpt.clinics?.length > 0 && (
                                    <div className="mt-3">
                                      <div className="text-xs font-semibold text-slate-700 mb-1">3 minētie varianti:</div>
                                      <div className="flex flex-wrap gap-2">
                                        {aiResults.chatgpt.clinics.slice(0, 3).map((c: string, i: number) => (
                                          <span key={i} className="text-xs rounded-full bg-white/25 border border-white/20 px-3 py-1">
                                            {c}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowGptFull((v) => {
                                      const next = !v;
                                      track('ai_full_toggle', { model: 'chatgpt', open: next });
                                      return next;
                                    });
                                  }}
                                  className="w-full sm:w-auto shrink-0 rounded-2xl px-3 py-2 text-sm font-semibold border border-white/20 bg-white/20 hover:bg-white/30 transition"
                                >
                                  {showGptFull ? 'Paslēpt pilno atbildi' : 'Skatīt pilnu atbildi'}
                                </button>
                              </div>
                            </div>

                            {showGptFull && (
                              <div className="rounded-2xl border border-white/20 bg-white/14 backdrop-blur-xl p-4 mb-4 text-sm text-slate-900 whitespace-pre-wrap break-words overflow-hidden">
                                {aiResults.chatgpt.fullResponse}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-red-800 text-sm">Kļūda: {aiResults.chatgpt.error}</div>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                )}

                {aiResults.claude && (
                  <GlassCard className="p-6 border-blue-200/60">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500/15 border border-white/25 backdrop-blur-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">🧠</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-lg mb-2 text-blue-900">Claude atbilde:</div>

                        {aiResults.claude.success ? (
                          <>
                            <div className="rounded-2xl border border-white/20 bg-white/14 backdrop-blur-xl p-4 mb-4">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-semibold text-slate-900">Kopsavilkums</div>

                                  {doctorName ? (
                                    aiResults.userClinicFound?.claude ? (
                                      <div className="mt-2 flex items-center gap-2 text-emerald-900 font-semibold">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span>Ārsts ir minēts</span>
                                      </div>
                                    ) : (
                                      <div className="mt-2 flex items-center gap-2 text-red-800 font-semibold">
                                        <AlertCircle className="w-5 h-5" />
                                        <span>Ārsts nav minēts</span>
                                      </div>
                                    )
                                  ) : (
                                    <div className="mt-2 text-sm text-slate-700">Ievadi ārsta vārdu, lai pārbaudītu “vai minēts”.</div>
                                  )}

                                  {aiResults.claude.clinics?.length > 0 && (
                                    <div className="mt-3">
                                      <div className="text-xs font-semibold text-slate-700 mb-1">3 minētie varianti:</div>
                                      <div className="flex flex-wrap gap-2">
                                        {aiResults.claude.clinics.slice(0, 3).map((c: string, i: number) => (
                                          <span key={i} className="text-xs rounded-full bg-white/25 border border-white/20 px-3 py-1">
                                            {c}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowClaudeFull((v) => {
                                      const next = !v;
                                      track('ai_full_toggle', { model: 'claude', open: next });
                                      return next;
                                    });
                                  }}
                                  className="w-full sm:w-auto shrink-0 rounded-2xl px-3 py-2 text-sm font-semibold border border-white/20 bg-white/20 hover:bg-white/30 transition"
                                >
                                  {showClaudeFull ? 'Paslēpt pilno atbildi' : 'Skatīt pilnu atbildi'}
                                </button>
                              </div>
                            </div>

                            {showClaudeFull && (
                              <div className="rounded-2xl border border-white/20 bg-white/14 backdrop-blur-xl p-4 mb-4 text-sm text-slate-900 whitespace-pre-wrap break-words overflow-hidden">
                                {aiResults.claude.fullResponse}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-red-800 text-sm">Kļūda: {aiResults.claude.error}</div>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                )}

                <GlassCard className="p-6 border-purple-200/60">
                  <h3 className="font-bold text-lg mb-3">📊 Kopsavilkums</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-700">Specialitāte:</span>
                      <span className="font-semibold text-slate-900 text-right">{SPECIALTY_LABEL}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-700">Jautājums:</span>
                      <span className="font-semibold text-slate-900 text-right">{queryInput}</span>
                    </div>
                    {doctorName && (
                      <>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-700">Ārsts:</span>
                          <span className="font-semibold text-slate-900">{doctorName}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-white/20">
                          <span className="text-slate-700">Rezultāts:</span>
                          <span className="font-semibold">
                            {aiResults.userClinicFound?.chatgpt || aiResults.userClinicFound?.claude ? (
                              <span className="text-emerald-800">✅ Minēts vismaz vienā AI</span>
                            ) : (
                              <span className="text-red-800">❌ Nav minēts nevienā AI</span>
                            )}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </GlassCard>

                <GlassButton
                  onClick={() => document.getElementById('trust-check')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full bg-gradient-to-b from-purple-500/95 via-purple-600/95 to-indigo-700/95 shadow-[0_10px_30px_rgba(124,58,237,0.22)]"
                >
                  Saņemt Personal AI Trust Check → (1 darba dienā)
                </GlassButton>

                <p className="text-xs text-slate-700">Piezīme: AI atbildes var atšķirties atkarībā no jautājuma formulējuma un modeļa.</p>
              </div>
            )}
          </GlassCard>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Biežāk uzdotie jautājumi</h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <GlassCard key={index} className="overflow-hidden">
                <button
                  onClick={() => {
                    const next = expandedFaq === index ? null : index;
                    setExpandedFaq(next);
                    track('faq_toggle', { index, open: next !== null, question: faq.q });
                  }}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/10 transition-colors"
                  type="button"
                >
                  <span className="font-medium pr-4 text-slate-900">{faq.q}</span>
                  <ChevronDown className={cx('w-5 h-5 flex-shrink-0 transition-transform text-blue-700', expandedFaq === index && 'rotate-180')} />
                </button>

                {expandedFaq === index && (
                  <div className="px-6 py-5 border-t border-white/20 bg-white/10">
                    <div className="text-slate-800 text-[15px] leading-relaxed">{faq.a}</div>
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <div className="flex items-center">
                <img src="/brand/lucera.png" alt="Lucera" className="h-10 w-auto" />
              </div>

              <p className="mt-2 text-sm text-slate-600">
                Personal AI Trust Check ārstiem + publiskās informācijas strukturēšana, lai AI korekti un droši jūs min pacienta jautājumos.
              </p>
            </div>

            <div>
              <div className="text-sm font-semibold tracking-wide text-slate-900">Kontakti</div>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a className="text-slate-700 hover:text-slate-900 underline-offset-4 hover:underline" href="mailto:go@lucera.site">
                    go@lucera.site
                  </a>
                </li>
                <li>
                  <a className="text-slate-700 hover:text-slate-900 underline-offset-4 hover:underline" href="tel:+37129229686">
                    +371 29 229 686
                  </a>
                </li>
                <li>
                  <a
                    className="text-slate-700 hover:text-slate-900 underline-offset-4 hover:underline"
                    href="https://wa.me/37129229686"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-sm font-semibold tracking-wide text-slate-900">Darba laiks</div>
              <p className="mt-3 text-sm text-slate-700">P–Pk 09:00–18:00 (EET)</p>
              <p className="mt-2 text-xs text-slate-500">Atbildam 1 darba dienas laikā.</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-2 border-t border-slate-200 pt-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
            <div>© {new Date().getFullYear()} Lucera</div>
            <div className="flex gap-4">
              <a className="hover:text-slate-700 underline-offset-4 hover:underline" href="/privacy">
                Privātuma politika
              </a>
              <a className="hover:text-slate-700 underline-offset-4 hover:underline" href="/terms">
                Noteikumi
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* DEMO MODAL */}
      {demoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="30 sekunžu demo"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeDemo();
          }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-2xl">
            <GlassCard className="p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-600 mb-1">30 sek. DEMO (ārsts • fleboloģija)</div>
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900">{demoScreens[demoStep].title}</h3>
                </div>
                <button
                  type="button"
                  onClick={closeDemo}
                  className="rounded-2xl px-3 py-2 text-slate-700 hover:bg-white/10 border border-white/20"
                >
                  Aizvērt ✕
                </button>
              </div>

              <div className="mt-5">{demoScreens[demoStep].body}</div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={prevDemo}
                  disabled={demoStep === 0}
                  className={cx(
                    'rounded-2xl px-4 py-3 font-semibold border border-white/20',
                    'hover:bg-white/10 transition',
                    demoStep === 0 && 'opacity-40 cursor-not-allowed hover:bg-transparent'
                  )}
                >
                  ← Atpakaļ
                </button>

                <div className="flex items-center gap-2 text-xs text-slate-600">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className={cx('h-2 w-2 rounded-full', i === demoStep ? 'bg-blue-600' : 'bg-slate-300')} />
                  ))}
                </div>

                {demoStep < 2 ? (
                  <GlassButton onClick={nextDemo} className="px-5 py-3">
                    Tālāk →
                  </GlassButton>
                ) : (
                  <GlassButton
                    onClick={() => {
                      closeDemo();
                      document.getElementById('trust-check')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-5 py-3"
                  >
                    Saņemt Trust Check →
                  </GlassButton>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </main>
  );
}
