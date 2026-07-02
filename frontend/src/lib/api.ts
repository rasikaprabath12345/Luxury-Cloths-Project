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

  googleLogin: async (data: { email: string; fullName: string; avatar?: string; googleId?: string }) => {
    return apiClient.post('/Auth/google-login', data);
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

  deleteUser: async (id: number) => {
    return apiClient.delete(`/Auth/users/${id}`);
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

  getProductBySlug: async (slug: string) => {
    return apiClient.get(`/Products/slug/${slug}`);
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

  uploadOrderSlip: async (id: number, paymentSlipUrl: string) => {
    return apiClient.put(`/Orders/${id}/slip`, { paymentSlipUrl });
  },
};

// UPLOAD ENDPOINTS
export const uploadAPI = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = typeof window !== 'undefined' ? localStorage.getItem('luxury_token') : null;
    return axios.post(`${API_BASE_URL}/Uploads/image`, formData, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  },
};

// STOCK ENDPOINTS
export const stockAPI = {
  getAllStock: async () => {
    return apiClient.get('/Stock');
  },

  getProductStock: async (productId: number) => {
    return apiClient.get(`/Stock/${productId}`);
  },

  getLowStock: async () => {
    return apiClient.get('/Stock/low-stock');
  },

  adjustStock: async (variantId: number, data: { adjustment: number; reason?: string }) => {
    return apiClient.put(`/Stock/${variantId}/adjust`, data);
  },

  getStockMovements: async (variantId: number) => {
    return apiClient.get(`/Stock/movements/${variantId}`);
  },

  getStockSummary: async () => {
    return apiClient.get('/Stock/summary');
  },
};

// SETTINGS ENDPOINTS
export const settingsAPI = {
  getSettings: async () => {
    return apiClient.get('/Settings');
  },

  updateSettings: async (data: { heroImage: string }) => {
    return apiClient.post('/Settings', data);
  },
};

export default apiClient;

