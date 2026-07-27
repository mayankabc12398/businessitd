// Tiny shared store for APIs added at runtime via the "Add API" form.
// Lets the API Catalogue and Payloads pages stay in sync within a session
// (and across HashRouter navigation) without a full global store.
const KEY = 'sir-user-apis';

const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
let cache = read();
const listeners = new Set();

export const getUserApis = () => cache;

export const addUserApi = (apiRow) => {
  cache = [apiRow, ...cache];
  try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch { /* ignore quota */ }
  listeners.forEach((fn) => fn(cache));
};

export const subscribeUserApis = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
