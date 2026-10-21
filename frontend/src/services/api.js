const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const getToken = () => localStorage.getItem('careerai_token');
export const setToken = (token) => {
  if (token) {
    localStorage.setItem('careerai_token', token);
  } else {
    localStorage.removeItem('careerai_token');
  }
};

async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    ...options.headers,
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Handle JSON vs FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const url = `${BASE_URL}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    // Check if token expired / unauthorized
    if (res.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
      setToken(null);
      // Dispatch storage event so AuthContext knows session ended
      window.dispatchEvent(new Event('careerai_auth_expired'));
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const error = new Error(data.error || `HTTP error ${res.status}`);
      error.status = res.status;
      error.code = data.code || 'UNKNOWN_ERROR';
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      const netError = new Error('Network connection failed. Please ensure the backend server is running.');
      netError.code = 'NETWORK_ERROR';
      throw netError;
    }
    throw err;
  }
}

export const api = {
  // Authentication
  auth: {
    register: (payload) => apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
    login: (credentials) => apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
    logout: () => apiRequest('/api/auth/logout', { method: 'POST' }),
    getMe: () => apiRequest('/api/auth/me'),
    deleteAccount: () => apiRequest('/api/auth/account', { method: 'DELETE' }),
  },

  // Resume Upload & Analysis
  resume: {
    analyze: (formData) => apiRequest('/api/resume/analyze', {
      method: 'POST',
      body: formData,
    }),
  },

  // Analysis History & Details
  analyses: {
    list: (params = {}) => {
      const searchParams = new URLSearchParams(params);
      return apiRequest(`/api/analyses?${searchParams.toString()}`);
    },
    get: (id) => apiRequest(`/api/analyses/${id}`),
    delete: (id) => apiRequest(`/api/analyses/${id}`, { method: 'DELETE' }),
    getDownloadUrl: (id) => `${BASE_URL}/api/analyses/${id}/download`,
    downloadBlob: async (id) => {
      const token = getToken();
      const res = await fetch(`${BASE_URL}/api/analyses/${id}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Download failed');
      return await res.blob();
    }
  },

  // Jobs & Recommendations
  jobs: {
    list: (params = {}) => {
      const searchParams = new URLSearchParams(params);
      return apiRequest(`/api/jobs?${searchParams.toString()}`);
    },
    getRecommendations: (params = {}) => {
      const searchParams = new URLSearchParams(params);
      return apiRequest(`/api/jobs/recommendations?${searchParams.toString()}`);
    },
  },

  // Health
  health: () => apiRequest('/api/health'),
};
