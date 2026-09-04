/**
 * Core HTTP Client API Wrapper
 * 
 * Separated to eliminate circular dependencies between api.js gateway and individual service modules.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token') || localStorage.getItem('caregiver_auth_token'); 

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || 'Backend error');
    }
    
    return await response.json();
  } catch (error) {
    console.warn("API Call Notice (Mock Fallback):", error.message);
    throw error;
  }
};

export default apiClient;
