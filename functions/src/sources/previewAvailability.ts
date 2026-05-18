export interface PreviewAvailabilityResult {
  readonly available: boolean;
  readonly reason: 'available' | 'invalidUrl' | 'fetchFailed' | 'blockedByHeaders';
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function blocksIframe(headers: Headers): boolean {
  const xFrameOptions = headers.get('x-frame-options')?.toLowerCase() ?? '';
  if (xFrameOptions.includes('deny') || xFrameOptions.includes('sameorigin')) {
    return true;
  }

  const contentSecurityPolicy = headers.get('content-security-policy')?.toLowerCase() ?? '';
  const frameAncestors = contentSecurityPolicy
    .split(';')
    .map((directive) => directive.trim())
    .find((directive) => directive.startsWith('frame-ancestors'));

  return Boolean(
    frameAncestors &&
      (frameAncestors.includes("'none'") ||
        frameAncestors.includes("'self'") ||
        frameAncestors.includes('localhost')),
  );
}

export async function checkSourcePreviewAvailability(
  url: string,
): Promise<PreviewAvailabilityResult> {
  if (!isHttpUrl(url)) {
    return { available: false, reason: 'invalidUrl' };
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    if (!response.ok) {
      return { available: false, reason: 'fetchFailed' };
    }

    if (blocksIframe(response.headers)) {
      return { available: false, reason: 'blockedByHeaders' };
    }

    return { available: true, reason: 'available' };
  } catch {
    return { available: false, reason: 'fetchFailed' };
  }
}
