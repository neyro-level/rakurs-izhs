import { Check, ChevronRight, MessageSquare, Send, X } from 'lucide-react';
import { useEffect, useState, type ComponentProps } from 'react';
import { sendReviewComment, type ReviewBlockPayload } from '@/lib/review';

type ReviewBlock = ReviewBlockPayload & {
  element: HTMLElement;
};

type SubmitState = 'idle' | 'sending' | 'sent' | 'error';
type ReviewFormSubmitEvent = Parameters<NonNullable<ComponentProps<'form'>['onSubmit']>>[0];

const REVIEW_API_URL = import.meta.env.PUBLIC_REVIEW_API_URL || '';
const REVIEW_PROJECT_ID = import.meta.env.PUBLIC_REVIEW_PROJECT_ID || import.meta.env.PUBLIC_PROJECT_ID || '';
const REVIEW_SITE_KEY = import.meta.env.PUBLIC_REVIEW_SITE_KEY || '';
const REVIEW_ENABLE_PRODUCTION = import.meta.env.PUBLIC_REVIEW_ENABLE_PRODUCTION === 'true';
const REVIEW_ENABLE_PRODUCTION_UNTIL = import.meta.env.PUBLIC_REVIEW_ENABLE_PRODUCTION_UNTIL || '';

export default function ReviewWidget() {
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [blocks, setBlocks] = useState<ReviewBlock[]>([]);
  const [selected, setSelected] = useState<ReviewBlock | null>(null);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<SubmitState>('idle');
  const [error, setError] = useState('');

  const configReady = Boolean(REVIEW_API_URL && REVIEW_PROJECT_ID && REVIEW_SITE_KEY);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setEnabled(shouldEnableWidget(configReady));
  }, [configReady]);

  useEffect(() => {
    if (!enabled) return;

    const discovered = collectReviewBlocks();
    setBlocks(discovered);
    setSelected((current) => current ?? discovered[0] ?? null);
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !open) return;

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest('[data-review-widget]')) return;

      const block = blocks.find((item) => item.element.contains(target));
      if (!block) return;

      event.preventDefault();
      event.stopPropagation();
      setSelected(block);
      setStatus('idle');
      setError('');
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [blocks, enabled, open]);

  useEffect(() => {
    blocks.forEach((block) => {
      block.element.classList.toggle('ams-review-target', enabled && open);
      block.element.classList.toggle('ams-review-target-active', selected?.id === block.id && enabled && open);
    });

    document.documentElement.classList.toggle('ams-review-mode', enabled && open);

    return () => {
      blocks.forEach((block) => {
        block.element.classList.remove('ams-review-target', 'ams-review-target-active');
      });
      document.documentElement.classList.remove('ams-review-mode');
    };
  }, [blocks, enabled, open, selected]);

  if (!enabled) return null;

  const statusText = getStatusText(configReady, status, selected);

  async function handleSubmit(event: ReviewFormSubmitEvent) {
    event.preventDefault();
    if (!selected || !comment.trim()) return;

    setStatus('sending');
    setError('');

    try {
      await sendReviewComment(REVIEW_API_URL, REVIEW_SITE_KEY, {
        project: REVIEW_PROJECT_ID,
        page: window.location.pathname,
        url: window.location.href,
        block: {
          id: selected.id,
          title: selected.title,
          path: selected.path,
          index: selected.index,
        },
        comment: comment.trim(),
        meta: {
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          scrollY: Math.round(window.scrollY),
          userAgent: navigator.userAgent,
        },
      });

      setComment('');
      setStatus('sent');
    } catch (submitError) {
      setStatus('error');
      setError(submitError instanceof Error ? submitError.message : 'Не удалось отправить комментарий.');
    }
  }

  return (
    <div className="ams-review" data-review-widget>
      <button
        className="ams-review__launcher"
        type="button"
        aria-label={open ? 'Закрыть режим правок' : 'Открыть режим правок'}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={18} strokeWidth={1.8} /> : <MessageSquare size={18} strokeWidth={1.8} />}
        <span>{open ? 'Закрыть' : 'Правки'}</span>
      </button>

      {open && (
        <aside className="ams-review__panel" aria-label="Комментарии к сайту">
          <div className="ams-review__header">
            <div>
              <p className="ams-review__eyebrow">AMS Review</p>
              <h2 className="ams-review__title">Комментарии по блокам</h2>
            </div>
            <button className="ams-review__icon" type="button" aria-label="Закрыть" onClick={() => setOpen(false)}>
              <X size={18} strokeWidth={1.8} />
            </button>
          </div>

          <div className="ams-review__status" data-state={status}>
            {status === 'sent' && <Check size={16} strokeWidth={1.8} />}
            <span>{statusText}</span>
          </div>

          <p className="ams-review__hint">
            Выберите блок из списка или просто кликните по нему на странице, затем напишите правку.
          </p>

          <div className="ams-review__blocks" aria-label="Блоки страницы">
            {blocks.map((block) => (
              <button
                className="ams-review__block"
                data-active={selected?.id === block.id}
                key={block.id}
                type="button"
                onClick={() => {
                  setSelected(block);
                  setStatus('idle');
                  setError('');
                  block.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              >
                <span>{block.title}</span>
                <ChevronRight size={16} strokeWidth={1.8} />
              </button>
            ))}
          </div>

          <form className="ams-review__form" onSubmit={handleSubmit}>
            <label className="ams-review__label" htmlFor="ams-review-comment">
              Комментарий
            </label>
            <textarea
              className="ams-review__textarea"
              id="ams-review-comment"
              name="comment"
              value={comment}
              onChange={(event) => {
                setComment(event.target.value);
                if (status !== 'sending') {
                  setStatus('idle');
                  setError('');
                }
              }}
              placeholder="Напишите, какой текст или смысл нужно поправить в выбранном блоке"
              rows={7}
              required
            />
            {error && <p className="ams-review__error">{error}</p>}
            <button className="ams-review__submit" type="submit" disabled={!selected || !comment.trim() || status === 'sending'}>
              <Send size={16} strokeWidth={1.8} />
              <span>{status === 'sending' ? 'Отправляем' : 'Отправить'}</span>
            </button>
          </form>
        </aside>
      )}
    </div>
  );
}

function getStatusText(configReady: boolean, status: SubmitState, selected: ReviewBlock | null) {
  if (!configReady) return 'Review не настроен';
  if (status === 'sending') return 'Отправляем';
  if (status === 'sent') return 'Комментарий отправлен';
  if (status === 'error') return 'Ошибка отправки';
  return selected ? selected.title : 'Выберите блок';
}

function shouldEnableWidget(configReady: boolean) {
  if (typeof window === 'undefined') return false;
  if (!configReady) return false;

  const params = new URLSearchParams(window.location.search);
  const hostname = window.location.hostname;
  const isPreview = hostname.endsWith('.preview.ams-cloud.ru');
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
  const forced = params.get('review') === '1';
  const disabled = params.get('review') === '0';
  const productionWindowActive = isProductionWindowActive();

  if (disabled) return false;
  if (isPreview || isLocal) return true;
  if (!productionWindowActive) return false;

  return REVIEW_ENABLE_PRODUCTION || forced;
}

function isProductionWindowActive() {
  if (!REVIEW_ENABLE_PRODUCTION) return false;
  if (!REVIEW_ENABLE_PRODUCTION_UNTIL) return true;

  const timestamp = Date.parse(REVIEW_ENABLE_PRODUCTION_UNTIL);
  if (Number.isNaN(timestamp)) return true;

  return Date.now() <= timestamp;
}

function collectReviewBlocks(): ReviewBlock[] {
  const explicit = Array.from(document.querySelectorAll<HTMLElement>('[data-review-id]'))
    .filter((element) => !element.closest('[data-review-widget]'));

  const candidates = explicit.length > 0
    ? explicit
    : Array.from(document.querySelectorAll<HTMLElement>('main section, main article'))
      .filter((element) => !element.closest('[data-review-widget]'));

  return candidates.map((element, index) => {
    const fallbackTitle = element.querySelector('h1, h2, h3')?.textContent?.trim();

    return {
      element,
      id: element.dataset.reviewId || element.id || `block-${index + 1}`,
      title: element.dataset.reviewTitle || fallbackTitle || `Блок ${index + 1}`,
      path: element.dataset.reviewPath,
      index: index + 1,
    };
  });
}
