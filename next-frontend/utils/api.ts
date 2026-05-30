// API configuration for Express Backend
const API_BASE_URL = 'http://127.0.0.1:5001/api';

interface RequestOptions extends RequestInit {
  body?: any;
}

export const api = {
  async request(endpoint: string, options: RequestOptions = {}) {
    // Get token from localStorage (if any)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    };

    if (options.body && !(options.body instanceof FormData)) {
      config.body = JSON.stringify(options.body);
    } else if (options.body instanceof FormData) {
      // For FormData, let the browser set the content-type (with boundary)
      if (config.headers && (config.headers as any)['Content-Type']) {
        delete (config.headers as any)['Content-Type'];
      }
      config.body = options.body;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

      if (response.status === 401) {
        // Handle unauthorized (optional: redirect to login)
        console.warn('Unauthorized request to Express backend');
      }

      const contentType = response.headers.get('content-type');
      let data = null;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new Error(data?.error || data?.message || `API error: ${response.status}`);
      }

      return data;
    } catch (error: any) {
      if (error.message === 'Failed to fetch') {
        throw new Error(`Cannot connect to Express backend at ${API_BASE_URL}. Ensure the server is running.`);
      }
      throw error;
    }
  },

  async get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  },

  async post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: data,
    });
  },

  async put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data,
    });
  },

  async patch(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data,
    });
  },

  async delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' });
  },
};
