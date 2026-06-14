export const COOKIE_CONSENT_KEY = 'rakurs_cookie_consent';

export type AnalyticsEventName =
  | 'cta_click'
  | 'modal_open'
  | 'modal_close'
  | 'lead_submit_attempt'
  | 'lead_submit_success'
  | 'lead_submit_error'
  | 'phone_click'
  | 'messenger_click'
  | 'faq_open'
  | 'scroll_depth';

type AnalyticsValue = string | number | boolean | null | undefined;
export type AnalyticsParams = Record<string, AnalyticsValue>;

const SCROLL_DEPTH_STEPS = [25, 50, 75, 90] as const;

declare global {
  interface Window {
    ym?: (...args: unknown[]) => void;
    rakursInitAnalytics?: () => void;
    __rakursAnalyticsReady?: boolean;
    __rakursAnalyticsBootstrapReady?: boolean;
    __rakursYmScriptInjected?: boolean;
    __rakursScrollTrackingInitialized?: boolean;
    __rakursScrollDepthSent?: number[];
  }
}

function sanitizeParams(params: AnalyticsParams) {
  const payload: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    payload[key] = typeof value === 'string' ? value.slice(0, 160) : value;
  }

  return payload;
}

export function hasAnalyticsConsent() {
  if (typeof window === 'undefined') return false;

  try {
    return window.localStorage.getItem(COOKIE_CONSENT_KEY) === 'accepted';
  } catch {
    return false;
  }
}

export function isAnalyticsReady() {
  if (typeof window === 'undefined') return false;

  return (
    hasAnalyticsConsent()
    && window.__rakursAnalyticsReady === true
    && Boolean(import.meta.env.PUBLIC_YM_COUNTER_ID)
  );
}

export function track(eventName: AnalyticsEventName, params: AnalyticsParams = {}) {
  if (!isAnalyticsReady()) return false;

  const counterId = import.meta.env.PUBLIC_YM_COUNTER_ID;
  if (!counterId || typeof window.ym !== 'function') return false;

  try {
    window.ym(counterId, 'reachGoal', eventName, sanitizeParams({
      path: window.location.pathname,
      ...params,
    }));
    return true;
  } catch {
    return false;
  }
}

export function initScrollDepthTracking() {
  if (typeof window === 'undefined' || window.__rakursScrollTrackingInitialized) return;

  window.__rakursScrollTrackingInitialized = true;
  const sentDepths = new Set<number>(window.__rakursScrollDepthSent ?? []);

  const saveSentDepths = () => {
    window.__rakursScrollDepthSent = Array.from(sentDepths);
  };

  const emitReachedDepths = () => {
    const root = document.documentElement;
    if (!root) return;

    const maxScroll = root.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return;

    const depth = Math.round((window.scrollY / maxScroll) * 100);

    for (const threshold of SCROLL_DEPTH_STEPS) {
      if (depth < threshold || sentDepths.has(threshold)) continue;

      if (track('scroll_depth', { percent: threshold })) {
        sentDepths.add(threshold);
        saveSentDepths();
      }
    }
  };

  emitReachedDepths();

  window.addEventListener('scroll', emitReachedDepths, { passive: true });
  window.addEventListener('resize', emitReachedDepths);
  window.addEventListener('rakurs:analytics-ready', emitReachedDepths as EventListener);
  window.addEventListener('rakurs:cookie-consent', emitReachedDepths as EventListener);
}
