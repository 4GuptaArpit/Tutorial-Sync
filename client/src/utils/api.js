const BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Handle HTTP response and normalize error formats.
 * @param {Response} response - Fetch API Response
 * @returns {Promise<any>}
 */
const handleResponse = async (response) => {
  if (response.status === 401) {
    // Session expired or unauthorized: Clear local auth context and dispatch event
    window.dispatchEvent(new CustomEvent('auth-expired'));
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || 'Session expired. Please log in again.');
  }

  const contentType = response.headers.get('content-type');
  
  // Return raw text if downloading files (e.g. Markdown exports)
  if (contentType && contentType.includes('text/markdown')) {
    return response.text();
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong');
    error.errors = data.errors || [];
    error.status = response.status;
    throw error;
  }

  return data;
};

/**
 * Centralized API Client wrapping Fetch API.
 * Forces credentials for httpOnly cookies.
 */
export const api = {
  async get(endpoint) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      credentials: 'include'
    });
    return handleResponse(response);
  },

  async post(endpoint, body) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(body)
    });
    return handleResponse(response);
  },

  async put(endpoint, body) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(body)
    });
    return handleResponse(response);
  },

  async delete(endpoint) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json'
      },
      credentials: 'include'
    });
    return handleResponse(response);
  }
};
