import { useState, useCallback, useEffect } from 'react';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillScenario?: string;
}

const SCENARIOS = [
  { value: 'mortgage', label: 'хочу дом по ипотеке 6%' },
  { value: 'estimate', label: 'есть смета' },
  { value: 'search_land', label: 'ищу участок' },
  { value: 'have_land', label: 'участок уже есть' },
  { value: 'dont_know', label: 'не знаю, с чего начать' },
];

export default function RequestModal({ isOpen, onClose, prefillScenario }: RequestModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [scenario, setScenario] = useState(prefillScenario || '');
  const [agreed, setAgreed] = useState(false);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      const savedY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(savedY || '0') * -1);
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-[rgba(4,18,38,0.72)] backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-lg rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] p-6 md:p-8 shadow-[0_8px_28px_rgba(0,0,0,0.12)]">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
          aria-label="Закрыть"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <h2 className="text-xl md:text-2xl font-bold text-[var(--color-text-primary)]">
          Расскажите, на каком этапе вы сейчас
        </h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Свяжемся, уточним ситуацию и подскажем следующий шаг. Без давления и навязывания подрядчика.
        </p>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            window.location.href = '/thanks/';
          }}
        >
          <div>
            <label htmlFor="rm-name" className="block text-sm font-medium text-[var(--color-text-primary)]">
              Имя
            </label>
            <input
              id="rm-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white px-4 py-3 text-base text-[var(--color-text-primary)] focus:border-[var(--color-accent-primary)] focus:outline-none focus:ring-[3px] focus:ring-[var(--color-accent-cta-soft)]"
              placeholder="Ваше имя"
            />
          </div>

          <div>
            <label htmlFor="rm-phone" className="block text-sm font-medium text-[var(--color-text-primary)]">
              Телефон
            </label>
            <input
              id="rm-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white px-4 py-3 text-base text-[var(--color-text-primary)] focus:border-[var(--color-accent-primary)] focus:outline-none focus:ring-[3px] focus:ring-[var(--color-accent-cta-soft)]"
              placeholder="+7 (___) ___-__-__"
            />
          </div>

          <div>
            <span className="block text-sm font-medium text-[var(--color-text-primary)]">
              Что сейчас актуально?
            </span>
            <div className="mt-2 space-y-2">
              {SCENARIOS.map((s) => (
                <label key={s.value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="scenario"
                    value={s.value}
                    checked={scenario === s.value}
                    onChange={() => setScenario(s.value)}
                    required
                    className="h-4 w-4 accent-[var(--color-accent-primary)]"
                  />
                  <span className="text-sm text-[var(--color-text-secondary)]">{s.label}</span>
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[var(--color-accent-primary)]"
            />
            <span className="text-xs text-[var(--color-text-secondary)]">
              Согласен на обработку персональных данных.{' '}
              <a href="/privacy/" className="text-[var(--color-accent-primary)] hover:underline">
                Политика конфиденциальности
              </a>{' '}
              и{' '}
              <a href="/soglasie/" className="text-[var(--color-accent-primary)] hover:underline">
                согласие
              </a>.
            </span>
          </label>

          <button
            type="submit"
            className="w-full rounded-[var(--radius-md)] bg-[var(--color-accent-primary)] px-7 py-3.5 text-base font-medium text-white hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            Понять, с чего начать
          </button>
        </form>
      </div>
    </div>
  );
}
