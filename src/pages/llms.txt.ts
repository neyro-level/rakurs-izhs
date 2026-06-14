import { buildLlmsTxt } from '@/lib/geo/llms';

const body = buildLlmsTxt();

export function GET() {
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
