import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

// Request: gắn Authorization nếu có token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response: chuẩn hóa lỗi và xử lý 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Token hết hạn/không hợp lệ → xóa lưu trữ và chuyển hướng login nếu cần
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      return Promise.reject({
        status: error.response.status,
        data: error.response.data,
        message: error.response.data?.message || 'Request error',
      });
    }
    return Promise.reject({ message: 'Network error' });
  }
);

export default api;
