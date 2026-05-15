import { useEffect, useState } from 'react';
import '@/styles/cookie-banner.css';

const CONSENT_KEY = 'rakurs_cookie_consent';

declare global {
  interface Window {
    ym?: (...args: unknown[]) => void;
  }
}

function initYandexMetrika(counterId: string) {
  if (window.ym) return;

  const script = document.createElement('script');
  script.innerHTML = `
    (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();
    for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
    k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
    (window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
    ym(${counterId},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});
  `;
  document.head.appendChild(script);
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      setVisible(true);
    } else if (consent === 'accepted') {
      const counterId = import.meta.env.PUBLIC_YM_COUNTER_ID;
      if (counterId) initYandexMetrika(counterId);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setVisible(false);
    const counterId = import.meta.env.PUBLIC_YM_COUNTER_ID;
    if (counterId) initYandexMetrika(counterId);
  };

  const handleReject = () => {
    localStorage.setItem(CONSENT_KEY, 'rejected');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="rakurs-cookie" role="dialog" aria-label="Использование файлов cookie">
      <div className="rakurs-cookie__inner">
        <p className="rakurs-cookie__text">
          Сайт использует cookie для анализа посещаемости.{" "}
          <a href="/privacy/" className="rakurs-cookie__link">
            Политика конфиденциальности
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
