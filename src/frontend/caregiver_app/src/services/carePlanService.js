/**
 * Care Plan Service
 * 
 * Provides memory gallery family member operations and care plan customization.
 * Currently uses mock implementation with realistic network delay.
 */

// Initial mock dataset for family memories
const MOCK_FAMILY_MEMBERS = [
  {
    id: 'fam_1',
    patientId: 'p1',
    name: 'Zara Begum',
    relation: 'Granddaughter',
    // Clean SVG data URI avatar for guaranteed offline rendering
    photoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23E4D9C4"/><circle cx="200" cy="120" r="55" fill="%23B5562F"/><path d="M100 250 C100 185, 300 185, 300 250 Z" fill="%23B5562F"/><text x="200" y="280" font-family="sans-serif" font-size="18" font-weight="bold" fill="%232E2A24" text-anchor="middle">Zara</text></svg>',
  },
  {
    id: 'fam_2',
    patientId: 'p1',
    name: 'Tariq Rahman',
    relation: 'Son',
    photoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23FBF5EA"/><circle cx="200" cy="120" r="55" fill="%236E8C6A"/><path d="M100 250 C100 185, 300 185, 300 250 Z" fill="%236E8C6A"/><text x="200" y="280" font-family="sans-serif" font-size="18" font-weight="bold" fill="%232E2A24" text-anchor="middle">Tariq</text></svg>',
  },
  {
    id: 'fam_3',
    patientId: 'p1',
    name: 'Farida Begum',
    relation: 'Daughter',
    photoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23FFFDF8"/><circle cx="200" cy="120" r="55" fill="%23C9962C"/><path d="M100 250 C100 185, 300 185, 300 250 Z" fill="%23C9962C"/><text x="200" y="280" font-family="sans-serif" font-size="18" font-weight="bold" fill="%232E2A24" text-anchor="middle">Farida</text></svg>',
  },
];

let familyMembersStore = [...MOCK_FAMILY_MEMBERS];

/**
 * Fetches family member photo memory cards for a patient.
 * 
 * // BACKEND-TODO: see docs/API_ENDPOINTS_NEEDED.md (GET /api/patients/:patientId/family-members)
 * 
 * @param {string} patientId 
 * @returns {Promise<Array<{ id: string, name: string, relation: string, photoUrl: string, patientId: string }>>}
 */
export const fetchFamilyMembers = async (patientId = 'p1') => {
  /*
   * === REAL API CALL REPLACEMENT ===
   * When the backend is ready, replace the mock block below with:
   * 
   * const response = await apiClient.get(`/api/patients/${patientId}/family-members`);
   * return response.data;
   */

  // --- MOCK IMPLEMENTATION START ---
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = familyMembersStore.filter((m) => m.patientId === patientId);
      resolve([...filtered]);
    }, 400);
  });
  // --- MOCK IMPLEMENTATION END ---
};

/**
 * Adds a new family member memory card for a patient.
 * All fields (patientId, name, relation, photoUrl) are strictly required.
 * 
 * // BACKEND-TODO: see docs/API_ENDPOINTS_NEEDED.md (POST /api/patients/:patientId/family-members)
 * 
 * @param {Object} memberData
 * @param {string} memberData.patientId
 * @param {string} memberData.name
 * @param {string} memberData.relation
 * @param {string} memberData.photoUrl
 * @returns {Promise<{ id: string, name: string, relation: string, photoUrl: string, patientId: string }>}
 */
export const addFamilyMember = async ({ patientId, name, relation, photoUrl }) => {
  /*
   * === REAL API CALL REPLACEMENT ===
   * When the backend is ready, replace the mock block below with:
   * 
   * const response = await apiClient.post(`/api/patients/${patientId}/family-members`, { name, relation, photoUrl });
   * return response.data;
   */

  // --- MOCK IMPLEMENTATION START ---
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!patientId || !patientId.trim()) {
        reject(new Error('Patient ID is required.'));
        return;
      }
      if (!name || !name.trim()) {
        reject(new Error('Family member name is required.'));
        return;
      }
      if (!relation || !relation.trim()) {
        reject(new Error('Relation is required.'));
        return;
      }
      if (!photoUrl || !photoUrl.trim()) {
        reject(new Error('Photo URL/upload is required. Every memory card must include a photo.'));
        return;
      }

      const newMember = {
        id: `fam_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        patientId: patientId.trim(),
        name: name.trim(),
        relation: relation.trim(),
        photoUrl: photoUrl.trim(),
      };

      familyMembersStore.push(newMember);
      resolve(newMember);
    }, 500);
  });
  // --- MOCK IMPLEMENTATION END ---
};

/**
 * Saves overall care plan changes.
 * 
 * // BACKEND-TODO: see docs/API_ENDPOINTS_NEEDED.md (PUT /api/patients/:patientId/care-plan)
 * 
 * @param {string} patientId 
 * @param {Object} planData 
 * @returns {Promise<{ success: boolean, updatedAt: string }>}
 */
export const saveCarePlan = async (patientId = 'p1', planData = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        updatedAt: new Date().toISOString(),
      });
    }, 400);
  });
};

export default {
  fetchFamilyMembers,
  addFamilyMember,
  saveCarePlan,
};
