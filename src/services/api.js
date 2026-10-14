// Public Portal API Client for Nadoda Rajput Community

const BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://nadoda-connect-backend.onrender.com/api' : '/api');

async function request(endpoint, options = {}) {
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

    return data;
  } catch (err) {
    console.error(`[Public API Error] ${options.method || 'GET'} ${url}:`, err.message);
    throw err;
  }
}

// 1. Village API (Public)
export const villageApi = {
  getAll: () => request('/villages'),
  getById: (idOrSlug) => request(`/villages/${idOrSlug}`),
  getStats: (idOrSlug) => request(`/villages/${idOrSlug}/stats`),
  getAtaks: (idOrSlug) => request(`/villages/${idOrSlug}/ataks`)
};

// 2. Family API (Public)
export const familyApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    return request(`/families${qs ? `?${qs}` : ''}`);
  },
  getById: (id) => request(`/families/${id}`)
};

// 3. Member API (Public)
export const memberApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    return request(`/members${qs ? `?${qs}` : ''}`);
  },
  getById: (id) => request(`/members/${id}`)
};
