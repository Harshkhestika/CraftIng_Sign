// API service for backend communication
// Use proxy in development (relative URL) or full URL in production
const getApiBaseUrl = () => {
  // Check if we have an explicit API URL in environment
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In development, use proxy
  if (import.meta.env.DEV) {
    return '/api';
  }
  
  // In production, detect the domain
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  
  // If using the domain, use the same protocol (HTTPS in production)
  if (hostname === 'craftingsign.com' || hostname === 'www.craftingsign.com') {
    return `${protocol}//craftingsign.com/api`;
  }
  
  // If using craftsign.com domain
  if (hostname === 'craftsign.com' || hostname === 'www.craftsign.com') {
    return `${protocol}//craftsign.com/api`;
  }
  
  // If on Netlify (netlify.app domain), use environment variable or proxy
  if (hostname.includes('netlify.app')) {
    // Use environment variable if set, otherwise use proxy
    return import.meta.env.VITE_API_URL || '/api';
  }
  
  // If using IP address (DigitalOcean droplet), use HTTP with port 5000
  if (hostname === '165.22.209.221' || hostname.includes('165.22.209.221')) {
    return 'http://165.22.209.221:5000/api';
  }
  
  // Fallback to localhost for local development
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

// Helper function to get backend base URL (without /api)
const getBackendBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace('/api', '');
  }
  
  if (import.meta.env.DEV) {
    return 'http://localhost:5000';
  }
  
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  if (hostname === 'craftingsign.com' || hostname === 'www.craftingsign.com') {
    return `${protocol}//craftingsign.com`;
  }
  
  if (hostname === 'craftsign.com' || hostname === 'www.craftsign.com') {
    return `${protocol}//craftsign.com`;
  }
  
  if (hostname === '165.22.209.221' || hostname.includes('165.22.209.221')) {
    return 'http://165.22.209.221:5000';
  }
  
  return 'http://localhost:5000';
};

// Helper function to normalize image URLs
export const normalizeImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  
  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a relative path starting with /uploads, convert to full URL
  if (imageUrl.startsWith('/uploads/')) {
    return `${getBackendBaseUrl()}${imageUrl}`;
  }
  
  // Return as is for other cases
  return imageUrl;
};

// Log API URL in development for debugging
if (import.meta.env.DEV) {
  console.log('API Base URL:', API_BASE_URL);
  console.log('Backend Base URL:', getBackendBaseUrl());
}

// Helper function to get auth token
const getToken = () => {
  return localStorage.getItem('auth_token');
};

// Helper function to set auth token
const setToken = (token) => {
  localStorage.setItem('auth_token', token);
};

// Helper function to remove auth token
const removeToken = () => {
  localStorage.removeItem('auth_token');
};

// Generic fetch wrapper
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    // Clone the response so we can safely try json first, then text if json fails
    const clonedResponse = response.clone();

    let data;
    try {
      data = await response.json();
    } catch (e) {
      // If response is not JSON, fall back to text using the cloned response (stream is still readable)
      const text = await clonedResponse.text();
      data = { message: text || 'Request failed' };
    }

    if (!response.ok) {
      // Log all errors for debugging (including 401)
      console.error(`API Error [${response.status}]:`, data.message || 'Request failed', {
        endpoint,
        status: response.status,
        data
      });
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    // Re-throw if it's already our error
    if (error.message && error.message !== 'Request failed') {
      throw error;
    }
    console.error('API Request Error:', error);
    throw error;
  }
};

// Products API
export const productsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/products${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => apiRequest(`/products/${id}`),
  create: async (productData, imageFiles) => {
    const formData = new FormData();
    Object.keys(productData).forEach(key => {
      if (key === 'features' && typeof productData[key] === 'object') {
        formData.append(key, JSON.stringify(productData[key]));
      } else if (key === 'images' && Array.isArray(productData[key])) {
        // Don't append images array if we have files to upload
        if (!imageFiles || imageFiles.length === 0) {
          formData.append(key, JSON.stringify(productData[key]));
        }
      } else if (typeof productData[key] === 'boolean') {
        formData.append(key, productData[key].toString());
      } else if (productData[key] !== null && productData[key] !== undefined && key !== 'image') {
        formData.append(key, productData[key]);
      }
    });
    // Append multiple image files
    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach(file => {
        formData.append('images', file);
      });
    }

    const token = getToken();
    if (!token) {
      throw new Error('You must be logged in to add products. Please log in first.');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type - browser will set it with boundary for FormData
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  update: async (id, productData, imageFiles) => {
    const formData = new FormData();
    Object.keys(productData).forEach(key => {
      if (key === 'features' && typeof productData[key] === 'object') {
        formData.append(key, JSON.stringify(productData[key]));
      } else if (key === 'images' && Array.isArray(productData[key])) {
        // Use 'existingImages' for JSON array to avoid conflict with multer's 'images' field
        if (!imageFiles || imageFiles.length === 0) {
          formData.append('existingImages', JSON.stringify(productData[key]));
        }
      } else if (typeof productData[key] === 'boolean') {
        formData.append(key, productData[key].toString());
      } else if (productData[key] !== null && productData[key] !== undefined && key !== 'image' && key !== 'images') {
        formData.append(key, productData[key]);
      }
    });
    // Append multiple image files - only use 'images' field for actual file uploads
    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach(file => {
        formData.append('images', file);
      });
    }

    const token = getToken();
    if (!token) {
      throw new Error('You must be logged in to update products. Please log in first.');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type - browser will set it with boundary for FormData
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  delete: (id) => apiRequest(`/products/${id}`, { method: 'DELETE' })
};

// Categories API
export const categoriesAPI = {
  getAll: () => apiRequest('/categories'),
  create: (categoryData) => apiRequest('/categories', {
    method: 'POST',
    body: JSON.stringify(categoryData)
  }),
  update: (id, categoryData) => apiRequest(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(categoryData)
  }),
  delete: (id) => apiRequest(`/categories/${id}`, { method: 'DELETE' })
};

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },
  register: async (email, password, name, isAdmin = false) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, isAdmin })
    });
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },
  getMe: () => apiRequest('/auth/me'),
  logout: () => {
    removeToken();
  }
};

// Orders API
export const ordersAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/orders${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => apiRequest(`/orders/${id}`),
  create: (orderData) => apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  }),
  updateStatus: (id, status, paymentStatus) => apiRequest(`/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, paymentStatus })
  })
};

// Customers API
export const customersAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/customers${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => apiRequest(`/customers/${id}`)
};

// Payments API
export const paymentsAPI = {
  createIntent: async (amount, currency = 'usd') => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/payments/create-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({ amount, currency })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create payment intent');
    }
    return data;
  },
  confirmPayment: async (paymentIntentId, orderData) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/payments/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({
        paymentIntentId,
        ...orderData
      })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to confirm payment');
    }
    return data;
  }
};

export { getToken, setToken, removeToken };

