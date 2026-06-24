import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5226/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('luxury_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('luxury_token');
        localStorage.removeItem('luxury_userId');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// AUTH ENDPOINTS
export const authAPI = {
  register: async (data: { fullName: string; email: string; password: string }) => {
    return apiClient.post('/Auth/register', data);
  },

  login: async (data: { email: string; password: string }) => {
    return apiClient.post('/Auth/login', data);
  },

  forgotPassword: async (data: { email: string }) => {
    return apiClient.post('/Auth/forgot-password', data);
  },

  resetPassword: async (data: {
    email: string;
    token: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    return apiClient.post('/Auth/reset-password', data);
  },

  getProfile: async () => {
    return apiClient.get('/Auth/profile');
  },

  updateProfile: async (data: {
    fullName?: string;
    phone?: string;
    avatar?: string;
  }) => {
    return apiClient.put('/Auth/profile', data);
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    return apiClient.post('/Auth/change-password', data);
  },

  logout: async () => {
    return apiClient.post('/Auth/logout');
  },
  
  getAllUsers: async () => {
    return apiClient.get('/Auth/users');
  },

  updateUserRole: async (id: number, role: string) => {
    return apiClient.put(`/Auth/users/${id}/role`, { role });
  },
};

// PRODUCTS ENDPOINTS
export const productsAPI = {
  getAllProducts: async () => {
    return apiClient.get('/Products');
  },

  getProductById: async (id: number) => {
    return apiClient.get(`/Products/${id}`);
  },

  getProductsByCategory: async (categoryId: number) => {
    return apiClient.get(`/Products/category/${categoryId}`);
  },

  createProduct: async (data: any) => {
    return apiClient.post('/Products', data);
  },

  updateProduct: async (id: number, data: any) => {
    return apiClient.put(`/Products/${id}`, data);
  },

  deleteProduct: async (id: number) => {
    return apiClient.delete(`/Products/${id}`);
  },
};

// CATEGORIES ENDPOINTS
export const categoriesAPI = {
  getAllCategories: async () => {
    return apiClient.get('/Categories');
  },

  getCategoryById: async (id: number) => {
    return apiClient.get(`/Categories/${id}`);
  },

  createCategory: async (data: any) => {
    return apiClient.post('/Categories', data);
  },

  updateCategory: async (id: number, data: any) => {
    return apiClient.put(`/Categories/${id}`, data);
  },

  deleteCategory: async (id: number) => {
    return apiClient.delete(`/Categories/${id}`);
  },
};

// ORDERS ENDPOINTS
export const ordersAPI = {
  getAllOrders: async () => {
    return apiClient.get('/Orders');
  },

  getOrderById: async (id: number) => {
    return apiClient.get(`/Orders/${id}`);
  },

  getUserOrders: async () => {
    return apiClient.get('/Orders/my-orders');
  },

  createOrder: async (data: any) => {
    return apiClient.post('/Orders', data);
  },

  updateOrder: async (id: number, data: any) => {
    return apiClient.put(`/Orders/${id}`, data);
  },

  deleteOrder: async (id: number) => {
    return apiClient.delete(`/Orders/${id}`);
  },

  updateOrderStatus: async (id: number, status: string) => {
    return apiClient.put(`/Orders/${id}/status`, { status });
  },
};

// UPLOAD ENDPOINTS
export const uploadAPI = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/Uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default apiClient;
