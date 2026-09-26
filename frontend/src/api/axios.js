import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// App.jsx tarafından çağrılan Clerk Interceptor fonksiyonu
export const setupAxiosInterceptors = (getToken) => {
  api.interceptors.request.use(async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Clerk token alınırken hata oluştu:', error);
    }

    // 🟢 FormData gönderiliyorsa, sabit 'application/json' header'ını kaldır
    // böylece axios/tarayıcı doğru 'multipart/form-data; boundary=...' header'ını
    // kendisi otomatik ayarlayabilsin.
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  });
  return api;
};

export default api;