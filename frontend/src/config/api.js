export const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL ||
  (import.meta.env?.MODE === 'development'
    ? 'http://localhost:5000'
    : 'https://crm-tool-q2qp.onrender.com');

export const API_PREFIX = `${API_BASE_URL}/api`;
export const UPLOADS_BASE_URL = `${API_BASE_URL}/uploads`;
