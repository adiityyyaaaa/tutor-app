import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// API methods

// Auth
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    registerStudent: (data) => api.post('/auth/register/student', data),
    registerTeacher: (data) => api.post('/auth/register/teacher', data, {
        headers: { 'Content-Type': 'multipart/form-data' } // Important for file uploads
    }),
};

// Teachers
export const teachersAPI = {
    search: (params) => api.get('/teachers/search', { params }),
    getById: (id, params) => api.get(`/teachers/${id}`, { params }),
    updateProfile: (data) => api.put('/teachers/profile', data),
    uploadPhoto: (formData) => {
        return api.post('/teachers/upload-photo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    uploadVideo: (formData) => {
        return api.post('/teachers/upload-video', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
};

// Bookings
export const bookingsAPI = {
    create: (data) => api.post('/bookings', data),
    getAll: () => api.get('/bookings'),
    getById: (id) => api.get(`/bookings/${id}`),
    completeDemo: (id, satisfactory) => api.post(`/bookings/${id}/complete-demo`, { satisfactory }),
    cancel: (id) => api.put(`/bookings/${id}/cancel`),
    verifyPayment: (data) => api.post('/bookings/verify-payment', data),
};

// Progress
export const progressAPI = {
    create: (data) => api.post('/progress', data),
    getByStudent: (studentId, params) => api.get(`/progress/${studentId}`, { params }),
    getByBooking: (bookingId) => api.get(`/progress/booking/${bookingId}`),
    update: (id, data) => api.put(`/progress/${id}`, data),
    delete: (id) => api.delete(`/progress/${id}`),
};

// Reviews
export const reviewsAPI = {
    create: (data) => api.post('/reviews', data),
    getByTeacher: (teacherId, params) => api.get(`/reviews/teacher/${teacherId}`, { params }),
    getByStudent: (studentId) => api.get(`/reviews/student/${studentId}`),
    update: (id, data) => api.put(`/reviews/${id}`, data),
    delete: (id) => api.delete(`/reviews/${id}`),
};

// Messages
export const messagesAPI = {
    send: (data) => api.post('/messages', data),
    getConversation: (userId, params) => api.get(`/messages/${userId}`, { params }),
    getConversations: () => api.get('/messages/conversations/list'),
    markAsRead: (id) => api.put(`/messages/${id}/read`),
    markAllAsRead: (userId) => api.put(`/messages/conversation/${userId}/read-all`),
};

// Notifications
export const notificationsAPI = {
    getAll: () => api.get('/notifications'),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
};

export const analyticsAPI = {
    getTeacherStats: () => api.get('/analytics/teacher-stats'),
};

export default api;
