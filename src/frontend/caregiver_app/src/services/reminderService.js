/**
 * Reminder & Compliance Service
 * 
 * Manages Health & Wellness reminders and daily patient compliance tracking.
 * Acts as the canonical single source of truth for patient reminder status ('normal' vs 'reminder_missed').
 */

// Initial mock dataset for patient reminders, keyed by patientId
const MOCK_REMINDERS = {
  p101: {
    medication: [
      { id: 'med_101_1', label: 'Morning Dose', time: '8:00 AM', active: true },
      { id: 'med_101_2', label: 'Evening Pills', time: '8:00 PM', active: true },
    ],
    hydration: {
      id: 'hyd_101_1',
      label: 'Hourly Water Intake',
      schedule: '8 AM – 8 PM',
      status: 'Active',
      active: true,
    },
    meals: [
      { id: 'meal_101_1', label: 'Breakfast', time: '8:30 AM', active: true },
      { id: 'meal_101_2', label: 'Lunch', time: '1:00 PM', active: true },
      { id: 'meal_101_3', label: 'Dinner', time: '7:30 PM', active: true },
    ],
    custom: [
      { id: 'cust_101_1', label: 'Evening Walk & Stretch', time: '5:00 PM', frequency: 'Daily', active: true },
    ],
  },
  p102: {
    medication: [
      { id: 'med_102_1', label: 'BP Medicine', time: '9:00 AM', active: true },
      { id: 'med_102_2', label: 'Night Calcium', time: '9:00 PM', active: true },
    ],
    hydration: {
      id: 'hyd_102_1',
      label: 'Regular Hydration',
      schedule: '9 AM – 7 PM',
      status: 'Active',
      active: true,
    },
    meals: [
      { id: 'meal_102_1', label: 'Breakfast', time: '9:00 AM', active: true },
      { id: 'meal_102_2', label: 'Lunch', time: '1:30 PM', active: true },
      { id: 'meal_102_3', label: 'Dinner', time: '8:00 PM', active: true },
    ],
    custom: [],
  },
  p1: {
    medication: [
      { id: 'med_1', label: 'Morning Dose', time: '8:00 AM', active: true },
      { id: 'med_2', label: 'Evening Pills', time: '8:00 PM', active: true },
    ],
    hydration: {
      id: 'hyd_1',
      label: 'Hourly Water Intake',
      schedule: '8 AM – 8 PM',
      status: 'Active',
      active: true,
    },
    meals: [
      { id: 'meal_1', label: 'Breakfast', time: '8:30 AM', active: true },
      { id: 'meal_2', label: 'Lunch', time: '1:00 PM', active: true },
      { id: 'meal_3', label: 'Dinner', time: '7:30 PM', active: true },
    ],
    custom: [
      { id: 'cust_1', label: 'Evening Walk & Stretch', time: '5:00 PM', frequency: 'Daily', active: true },
    ],
  },
  p2: {
    medication: [
      { id: 'med_201', label: 'BP Medicine', time: '9:00 AM', active: true },
    ],
    hydration: {
      id: 'hyd_201',
      label: 'Regular Hydration',
      schedule: '9 AM – 7 PM',
      status: 'Active',
      active: true,
    },
    meals: [
      { id: 'meal_201', label: 'Breakfast', time: '9:00 AM', active: true },
      { id: 'meal_202', label: 'Lunch', time: '1:30 PM', active: true },
      { id: 'meal_203', label: 'Dinner', time: '8:00 PM', active: true },
    ],
    custom: [],
  },
};

// Initial Mock Daily Compliance Store (Status per reminder: 'completed' | 'missed' | 'pending')
const MOCK_COMPLIANCE = {
  p101: {
    today: {
      med_101_1: 'completed',
      meal_101_1: 'completed',
      hyd_101_1: 'completed',
      meal_101_2: 'completed',
      cust_101_1: 'pending',
      meal_101_3: 'pending',
      med_101_2: 'pending',
    },
    pastDays: [
      { dayOffset: 5, dateLabel: 'Mon', completed: 6, total: 6, missed: 0 },
      { dayOffset: 4, dateLabel: 'Tue', completed: 6, total: 6, missed: 0 },
      { dayOffset: 3, dateLabel: 'Wed', completed: 5, total: 6, missed: 1 },
      { dayOffset: 2, dateLabel: 'Thu', completed: 6, total: 6, missed: 0 },
      { dayOffset: 1, dateLabel: 'Fri', completed: 6, total: 6, missed: 0 },
    ],
  },
  p102: {
    today: {
      med_102_1: 'missed', // Missed BP Medicine drives the amber status for p102
      meal_102_1: 'completed',
      hyd_102_1: 'completed',
      meal_102_2: 'completed',
      meal_102_3: 'pending',
      med_102_2: 'pending',
    },
    pastDays: [
      { dayOffset: 5, dateLabel: 'Mon', completed: 5, total: 5, missed: 0 },
      { dayOffset: 4, dateLabel: 'Tue', completed: 4, total: 5, missed: 1 },
      { dayOffset: 3, dateLabel: 'Wed', completed: 5, total: 5, missed: 0 },
      { dayOffset: 2, dateLabel: 'Thu', completed: 5, total: 5, missed: 0 },
      { dayOffset: 1, dateLabel: 'Fri', completed: 4, total: 5, missed: 1 },
    ],
  },
};

// In-memory store initialized with mock data
let remindersStore = JSON.parse(JSON.stringify(MOCK_REMINDERS));
let complianceStore = JSON.parse(JSON.stringify(MOCK_COMPLIANCE));

/**
 * Normalizes alias patient IDs (p1 -> p101, p2 -> p102)
 */
const normalizePatientId = (patientId) => {
  if (patientId === 'p1') return 'p101';
  if (patientId === 'p2') return 'p102';
  return patientId || 'p101';
};

/**
 * Helper to get or initialize reminders for a patient
 */
const getPatientRemindersRaw = (patientId) => {
  const normId = normalizePatientId(patientId);
  if (!remindersStore[normId]) {
    remindersStore[normId] = {
      medication: [{ id: `med_${normId}_1`, label: 'Morning Dose', time: '8:00 AM', active: true }],
      hydration: { id: `hyd_${normId}_1`, label: 'Hourly Water Intake', schedule: '8 AM – 8 PM', status: 'Active', active: true },
      meals: [
        { id: `meal_${normId}_1`, label: 'Breakfast', time: '8:30 AM', active: true },
        { id: `meal_${normId}_2`, label: 'Lunch', time: '1:00 PM', active: true },
        { id: `meal_${normId}_3`, label: 'Dinner', time: '7:30 PM', active: true },
      ],
      custom: [],
    };
  }
  return remindersStore[normId];
};

/**
 * Helper to get or initialize compliance status for a patient
 */
const getPatientComplianceRaw = (patientId) => {
  const normId = normalizePatientId(patientId);
  if (!complianceStore[normId]) {
    complianceStore[normId] = {
      today: {},
      pastDays: [
        { dayOffset: 5, dateLabel: 'Mon', completed: 5, total: 5, missed: 0 },
        { dayOffset: 4, dateLabel: 'Tue', completed: 5, total: 5, missed: 0 },
        { dayOffset: 3, dateLabel: 'Wed', completed: 5, total: 5, missed: 0 },
        { dayOffset: 2, dateLabel: 'Thu', completed: 5, total: 5, missed: 0 },
        { dayOffset: 1, dateLabel: 'Fri', completed: 5, total: 5, missed: 0 },
      ],
    };
  }
  return complianceStore[normId];
};

/**
 * Fetches all Health & Wellness reminders for a specific patient.
 * 
 * // BACKEND-TODO: see docs/API_ENDPOINTS_NEEDED.md (GET /api/patients/:patientId/reminders)
 * 
 * @param {string} patientId 
 * @returns {Promise<{ medication: Array, hydration: Object, meals: Array, custom: Array }>}
 */
export const fetchReminders = async (patientId = 'p101') => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = getPatientRemindersRaw(patientId);
      resolve(JSON.parse(JSON.stringify(data)));
    }, 250);
  });
};

/**
 * Updates existing labels/times for a fixed category (medication, hydration, or meals).
 * 
 * // BACKEND-TODO: see docs/API_ENDPOINTS_NEEDED.md (PUT /api/patients/:patientId/reminders/:category)
 * 
 * @param {string} patientId 
 * @param {'medication' | 'hydration' | 'meals'} category 
 * @param {Array|Object} updatedData 
 * @returns {Promise<{ success: boolean, data: any }>}
 */
export const updateCategoryReminders = async (patientId = 'p101', category, updatedData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const normId = normalizePatientId(patientId);
      const patientReminders = getPatientRemindersRaw(normId);

      if (!['medication', 'hydration', 'meals'].includes(category)) {
        reject(new Error(`Invalid reminder category: ${category}`));
        return;
      }

      patientReminders[category] = updatedData;
      resolve({ success: true, data: patientReminders[category] });
    }, 300);
  });
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
export const addCustomReminder = async ({ patientId = 'p101', label, time, frequency = 'Daily' }) => {
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

      const normId = normalizePatientId(patientId);
      const patientReminders = getPatientRemindersRaw(normId);

      const newCustomItem = {
        id: `cust_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        label: label.trim(),
        time: time.trim(),
        frequency: frequency || 'Daily',
        active: true,
      };

      if (!Array.isArray(patientReminders.custom)) {
        patientReminders.custom = [];
      }
      patientReminders.custom.push(newCustomItem);
      resolve(newCustomItem);
    }, 350);
  });
};

/**
 * Computes live compliance summary for a patient for today.
 * Synchronously derived to serve as canonical source of truth for patientService.
 *
 * @param {string} patientId
 * @returns {{
 *   hasMissedToday: boolean,
 *   careStatus: 'normal' | 'reminder_missed',
 *   completedCount: number,
 *   missedCount: number,
 *   pendingCount: number,
 *   totalCount: number,
 *   summaryText: string,
 *   completionRate: number
 * }}
 */
export const getTodayComplianceSummary = (patientId = 'p101') => {
  const normId = normalizePatientId(patientId);
  const reminders = getPatientRemindersRaw(normId);
  const compliance = getPatientComplianceRaw(normId);

  // Flatten all active reminders
  const allItems = [];
  if (Array.isArray(reminders.medication)) {
    reminders.medication.forEach((m) => allItems.push({ id: m.id, label: m.label, type: 'medication' }));
  }
  if (reminders.hydration && reminders.hydration.label) {
    allItems.push({ id: reminders.hydration.id, label: reminders.hydration.label, type: 'hydration' });
  }
  if (Array.isArray(reminders.meals)) {
    reminders.meals.forEach((m) => allItems.push({ id: m.id, label: m.label, type: 'meals' }));
  }
  if (Array.isArray(reminders.custom)) {
    reminders.custom.forEach((c) => allItems.push({ id: c.id, label: c.label, type: 'custom' }));
  }

  let completedCount = 0;
  let missedCount = 0;
  let pendingCount = 0;

  allItems.forEach((item) => {
    const status = compliance.today[item.id] || 'pending';
    if (status === 'completed') completedCount += 1;
    else if (status === 'missed') missedCount += 1;
    else pendingCount += 1;
  });

  const totalCount = allItems.length;
  const hasMissedToday = missedCount > 0;
  const careStatus = hasMissedToday ? 'reminder_missed' : 'normal';
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;

  return {
    hasMissedToday,
    careStatus,
    completedCount,
    missedCount,
    pendingCount,
    totalCount,
    summaryText: `${completedCount} of ${totalCount} completed today`,
    completionRate,
  };
};

/**
 * Fetches detailed compliance items for today and the 5-day history for the Care Plan page.
 *
 * @param {string} patientId
 * @returns {Promise<{
 *   summary: Object,
 *   todayItems: Array<{ id: string, label: string, time: string, category: string, status: 'completed'|'missed'|'pending' }>,
 *   pastDays: Array<{ dateLabel: string, completed: number, total: number, missed: number, rate: number }>
 * }>}
 */
export const getPatientComplianceDetails = async (patientId = 'p101') => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const normId = normalizePatientId(patientId);
      const reminders = getPatientRemindersRaw(normId);
      const compliance = getPatientComplianceRaw(normId);
      const summary = getTodayComplianceSummary(normId);

      // Build today items list
      const todayItems = [];

      if (Array.isArray(reminders.medication)) {
        reminders.medication.forEach((med) => {
          todayItems.push({
            id: med.id,
            label: med.label,
            time: med.time,
            category: 'Medication',
            categoryKey: 'medication',
            status: compliance.today[med.id] || 'pending',
          });
        });
      }

      if (reminders.hydration && reminders.hydration.label) {
        todayItems.push({
          id: reminders.hydration.id,
          label: reminders.hydration.label,
          time: reminders.hydration.schedule || '8 AM – 8 PM',
          category: 'Hydration',
          categoryKey: 'hydration',
          status: compliance.today[reminders.hydration.id] || 'pending',
        });
      }

      if (Array.isArray(reminders.meals)) {
        reminders.meals.forEach((meal) => {
          todayItems.push({
            id: meal.id,
            label: meal.label,
            time: meal.time,
            category: 'Meal',
            categoryKey: 'meals',
            status: compliance.today[meal.id] || 'pending',
          });
        });
      }

      if (Array.isArray(reminders.custom)) {
        reminders.custom.forEach((cust) => {
          todayItems.push({
            id: cust.id,
            label: cust.label,
            time: cust.time,
            category: 'Custom Routine',
            categoryKey: 'custom',
            status: compliance.today[cust.id] || 'pending',
          });
        });
      }

      const pastDaysWithRate = (compliance.pastDays || []).map((day) => ({
        ...day,
        rate: day.total > 0 ? Math.round((day.completed / day.total) * 100) : 100,
      }));

      resolve({
        summary,
        todayItems,
        pastDays: pastDaysWithRate,
      });
    }, 300);
  });
};

/**
 * Updates or toggles a reminder status for today (useful for simulation / testing)
 *
 * @param {string} patientId
 * @param {string} reminderId
 * @param {'completed' | 'missed' | 'pending'} newStatus
 */
export const setReminderComplianceStatus = async (patientId, reminderId, newStatus) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const normId = normalizePatientId(patientId);
      const compliance = getPatientComplianceRaw(normId);
      compliance.today[reminderId] = newStatus;
      resolve(getTodayComplianceSummary(normId));
    }, 200);
  });
};

export default {
  fetchReminders,
  updateCategoryReminders,
  addCustomReminder,
  getTodayComplianceSummary,
  getPatientComplianceDetails,
  setReminderComplianceStatus,
};
