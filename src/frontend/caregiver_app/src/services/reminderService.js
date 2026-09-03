/**
 * Reminder Service
 * 
 * Manages Health & Wellness reminders (Medication, Hydration, Meals, Custom) per patient.
 * Currently uses mock implementation with realistic network delay.
 */

// Initial mock dataset for patient reminders, keyed by patientId
const MOCK_REMINDERS = {
  p1: {
    medication: [
      { id: 'med_1', label: 'Morning Dose', time: '8:00 AM' },
      { id: 'med_2', label: 'Evening Pills', time: '8:00 PM' },
    ],
    hydration: {
      id: 'hyd_1',
      label: 'Hourly Water Intake',
      schedule: '8 AM – 8 PM',
      status: 'Active',
    },
    meals: [
      { id: 'meal_1', label: 'Breakfast', time: '8:30 AM' },
      { id: 'meal_2', label: 'Lunch', time: '1:00 PM' },
      { id: 'meal_3', label: 'Dinner', time: '7:30 PM' },
    ],
    custom: [
      { id: 'cust_1', label: 'Evening Walk & Stretch', time: '5:00 PM', frequency: 'Daily' },
    ],
  },
  p2: {
    medication: [
      { id: 'med_201', label: 'BP Medicine', time: '9:00 AM' },
    ],
    hydration: {
      id: 'hyd_201',
      label: 'Regular Hydration',
      schedule: '9 AM – 7 PM',
      status: 'Active',
    },
    meals: [
      { id: 'meal_201', label: 'Breakfast', time: '9:00 AM' },
      { id: 'meal_202', label: 'Lunch', time: '1:30 PM' },
      { id: 'meal_203', label: 'Dinner', time: '8:00 PM' },
    ],
    custom: [],
  },
};

// In-memory store initialized with mock data
let remindersStore = JSON.parse(JSON.stringify(MOCK_REMINDERS));

/**
 * Fetches all Health & Wellness reminders for a specific patient.
 * 
 * // BACKEND-TODO: see docs/API_ENDPOINTS_NEEDED.md (GET /api/patients/:patientId/reminders)
 * 
 * @param {string} patientId 
 * @returns {Promise<{ medication: Array, hydration: Object, meals: Array, custom: Array }>}
 */
export const fetchReminders = async (patientId = 'p1') => {
  /*
   * === REAL API CALL REPLACEMENT ===
   * When the backend is ready, replace the mock block below with:
   * 
   * const response = await apiClient.get(`/api/patients/${patientId}/reminders`);
   * return response.data;
   */

  // --- MOCK IMPLEMENTATION START ---
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!remindersStore[patientId]) {
        // Initialize default structure if patientId has no data yet
        remindersStore[patientId] = {
          medication: [{ id: `med_${Date.now()}`, label: 'Morning Dose', time: '8:00 AM' }],
          hydration: { id: `hyd_${Date.now()}`, label: 'Hourly Water Intake', schedule: '8 AM – 8 PM', status: 'Active' },
          meals: [
            { id: `meal_1_${Date.now()}`, label: 'Breakfast', time: '8:30 AM' },
            { id: `meal_2_${Date.now()}`, label: 'Lunch', time: '1:00 PM' },
            { id: `meal_3_${Date.now()}`, label: 'Dinner', time: '7:30 PM' },
          ],
          custom: [],
        };
      }
      resolve(JSON.parse(JSON.stringify(remindersStore[patientId])));
    }, 400); // 400ms simulated latency
  });
  // --- MOCK IMPLEMENTATION END ---
};

/**
 * Updates existing labels/times for a fixed category (medication, hydration, or meals).
 * Does NOT allow adding or deleting entries in these fixed categories.
 * 
 * // BACKEND-TODO: see docs/API_ENDPOINTS_NEEDED.md (PUT /api/patients/:patientId/reminders/:category)
 * 
 * @param {string} patientId 
 * @param {'medication' | 'hydration' | 'meals'} category 
 * @param {Array|Object} updatedData 
 * @returns {Promise<{ success: boolean, data: any }>}
 */
export const updateCategoryReminders = async (patientId = 'p1', category, updatedData) => {
  /*
   * === REAL API CALL REPLACEMENT ===
   * When the backend is ready, replace the mock block below with:
   * 
   * const response = await apiClient.put(`/api/patients/${patientId}/reminders/${category}`, updatedData);
   * return response.data;
   */

  // --- MOCK IMPLEMENTATION START ---
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!remindersStore[patientId]) {
        reject(new Error(`Patient ${patientId} not found.`));
        return;
      }
      if (!['medication', 'hydration', 'meals'].includes(category)) {
        reject(new Error(`Invalid reminder category: ${category}`));
        return;
      }

      remindersStore[patientId][category] = updatedData;
      resolve({ success: true, data: remindersStore[patientId][category] });
    }, 400);
  });
  // --- MOCK IMPLEMENTATION END ---
};

/**
 * Adds a new custom reminder for a patient.
 * 
 * // BACKEND-TODO: see docs/API_ENDPOINTS_NEEDED.md (POST /api/patients/:patientId/reminders/custom)
 * 
 * @param {Object} reminderData
 * @param {string} reminderData.patientId
 * @param {string} reminderData.label
 * @param {string} reminderData.time
 * @param {string} reminderData.frequency
 * @returns {Promise<{ id: string, label: string, time: string, frequency: string }>}
 */
export const addCustomReminder = async ({ patientId = 'p1', label, time, frequency = 'Daily' }) => {
  /*
   * === REAL API CALL REPLACEMENT ===
   * When the backend is ready, replace the mock block below with:
   * 
   * const response = await apiClient.post(`/api/patients/${patientId}/reminders/custom`, { label, time, frequency });
   * return response.data;
   */

  // --- MOCK IMPLEMENTATION START ---
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!label || !label.trim()) {
        reject(new Error('Reminder label is required.'));
        return;
      }
      if (!time || !time.trim()) {
        reject(new Error('Reminder time is required.'));
        return;
      }

      if (!remindersStore[patientId]) {
        remindersStore[patientId] = { medication: [], hydration: {}, meals: [], custom: [] };
      }

      const newCustomItem = {
        id: `cust_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        label: label.trim(),
        time: time.trim(),
        frequency: frequency || 'Daily',
      };

      remindersStore[patientId].custom.push(newCustomItem);
      resolve(newCustomItem);
    }, 500);
  });
  // --- MOCK IMPLEMENTATION END ---
};

export default {
  fetchReminders,
  updateCategoryReminders,
  addCustomReminder,
};
