// Public Portal API Client for Nadoda Rajput Community with Client-Side Caching

import { apiCache } from './cache';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://nadoda-connect-backend.onrender.com/api' : '/api');

async function request(endpoint, options = {}, ttlMs = 10 * 60 * 1000) {
  const isGet = !options.method || options.method.toUpperCase() === 'GET';

  // Check cache for GET requests
  if (isGet && ttlMs > 0) {
    const cached = apiCache.get(endpoint, ttlMs);
    if (cached) {
      return cached;
    }
  }

  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.response = data;
      error.status = response.status;
      throw error;
    }

    // Save to cache for GET requests
    if (isGet && ttlMs > 0 && data?.success) {
      apiCache.set(endpoint, data);
    }

    return data;
  } catch (err) {
    console.error(`[Public API Error] ${options.method || 'GET'} ${url}:`, err.message);
    throw err;
  }
}

// 1. Village API (Public with Caching)
export const villageApi = {
  getAll: () => request('/villages', {}, 15 * 60 * 1000), // 15 mins cache
  getById: (idOrSlug) => request(`/villages/${idOrSlug}`, {}, 15 * 60 * 1000),
  getStats: (idOrSlug) => request(`/villages/${idOrSlug}/stats`, {}, 5 * 60 * 1000), // 5 mins cache
  getAtaks: (idOrSlug) => request(`/villages/${idOrSlug}/ataks`, {}, 10 * 60 * 1000) // 10 mins cache
};

// 2. Family API (Public with Caching)
export const familyApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    const endpoint = `/families${qs ? `?${qs}` : ''}`;
    return request(endpoint, {}, 3 * 60 * 1000); // 3 mins cache
  },
  getById: (id) => request(`/families/${id}`, {}, 5 * 60 * 1000)
};

// 3. Member API (Public with Caching)
export const memberApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    const endpoint = `/members${qs ? `?${qs}` : ''}`;
    return request(endpoint, {}, 3 * 60 * 1000); // 3 mins cache
  },
  getById: (id) => request(`/members/${id}`, {}, 5 * 60 * 1000)
};
