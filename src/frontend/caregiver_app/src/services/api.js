/**
 * Primary API Gateway for Caregiver App
 * 
 * Routes all API calls through a centralized service structure.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token'); 

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
      throw new Error(errorData.detail || 'Backend threw a fit!');
    }
    
    return await response.json();
  } catch (error) {
    console.error("API Fetch Error:", error);
    throw error;
  }
};