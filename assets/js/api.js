// assets/js/api.js

const CACHE_KEY = 'cachedItems';
const API_URL = 'https://api.tarkov.dev/graphql';
const QUERY = '{ items(lang: en) { id name } }';

/**
 * Fetch all items from tarkov.dev GraphQL API.
 * @returns {Promise<Array<{id: string, name: string}>>}
 */
async function fetchData() {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: QUERY }),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const body = await response.json();
  return body.data.items; // Array<{id, name}>
}

/**
 * Load items: from cache if available and non-empty, else fetch and cache.
 * Returns empty array on total failure (caller handles error state).
 * @returns {Promise<Array<{id: string, name: string}>>}
 */
async function loadData() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (_) {
    // corrupted cache — fall through to fetch
  }

  try {
    const items = await fetchData();
    if (items && items.length > 0) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(items));
    }
    return items || [];
  } catch (err) {
    console.error('Failed to fetch items:', err);
    return [];
  }
}

/**
 * Clear the item cache from localStorage.
 */
function clearCache() {
  localStorage.removeItem(CACHE_KEY);
}

export { fetchData, loadData, clearCache };
