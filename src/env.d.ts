/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_YM_COUNTER_ID?: string;
  readonly PUBLIC_LEADS_API_URL?: string;
  readonly PUBLIC_PROJECT_ID?: string;
  readonly PUBLIC_LEADS_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
