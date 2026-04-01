import type { AdminSession } from './types';

const SESSION_KEY = 'pc_admin_session';

export function getStoredAdminSession(): AdminSession | null {
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AdminSession;
  } catch {
    return null;
  }
}

export function saveAdminSession(session: AdminSession) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearAdminSession() {
  window.localStorage.removeItem(SESSION_KEY);
}
