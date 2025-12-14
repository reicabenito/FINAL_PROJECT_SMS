// src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'https://final-project-sms-bgd4.onrender.com/api', 
    headers: {
        'Content-Type': 'application/json'},
});

// **Interceptor:** This runs before every request is sent.
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
        if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
    
}, error => {
    return Promise.reject(error);
});

export default api;