// Shared Activity Schedule store — one source of truth for activities so the
// Activity Schedule page (CRUD) and the Kick-off modal (read, per project) stay
// in sync within a session. Seeded from the businessAPI Activities endpoint
// (no hardcoded data); setActivities keeps optimistic session state.
import { api } from '../services/api';

let cache = [];
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn(cache));

// Seed from the API (fire-and-forget on import); widgets re-render via subscribe.
export const loadActivities = async () => {
  try { cache = await api.getActivitySchedule(); } catch { cache = []; }
  emit();
  return cache;
};
loadActivities();

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
