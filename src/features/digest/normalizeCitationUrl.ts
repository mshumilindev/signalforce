export function normalizeCitationUrl(url: string): string {
  try {
    const parsed = new URL(url.trim());
    parsed.hash = '';

    for (const key of [...parsed.searchParams.keys()]) {
      if (key.toLowerCase().startsWith('utm_') || key === 'fbclid') {
        parsed.searchParams.delete(key);
      }
    }

    const pathname = parsed.pathname.replace(/\/+$/, '') || '/';
    return `${parsed.protocol}//${parsed.host.toLowerCase()}${pathname}${parsed.search}`;
  } catch {
    return url.trim().toLowerCase();
  }
}
