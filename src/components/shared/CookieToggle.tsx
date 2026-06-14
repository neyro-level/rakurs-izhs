import { useEffect, useState } from 'react';
import { COOKIE_CONSENT_KEY } from '@/lib/analytics';

export default function CookieToggle() {
  const [consent, setConsent] = useState<'accepted' | 'rejected' | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored === 'accepted' || stored === 'rejected') {
      setConsent(stored);
    }
  }, []);

  const toggle = () => {
    const next = consent === 'accepted' ? 'rejected' : 'accepted';
    localStorage.setItem(COOKIE_CONSENT_KEY, next);
    setConsent(next);
    window.dispatchEvent(new CustomEvent('rakurs:cookie-consent', { detail: { value: next } }));
  };

  return (
    <button
      onClick={toggle}
      aria-pressed={consent === 'accepted'}
      className="rakurs-cookie-toggle"
      type="button"
    >
      <span className={`rakurs-cookie-toggle__track ${consent === 'accepted' ? 'is-on' : ''}`}>
        <span className="rakurs-cookie-toggle__thumb" />
      </span>
      <span className="rakurs-cookie-toggle__label">
        {consent === 'accepted' ? 'Включены' : 'Отключены'}
      </span>
    </button>
  );
}
