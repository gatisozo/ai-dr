// app/lib/session.ts
export type LuceraEvent =
  | { type: 'page_view'; ts: number; path: string }
  | { type: 'mini_check'; ts: number; url: string; success?: boolean; score?: number }
  | { type: 'ai_check'; ts: number; specialty?: string; query?: string; clinicName?: string; success?: boolean }
  | { type: 'lead_submit'; ts: number; email: string; clinic?: string; website?: string; specialty?: string; success?: boolean };

export function getOrCreateSessionId(): string {
  const name = 'lucera_session_id=';
  const cookies = typeof document !== 'undefined' ? document.cookie.split(';') : [];
  const found = cookies.map(c => c.trim()).find(c => c.startsWith(name));
  if (found) return decodeURIComponent(found.substring(name.length));

  const id = (crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`);
  document.cookie = `lucera_session_id=${encodeURIComponent(id)}; Path=/; Max-Age=${60 * 60 * 6}; SameSite=Lax`; // 6h
  return id;
}

export function getConsent(): 'granted' | 'denied' | null {
  try {
    const v = localStorage.getItem('lucera_cookie_consent');
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

export function setKnownIdentity(data: { email?: string; specialty?: string }) {
  // apzināti – pie tevis būs identificējami cilvēki
  // glabājam lokāli, lai varam pievienot exit summary
  try {
    const prev = JSON.parse(localStorage.getItem('lucera_identity') || '{}');
    localStorage.setItem('lucera_identity', JSON.stringify({ ...prev, ...data }));
  } catch {
    // ignore
  }
}

export function getKnownIdentity(): { email?: string; specialty?: string } {
  try {
    return JSON.parse(localStorage.getItem('lucera_identity') || '{}');
  } catch {
    return {};
  }
}
