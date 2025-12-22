'use client';

import Script from 'next/script';
import React, { useEffect, useMemo, useState } from 'react';

const CONSENT_KEY = 'lucera_cookie_consent';

export default function GASnippet() {
  const [consent, setConsent] = useState<'granted' | 'denied' | null>(null);
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX';

  useEffect(() => {
    const read = () => {
      const v = localStorage.getItem(CONSENT_KEY) as any;
      setConsent(v === 'granted' || v === 'denied' ? v : null);
    };
    read();

    const handler = (e: any) => setConsent(e?.detail ?? localStorage.getItem(CONSENT_KEY) as any);
    window.addEventListener('lucera:consent-changed', handler as any);
    return () => window.removeEventListener('lucera:consent-changed', handler as any);
  }, []);

  const enabled = useMemo(() => consent === 'granted', [consent]);

  if (!enabled) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            anonymize_ip: true
          });
        `}
      </Script>
    </>
  );
}
