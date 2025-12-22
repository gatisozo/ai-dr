'use client';

import React, { useEffect, useState } from 'react';

const CONSENT_KEY = 'lucera_cookie_consent'; // 'granted' | 'denied' | null

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const v = localStorage.getItem(CONSENT_KEY);
    if (!v) setVisible(true);
  }, []);

  const setConsent = (value: 'granted' | 'denied') => {
    localStorage.setItem(CONSENT_KEY, value);

    // Optional: arī cookie (ja gribi lasīt serverī)
    document.cookie = `lucera_consent=${value}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`;

    // Signāls klientam (GA init)
    window.dispatchEvent(new CustomEvent('lucera:consent-changed', { detail: value }));

    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-4">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-xl p-4 shadow-lg">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-slate-800">
            <div className="font-semibold text-slate-900">Sīkdatnes (cookies)</div>
            <div className="mt-1 text-slate-700">
              Mēs izmantojam Google Analytics, lai saprastu, kā tiek lietots rīks (mini-check, AI tests u.c.).
              Jūs varat piekrist vai atteikties. Detalizēti — Privātuma politikā.
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConsent('denied')}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Atteikties
            </button>
            <button
              type="button"
              onClick={() => setConsent('granted')}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-950"
            >
              Piekrītu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
