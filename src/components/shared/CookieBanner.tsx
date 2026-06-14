import { useEffect, useState } from 'react';
import '@/styles/cookie-banner.css';
import { COOKIE_CONSENT_KEY } from '@/lib/analytics';

declare global {
  interface Window {
    rakursInitAnalytics?: () => void;
    __rakursAnalyticsReady?: boolean;
  }
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const syncConsent = (value?: string | null) => {
      const consent = value ?? localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consent) {
        window.__rakursAnalyticsReady = false;
        setVisible(true);
        return;
      }

      setVisible(false);
      if (consent === 'accepted') {
        window.rakursInitAnalytics?.();
        return;
      }

      window.__rakursAnalyticsReady = false;
    };

    syncConsent();

    const handleStorage = () => syncConsent();
    const handleConsentEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ value?: string }>;
      syncConsent(customEvent.detail?.value);
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('rakurs:cookie-consent', handleConsentEvent);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('rakurs:cookie-consent', handleConsentEvent);
    };
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    window.rakursInitAnalytics?.();
    window.dispatchEvent(new CustomEvent('rakurs:cookie-consent', { detail: { value: 'accepted' } }));
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected');
    window.__rakursAnalyticsReady = false;
    window.dispatchEvent(new CustomEvent('rakurs:cookie-consent', { detail: { value: 'rejected' } }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="rakurs-cookie" role="dialog" aria-label="Использование файлов cookie">
      <div className="rakurs-cookie__inner">
        <p className="rakurs-cookie__text">
          Сайт использует cookie для анализа посещаемости.{" "}
          <a href="/cookies/" className="rakurs-cookie__link">
            Правила использования cookie
          </a>
          .
        </p>
        <div className="rakurs-cookie__actions">
          <button className="rakurs-cookie__btn rakurs-cookie__btn--accept" type="button" onClick={handleAccept}>
            Принять
          </button>
          <button className="rakurs-cookie__btn rakurs-cookie__btn--reject" type="button" onClick={handleReject}>
            Отказаться
          </button>
        </div>
      </div>
    </div>
  );
}
