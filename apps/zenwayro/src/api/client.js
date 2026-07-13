import { createSignal } from '../../../../index.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const TOKEN_KEY = 'zenwayro_access_token';
const REFRESH_KEY = 'zenwayro_refresh_token';
const USER_ID_KEY = 'zenwayro_user_id';
const MAP_ASSETS = import.meta.env.VITE_MAP_ASSETS_BASE || '';

function storageGet(key) {
  try {
    return localStorage.getItem(key) || '';
  } catch {
    return '';
  }
}

function storageSet(key, value) {
  try {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

const [getToken, setTokenSignal] = createSignal(storageGet(TOKEN_KEY));
const [getUser, setUser] = createSignal(null);

let refreshInFlight = null;

export function useAuthToken() {
  return getToken;
}

export function useAuthUser() {
  return getUser;
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function setAccessToken(token, refreshToken, userId) {
  const value = token || '';
  storageSet(TOKEN_KEY, value);
  if (refreshToken !== undefined) storageSet(REFRESH_KEY, refreshToken || '');
  if (userId !== undefined) storageSet(USER_ID_KEY, userId || '');
  setTokenSignal(value);
  if (!value) setUser(null);
}

/** Apply login / Google auth payload (access + refresh + user). */
export function applyAuthResponse(data) {
  const token = data?.accessToken || data?.token || data?.access_token;
  if (token) {
    setAccessToken(
      token,
      data?.refreshToken || '',
      data?.userId || data?.user?.id || ''
    );
  }
  if (data?.user) setUser(data.user);
  return data;
}

async function refreshAccessToken() {
  const refreshToken = storageGet(REFRESH_KEY);
  const userId = storageGet(USER_ID_KEY);
  if (!refreshToken || !userId) throw new Error('No refresh token');

  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ userId, refreshToken }),
  })
    .then(async (res) => {
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || 'Refresh failed');
      const access =
        data?.accessToken || data?.token || data?.access_token || '';
      setAccessToken(access, data?.refreshToken || refreshToken, data?.userId || userId);
      if (data?.user) setUser(data.user);
      return access;
    })
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
}

export async function apiRequest(path, options = {}) {
  const headers = {
    Accept: 'application/json',
    ...(options.body && !(options.body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...options.headers,
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const doFetch = () =>
    fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      body:
        options.body &&
        typeof options.body === 'object' &&
        !(options.body instanceof FormData)
          ? JSON.stringify(options.body)
          : options.body,
    });

  let res = await doFetch();

  if (res.status === 401 && storageGet(REFRESH_KEY) && !options._retried) {
    try {
      await refreshAccessToken();
      headers.Authorization = `Bearer ${getToken()}`;
      res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
        body:
          options.body &&
          typeof options.body === 'object' &&
          !(options.body instanceof FormData)
            ? JSON.stringify(options.body)
            : options.body,
      });
    } catch {
      setAccessToken('');
    }
  }

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) || `HTTP ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function login(email, password) {
  const data = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  return applyAuthResponse(data);
}

export async function register(payload) {
  return apiRequest('/api/auth/register', { method: 'POST', body: payload });
}

export async function fetchMe() {
  const data = await apiRequest('/api/users/me');
  setUser(data);
  return data;
}

export async function updateMe(payload) {
  const data = await apiRequest('/api/users/me', {
    method: 'PATCH',
    body: payload,
  });
  setUser(data);
  return data;
}

export async function fetchTrips() {
  return apiRequest('/api/trips');
}

export async function fetchPopularTrips(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiRequest(`/api/popular-trips${qs ? `?${qs}` : ''}`);
}

export async function fetchTrip(id) {
  return apiRequest(`/api/trips/${id}`);
}

export async function createTrip(payload) {
  return apiRequest('/api/trips', { method: 'POST', body: payload });
}

export async function updateTrip(id, payload) {
  return apiRequest(`/api/trips/${id}`, { method: 'PATCH', body: payload });
}

export async function deleteTrip(id) {
  return apiRequest(`/api/trips/${id}`, { method: 'DELETE' });
}

export async function completeQuiz(answers) {
  return apiRequest('/api/quiz/complete', { method: 'POST', body: answers });
}

export async function searchCities(q) {
  return apiRequest(`/api/cities/search?q=${encodeURIComponent(q)}`);
}

export async function requestPasswordReset(email) {
  return apiRequest('/api/auth/forgot-password', {
    method: 'POST',
    body: { email },
  });
}

export async function resetPassword(token, password) {
  return apiRequest('/api/auth/reset-password', {
    method: 'POST',
    body: { token, password },
  });
}

export function logout() {
  setAccessToken('');
  storageSet(REFRESH_KEY, '');
  storageSet(USER_ID_KEY, '');
}

export function getMapStyleUrl() {
  return MAP_ASSETS;
}

export { API_URL };
