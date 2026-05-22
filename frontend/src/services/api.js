const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const apiRequest = async (path, options = {}) => {
  const { token, body, headers, ...rest } = options;

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  if (response.status === 204) return null;

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new ApiError(payload?.message || 'Request failed', response.status, payload?.details);
  }

  return payload;
};

export const authApi = {
  signup: (body) => apiRequest('/auth/signup', { method: 'POST', body }),
  login: (body) => apiRequest('/auth/login', { method: 'POST', body }),
  guest: () => apiRequest('/auth/guest', { method: 'POST' }),
  me: (token) => apiRequest('/auth/me', { token })
};
