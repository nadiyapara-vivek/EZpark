import axios from 'axios';

const API = axios.create({
  baseURL: 'https://ezpark-kgjr.onrender.com/api'
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('ezpark_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ezpark_token');
      localStorage.removeItem('ezpark_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const forgotPassword = (data) => API.post('/auth/forgot-password', data);
export const resetPassword = (data) => API.post('/auth/reset-password', data);

// User
export const getProfile = () => API.get('/users/profile');
export const updateProfile = (data) => API.put('/users/profile', data);
export const changePassword = (data) => API.put('/users/change-password', data);

// Slots
export const getAllSlots = (params) => API.get('/slots', { params });
export const getSlot = (id) => API.get(`/slots/${id}`);

// Bookings
export const createBooking = (data) => API.post('/bookings', data);
export const getMyBookings = () => API.get('/bookings/my');
export const getBooking = (id) => API.get(`/bookings/${id}`);
export const cancelBooking = (id) => API.put(`/bookings/${id}/cancel`);
export const deleteBooking = (id) => API.delete(`/bookings/${id}`);   // only cancelled / completed
export const processPayment = (id, data) => API.post(`/bookings/${id}/pay`, data);
export const extendBooking = (id, data) => API.put(`/bookings/${id}/extend`, data);
export const logEntryExit = (id, data) => API.post(`/bookings/${id}/log`, data);
export const validatePromo = (data) => API.post('/bookings/validate-promo', data);

// Admin
export const getAdminStats = () => API.get('/admin/stats');
export const getAdminUsers = () => API.get('/admin/users');
export const deleteAdminUser = (id) => API.delete(`/admin/users/${id}`);
export const getAdminBookings = () => API.get('/admin/bookings');
export const updateAdminBooking = (id, data) => API.put(`/admin/bookings/${id}`, data);
export const seedSlots = () => API.post('/admin/seed-slots');
export const createSlot = (data) => API.post('/slots', data);
export const updateSlot = (id, data) => API.put(`/slots/${id}`, data);
export const deleteSlot = (id) => API.delete(`/slots/${id}`);

// Promos (Admin)
export const getAllPromos = () => API.get('/promos');
export const createPromo = (data) => API.post('/promos', data);
export const updatePromo = (id, data) => API.put(`/promos/${id}`, data);
export const deletePromo = (id) => API.delete(`/promos/${id}`);
export const togglePromo = (id) => API.put(`/promos/${id}/toggle`);

export default API;
