import { buildRobotsTxt } from '@/lib/geo/robots';

export function GET() {
  return new Response(buildRobotsTxt(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
