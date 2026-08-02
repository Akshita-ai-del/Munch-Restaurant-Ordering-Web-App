import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Attach token on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('munch_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    const sessionId = localStorage.getItem('munch_session');
    if (sessionId) config.headers['x-session-id'] = sessionId;
  }
  return config;
});

// Global error handling
// NOTE: Do NOT auto-redirect on /auth/me 401 — AuthContext handles that itself.
// Auto-redirect only for authenticated API calls that return 401 (expired / invalid token).
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const url = err.config?.url || '';
      const isAuthCheck = url.includes('/auth/me');
      if (!isAuthCheck && typeof window !== 'undefined') {
        localStorage.removeItem('munch_token');
        window.location.replace('/login');
      }
    }
    return Promise.reject(err);
  }
);

export default api;

// Helpers
export const menuApi = {
  getAll: (params) => api.get('/menu', { params }),
  getById: (id) => api.get(`/menu/${id}`),
  getCategories: () => api.get('/menu/categories'),
};

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

export const cartApi = {
  get: () => api.get('/cart'),
  addItem: (data) => api.post('/cart/items', data),
  updateItem: (itemId, data) => api.put(`/cart/items/${itemId}`, data),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}`),
  clear: () => api.delete('/cart'),
};

export const orderApi = {
  place: (data) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  reorder: (id) => api.post(`/orders/${id}/reorder`),
};

export const chatApi = {
  get: (orderId) => api.get(`/chat/${orderId}`),
  send: (orderId, content) => api.post(`/chat/${orderId}/messages`, { content }),
};

export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (data) => api.post('/users/addresses', data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
  getFavourites: () => api.get('/users/favourites'),
  addFavourite: (menuItemId) => api.post('/users/favourites', { menuItemId }),
  removeFavourite: (menuItemId) => api.delete(`/users/favourites/${menuItemId}`),
};

export const walletApi = {
  get: () => api.get('/wallet'),
  topup: (amount) => api.post('/wallet/topup', { amount }),
};

export const promoApi = {
  validate: (code, orderTotal) => api.post('/promo/validate', { code, orderTotal }),
};

export const adminApi = {
  // All orders for staff/admin view
  getAllOrders: (params) => api.get('/orders/all', { params }),
};

