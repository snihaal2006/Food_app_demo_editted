import axios from 'axios';

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

const api = axios.create({ baseURL: API_BASE });

// Auto-attach JWT from localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('mexitoes_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ─── Auth ───────────────────────────────────────────────────────────────────
export const authAPI = {
    sendOtp: (data) => api.post('/auth/send-otp', data),
    verifyOtp: (data) => api.post('/auth/verify-otp', data),
};

// ─── Menu ───────────────────────────────────────────────────────────────────
export const menuAPI = {
    getAll: (params) => api.get('/menu', { params }),
    getCategories: () => api.get('/menu/categories'),
    getById: (id) => api.get(`/menu/${id}`),
};

// ─── Cart ───────────────────────────────────────────────────────────────────
export const cartAPI = {
    getCart: () => api.get('/cart'),
    addItem: (menu_item_id, quantity) => api.post('/cart', { menu_item_id, quantity }),
    removeItem: (menu_item_id) => api.delete(`/cart/${menu_item_id}`),
    clearCart: () => api.delete('/cart'),
};

// ─── Orders ─────────────────────────────────────────────────────────────────
export const ordersAPI = {
    placeOrder: () => api.post('/orders'),
    getHistory: () => api.get('/orders'),
    getById: (id) => api.get(`/orders/${id}`),
};

// ─── Profile ─────────────────────────────────────────────────────────────────
export const profileAPI = {
    get: () => api.get('/profile'),
    update: (data) => api.put('/profile', data),
};

export default api;
