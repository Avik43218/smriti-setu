/**
 * Authentication Service
 * 
 * Provides login, OTP verification, and logout operations for the caregiver app.
 * Currently uses mock implementation with realistic network delay.
 */

// Helper to generate a realistic mock JWT-like token
const createMockJwt = (payload) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) }));
  const signature = 'mock_signature_' + Math.random().toString(36).substring(2);
  return `${header}.${body}.${signature}`;
};

/**
 * Requests a 6-digit one-time passcode (OTP) for the specified caregiver email.
 * 
 * // BACKEND-TODO: see docs/API_ENDPOINTS_NEEDED.md (POST /api/auth/request-otp)
 * 
 * @param {string} email 
 * @returns {Promise<{ success: boolean }>}
 */
export const requestOtp = async (email) => {
  /*
   * === REAL API CALL REPLACEMENT ===
   * When the backend is ready, replace the mock block below with:
   * 
   * const response = await apiClient.post('/api/auth/request-otp', { email });
   * return response.data;
   */

  // --- MOCK IMPLEMENTATION START ---
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!email) {
        reject(new Error('Email is required to request an OTP.'));
        return;
      }
      resolve({ success: true });
    }, 500); // 500ms simulated latency
  });
  // --- MOCK IMPLEMENTATION END ---
};

/**
 * Verifies the 6-digit OTP and completes caregiver authentication.
 * 
 * // BACKEND-TODO: see docs/API_ENDPOINTS_NEEDED.md (POST /api/auth/verify-otp)
 * 
 * @param {string} email 
 * @param {string} otp 
 * @returns {Promise<{ token: string, caregiver: { id: string, name: string, email: string } }>}
 */
export const verifyOtp = async (email, otp) => {
  /*
   * === REAL API CALL REPLACEMENT ===
   * When the backend is ready, replace the mock block below with:
   * 
   * const response = await apiClient.post('/api/auth/verify-otp', { email, otp });
   * return response.data;
   */

  // --- MOCK IMPLEMENTATION START ---
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const cleanOtp = String(otp || '').trim();
      if (!cleanOtp || cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
        reject(new Error('Please enter a valid 6-digit verification code.'));
        return;
      }

      // Generate a caregiver object from email prefix
      const namePrefix = email.split('@')[0];
      const formattedName = namePrefix.charAt(0).toUpperCase() + namePrefix.slice(1);

      const caregiver = {
        id: `cg_${Math.floor(100 + Math.random() * 900)}`,
        name: formattedName,
        email: email.trim().toLowerCase(),
      };

      const token = createMockJwt(caregiver);

      resolve({
        token,
        caregiver,
      });
    }, 500); // 500ms simulated latency
  });
  // --- MOCK IMPLEMENTATION END ---
};

/**
 * Step 1: Validates caregiver credentials and initiates OTP dispatch.
 * 
 * // BACKEND-TODO: see docs/API_ENDPOINTS_NEEDED.md (POST /api/auth/login)
 * 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{ success: boolean, requiresOtp: boolean }>}
 */
export const login = async (email, password) => {
  /*
   * === REAL API CALL REPLACEMENT ===
   * When the backend is ready, replace the mock block below with:
   * 
   * const response = await apiClient.post('/api/auth/login', { email, password });
   * return response.data;
   */

  // --- MOCK IMPLEMENTATION START ---
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Validate credential presence
      if (!email || !password) {
        reject(new Error('Email and password are required.'));
        return;
      }

      resolve({
        success: true,
        requiresOtp: true,
      });
    }, 500); // 500ms simulated latency
  });
  // --- MOCK IMPLEMENTATION END ---
};

/**
 * Logs out the current caregiver session.
 * 
 * // BACKEND-TODO: see docs/API_ENDPOINTS_NEEDED.md (POST /api/auth/logout)
 * 
 * @returns {Promise<{ success: boolean }>}
 */
export const logout = async () => {
  /*
   * === REAL API CALL REPLACEMENT ===
   * When the backend is ready, replace the mock block below with:
   * 
   * await apiClient.post('/api/auth/logout');
   * return { success: true };
   */

  // --- MOCK IMPLEMENTATION START ---
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 200);
  });
  // --- MOCK IMPLEMENTATION END ---
};

export default {
  requestOtp,
  verifyOtp,
  login,
  logout,
};
