export type LeadUtmPayload = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
};

export type SendLeadPayload = {
  form: string;
  name: string;
  phone?: string;
  email?: string;
  contact?: string;
  message?: string;
  source?: string;
  honeypot?: string;
  openedAt?: number;
  smartCaptchaToken?: string;
  utm?: LeadUtmPayload;
};

export type SendLeadResult = {
  ok: boolean;
  leadId?: string;
};

function readLeadEnv() {
  const apiUrl = import.meta.env.PUBLIC_LEADS_API_URL;
  const projectId = import.meta.env.PUBLIC_PROJECT_ID;
  const siteKey = import.meta.env.PUBLIC_LEADS_SITE_KEY;

  if (!apiUrl || !projectId || !siteKey) {
    throw new Error('Отправка заявок временно не настроена.');
  }

  return { apiUrl, projectId, siteKey };
}

export async function sendLead(payload: SendLeadPayload): Promise<SendLeadResult> {
  const { apiUrl, projectId, siteKey } = readLeadEnv();

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-AMS-Site-Key': siteKey,
    },
    body: JSON.stringify({
      project: projectId,
      form: payload.form,
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      contact: payload.contact,
      message: payload.message,
      source: payload.source ?? window.location.href,
      honeypot: payload.honeypot,
      openedAt: payload.openedAt,
      smartCaptchaToken: payload.smartCaptchaToken,
      utm: payload.utm,
      meta: {
        page_title: document.title,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
      },
    }),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.error?.message || result?.error || 'Не удалось отправить заявку.');
  }

  return result as SendLeadResult;
}
