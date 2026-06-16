import { useState, useCallback, useEffect, useRef, type ComponentProps } from 'react';
import { InvisibleSmartCaptcha } from '@yandex/smart-captcha';
import { sendLead } from '@/lib/leads';
import { track } from '@/lib/analytics';
import { z } from 'zod';
import { RequestLeadSchema } from '@/lib/validation';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillScenario?: string;
}

type FormSubmitHandler = NonNullable<ComponentProps<'form'>['onSubmit']>;
type FormErrors = {
  name?: string;
  phone?: string;
  agreed?: string;
};

const SCENARIOS = [
  { value: 'mortgage', label: 'хочу дом по ипотеке 6%' },
  { value: 'estimate', label: 'есть смета' },
  { value: 'search_land', label: 'ищу участок' },
  { value: 'have_land', label: 'участок уже есть' },
  { value: 'dont_know', label: 'не знаю, с чего начать' },
];

const VALID_SCENARIOS = new Set(SCENARIOS.map((scenarioOption) => scenarioOption.value));
const SCENARIO_LABELS = new Map(SCENARIOS.map((scenarioOption) => [scenarioOption.value, scenarioOption.label]));
const SMARTCAPTCHA_CLIENT_KEY = (import.meta.env.PUBLIC_SMARTCAPTCHA_CLIENT_KEY || '').trim();

function normalizeScenario(value?: string) {
  if (!value) return 'dont_know';
  return VALID_SCENARIOS.has(value) ? value : 'dont_know';
}

function normalizePhoneDigits(value: string) {
  const digits = value.replace(/\D/g, '');

  if (digits.startsWith('8')) {
    return `7${digits.slice(1)}`.slice(0, 11);
  }

  if (digits.startsWith('7')) {
    return digits.slice(0, 11);
  }

  return `7${digits}`.slice(0, 11);
}

function formatPhone(value: string) {
  const digits = normalizePhoneDigits(value);

  if (digits.length <= 1) {
    return value.replace(/\D/g, '').length === 0 ? '' : '+7';
  }

  const body = digits.slice(1);
  const part1 = body.slice(0, 3);
  const part2 = body.slice(3, 6);
  const part3 = body.slice(6, 8);
  const part4 = body.slice(8, 10);

  let result = '+7';

  if (part1) result += ` (${part1}`;
  if (part1.length === 3) result += ')';
  if (part2) result += ` ${part2}`;
  if (part3) result += `-${part3}`;
  if (part4) result += `-${part4}`;

  return result;
}

function getUtmPayload() {
  const params = new URLSearchParams(window.location.search);

  return {
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
    utm_content: params.get('utm_content') || '',
    utm_term: params.get('utm_term') || '',
  };
}

export default function RequestModal({ isOpen, onClose, prefillScenario }: RequestModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [scenario, setScenario] = useState(normalizeScenario(prefillScenario));
  const [agreed, setAgreed] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [captchaVisible, setCaptchaVisible] = useState(false);
  const [isCaptchaPending, setIsCaptchaPending] = useState(false);
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [submitError, setSubmitError] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const openedAtRef = useRef(Date.now());
  const isSubmittingLeadRef = useRef(false);

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

  useEffect(() => {
    if (!isOpen) return;
    setName('');
    setPhone('');
    setScenario(normalizeScenario(prefillScenario));
    setAgreed(false);
    setHoneypot('');
    setCaptchaVisible(false);
    setIsCaptchaPending(false);
    setSubmitState('idle');
    setSubmitError('');
    setErrors({});
    openedAtRef.current = Date.now();
  }, [isOpen, prefillScenario]);

  const submitLead = async (smartCaptchaToken?: string) => {
    isSubmittingLeadRef.current = true;
    setSubmitState('loading');
    setSubmitError('');

    const normalizedPhone = `+${normalizePhoneDigits(phone)}`;
    const normalizedScenario = normalizeScenario(scenario);
    const scenarioLabel = SCENARIO_LABELS.get(normalizedScenario) ?? SCENARIOS[SCENARIOS.length - 1]?.label ?? '';

    track('lead_submit_attempt', {
      form: 'request_modal',
      scenario: normalizedScenario,
    });

    try {
      await sendLead({
        form: 'request_modal',
        name: name.trim(),
        phone: normalizedPhone,
        contact: normalizedPhone,
        message: `Актуальный запрос: ${scenarioLabel}`,
        source: window.location.href,
        honeypot,
        openedAt: openedAtRef.current,
        smartCaptchaToken,
        utm: getUtmPayload(),
      });

      const tracked = track('lead_submit_success', {
        form: 'request_modal',
        scenario: normalizedScenario,
      });

      window.setTimeout(() => {
        window.location.href = '/thanks/';
      }, tracked ? 150 : 0);
    } catch (error) {
      track('lead_submit_error', {
        form: 'request_modal',
        type: 'request',
        scenario: normalizedScenario,
      });
      setSubmitState('error');
      setSubmitError(error instanceof Error ? error.message : 'Не удалось отправить заявку. Попробуйте ещё раз.');
    } finally {
      isSubmittingLeadRef.current = false;
      setCaptchaVisible(false);
      setIsCaptchaPending(false);
    }
  };

  const handleCaptchaFailure = (message: string) => {
    setCaptchaVisible(false);
    setIsCaptchaPending(false);
    setSubmitState('error');
    setSubmitError(message);
  };

  const handleSubmit: FormSubmitHandler = async (event) => {
    event.preventDefault();

    if (submitState === 'loading') return;

    const validationResult = RequestLeadSchema.safeParse({
      name,
      phone,
      agreed,
    });

    if (!validationResult.success) {
      const fieldErrors = z.flattenError(validationResult.error).fieldErrors;
      track('lead_submit_error', {
        form: 'request_modal',
        type: 'validation',
        fields: Object.keys(fieldErrors).filter((field) => fieldErrors[field as keyof typeof fieldErrors]?.length).join(',') || 'unknown',
      });
      setErrors({
        name: fieldErrors.name?.[0],
        phone: fieldErrors.phone?.[0],
        agreed: fieldErrors.agreed?.[0],
      });
      setSubmitState('idle');
      return;
    }

    setErrors({});
    setSubmitError('');

    if (SMARTCAPTCHA_CLIENT_KEY) {
      setSubmitState('loading');
      setIsCaptchaPending(true);
      setCaptchaVisible(false);
      window.setTimeout(() => setCaptchaVisible(true), 0);
      return;
    }

    await submitLead();
  };

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
          onSubmit={handleSubmit}
        >
          {SMARTCAPTCHA_CLIENT_KEY && (
            <InvisibleSmartCaptcha
              sitekey={SMARTCAPTCHA_CLIENT_KEY}
              language="ru"
              visible={captchaVisible}
              shieldPosition="bottom-right"
              onChallengeHidden={() => {
                setCaptchaVisible(false);
                if (isCaptchaPending && !isSubmittingLeadRef.current) {
                  setIsCaptchaPending(false);
                  setSubmitState('idle');
                }
              }}
              onNetworkError={() => handleCaptchaFailure('Не удалось запустить SmartCaptcha. Попробуйте ещё раз.')}
              onTokenExpired={() => handleCaptchaFailure('Проверка SmartCaptcha истекла. Попробуйте ещё раз.')}
              onJavascriptError={() => handleCaptchaFailure('SmartCaptcha временно недоступна. Попробуйте ещё раз.')}
              onSuccess={(token) => {
                if (!isCaptchaPending) return;
                void submitLead(token);
              }}
            />
          )}
          <div>
            <label htmlFor="rm-name" className="block text-sm font-medium text-[var(--color-text-primary)]">
              Имя
            </label>
            <input
              id="rm-name"
              type="text"
              required
              value={name}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'rm-name-error' : undefined}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) {
                  setErrors((current) => ({ ...current, name: undefined }));
                }
              }}
              className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white px-4 py-3 text-base text-[var(--color-text-primary)] focus:border-[var(--color-accent-primary)] focus:outline-none focus:ring-[3px] focus:ring-[var(--color-accent-cta-soft)]"
              placeholder="Ваше имя"
            />
            {errors.name && (
              <p id="rm-name-error" className="mt-2 text-sm text-[var(--color-error)]">
                {errors.name}
              </p>
            )}
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
              inputMode="tel"
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? 'rm-phone-error' : undefined}
              onChange={(e) => {
                setPhone(formatPhone(e.target.value));
                if (errors.phone) {
                  setErrors((current) => ({ ...current, phone: undefined }));
                }
              }}
              className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white px-4 py-3 text-base text-[var(--color-text-primary)] focus:border-[var(--color-accent-primary)] focus:outline-none focus:ring-[3px] focus:ring-[var(--color-accent-cta-soft)]"
              placeholder="+7 (___) ___-__-__"
            />
            {errors.phone && (
              <p id="rm-phone-error" className="mt-2 text-sm text-[var(--color-error)]">
                {errors.phone}
              </p>
            )}
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
              aria-invalid={Boolean(errors.agreed)}
              aria-describedby={errors.agreed ? 'rm-agreed-error' : undefined}
              onChange={(e) => {
                setAgreed(e.target.checked);
                if (errors.agreed) {
                  setErrors((current) => ({ ...current, agreed: undefined }));
                }
              }}
              className="mt-0.5 h-4 w-4 accent-[var(--color-accent-primary)]"
            />
            <span className="text-xs text-[var(--color-text-secondary)]">
              Согласен на обработку персональных данных.{' '}
              <a href="/politika/" className="text-[var(--color-accent-primary)] hover:underline">
                Политика конфиденциальности
              </a>.
            </span>
          </label>
          {errors.agreed && (
            <p id="rm-agreed-error" className="text-sm text-[var(--color-error)]">
              {errors.agreed}
            </p>
          )}

          <div className="hidden" aria-hidden="true">
            <label htmlFor="rm-company">Компания</label>
            <input
              id="rm-company"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          {submitState === 'error' && (
            <p className="text-sm text-[var(--color-error)]" role="alert">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitState === 'loading'}
            aria-busy={submitState === 'loading'}
            className="w-full rounded-[var(--radius-md)] bg-[var(--color-accent-primary)] px-7 py-3.5 text-base font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitState === 'loading' ? 'Отправляем...' : 'Понять, с чего начать'}
          </button>

          <p className="text-xs text-[var(--color-text-secondary)]">
            {SMARTCAPTCHA_CLIENT_KEY
              ? 'Форма защищена Yandex SmartCaptcha. Без спама, только связь по вашей задаче.'
              : 'Без спама. Только чтобы связаться по вашей задаче.'}
          </p>
        </form>
      </div>
    </div>
  );
}
