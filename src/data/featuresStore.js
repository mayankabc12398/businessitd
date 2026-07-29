// Shared feature store — single source of truth for the Feature Intelligence
// workspace so the Workflow board, All Features list and the detail drawer all
// reflect status changes (request → review → approve → … → share) live.
// Seeded from the businessAPI Features endpoint (no hardcoded data).
import { api } from '../services/api';

let cache = []; // in-memory (session) — advances reset on reload
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn(cache));

export const loadFeatures = async () => {
  try { cache = await api.getFeatures(); } catch { cache = []; }
  emit();
  return cache;
};
loadFeatures();

export const getFeatures = () => cache;
export const subscribeFeatures = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

export const addFeature = (f) => { cache = [f, ...cache]; emit(); };
export const setFeatureStatus = (id, status) => { cache = cache.map((f) => (f.id === id ? { ...f, status } : f)); emit(); };
// Attach/replace a documentation block (ba / ta / dev …) on a feature.
export const setFeatureData = (id, key, data) => { cache = cache.map((f) => (f.id === id ? { ...f, [key]: data } : f)); emit(); };

// Ordered lifecycle + the action label to reach the next stage.
export const FEATURE_FLOW = ['New Request', 'Under Review', 'Approved', 'In Development', 'Testing', 'Deployed', 'Available for All'];
export const nextStatus = (s) => { const i = FEATURE_FLOW.indexOf(s); return i >= 0 && i < FEATURE_FLOW.length - 1 ? FEATURE_FLOW[i + 1] : null; };
export const advanceFeature = (id) => { const f = cache.find((x) => x.id === id); const nx = f && nextStatus(f.status); if (nx) setFeatureStatus(id, nx); return nx; };

export const ADVANCE_LABEL = {
  'New Request': 'Send for Review',
  'Under Review': 'Approve',
  Approved: 'Start Development',
  'In Development': 'Move to Testing',
  Testing: 'Deploy',
  Deployed: 'Share with All',
};
