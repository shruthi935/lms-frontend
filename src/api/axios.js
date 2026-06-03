// frontend/src/api/axios.js
import axios from 'axios';

const API = axios.create({
    baseURL: 'https://lms-backend-l0kr.onrender.com/api/',
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default API;