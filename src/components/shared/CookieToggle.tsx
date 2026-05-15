import { useEffect, useState } from 'react';

const CONSENT_KEY = 'rakurs_cookie_consent';

export default function CookieToggle() {
  const [consent, setConsent] = useState<'accepted' | 'rejected' | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored === 'accepted' || stored === 'rejected') {
      setConsent(stored);
    }
  }, []);

  const toggle = () => {
    const next = consent === 'accepted' ? 'rejected' : 'accepted';
    localStorage.setItem(CONSENT_KEY, next);
    setConsent(next);
    window.dispatchEvent(new Event('storage'));
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
