// Route API requests through this Next.js deployment to avoid browser CORS restrictions.
export const BACKEND_URL = '/api/backend';

export async function apiFetch<T = unknown>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const fullUrl = url.startsWith('http') ? url : `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;

  const response = await fetch(fullUrl, {
    ...options,
    headers,
    credentials: 'include',
  });

  const responseText = await response.text();
  let data: { message?: string; detail?: string } | null = null;
  try {
    data = responseText ? JSON.parse(responseText) as { message?: string; detail?: string } : null;
  } catch {
    data = null;
  }
  if (response.status === 401) {
    if (typeof window !== 'undefined' && !window.location.pathname.toLowerCase().includes('/login')) {
      window.location.assign('/Login/Login');
    }
    throw new Error(data?.message || 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  }

  if (!response.ok) {
    const responseMessage = data?.detail || data?.message || responseText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    throw new Error(responseMessage || `HTTP ${response.status}`);
  }

  return (data ?? {}) as T;
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const fullUrl = url.startsWith('http') ? url : `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  return fetch(fullUrl, { ...options, credentials: 'include' });
}

export async function apiRequest<T = unknown>(url: string, options: RequestInit = {}): Promise<T> {
  return apiFetch<T>(url, options);
}
