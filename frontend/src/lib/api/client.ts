import axios from 'axios';

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors here
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Request was made but no response
      console.error('Network Error:', error.request);
    } else {
      // Something else went wrong
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Export common API functions
export const api = {
  get: <T>(url: string, params?: any) => apiClient.get<T>(url, { params }).then((res) => res.data),
  post: <T>(url: string, data: any) => apiClient.post<T>(url, data).then((res) => res.data),
  put: <T>(url: string, data: any) => apiClient.put<T>(url, data).then((res) => res.data),
  delete: <T>(url: string) => apiClient.delete<T>(url).then((res) => res.data),
}; 