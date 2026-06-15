export type ReviewBlockPayload = {
  id: string;
  title: string;
  path?: string;
  index?: number;
};

export type ReviewCommentPayload = {
  project: string;
  page: string;
  url: string;
  block: ReviewBlockPayload;
  comment: string;
  meta?: Record<string, unknown>;
};

export async function sendReviewComment(
  endpoint: string,
  siteKey: string,
  payload: ReviewCommentPayload,
): Promise<{ ok: boolean; commentId?: string }> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-AMS-Site-Key': siteKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || 'Не удалось отправить комментарий.');
  }

  return response.json() as Promise<{ ok: boolean; commentId?: string }>;
}
