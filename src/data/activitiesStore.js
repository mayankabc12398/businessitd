// Shared Activity Schedule store — one source of truth for activities so the
// Activity Schedule page (CRUD) and the Kick-off modal (read, per project) stay
// in sync within a session and across HashRouter navigation.
import { ACTIVITY_SCHEDULE } from './schedule';

const KEY = 'pmo-activities';
const seed = () => ACTIVITY_SCHEDULE.map((a) => ({ ...a }));
const read = () => { try { const s = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(s) ? s : null; } catch { return null; } };

let cache = read() || seed();
const listeners = new Set();
const emit = () => {
  try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch { /* ignore quota */ }
  listeners.forEach((fn) => fn(cache));
};

export const getActivities = () => cache;
export const setActivities = (updater) => { cache = typeof updater === 'function' ? updater(cache) : updater; emit(); };
export const subscribeActivities = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

// activities linked to a project — by explicit projectCode or matching hospital/client name
export const activitiesForProject = (project) => {
  if (!project) return [];
  const client = (project.clientName || '').toLowerCase();
  return cache.filter((a) =>
    a.projectCode === project.code ||
    (client && a.clinic && a.clinic.toLowerCase().includes(client)),
  );
};
