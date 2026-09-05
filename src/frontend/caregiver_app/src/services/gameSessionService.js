/**
 * Game Session & Analytics Service
 *
 * Provides game session history and cognitive domain trend metrics.
 * Follows schema and parameters defined in docs/GAMES_ANALYTICS_README.md.
 */

import apiClient from './apiClient';

/**
 * Domain & Game Type Metadata definitions
 */
export const DOMAINS = {
  MEMORY: 'memory',
  LANGUAGE: 'language',
  ATTENTION: 'attention',
};

export const GAME_TYPES = {
  PAIR_MATCHING: 'pair_matching',
  WORD_ASSOCIATION: 'word_association',
  VISUAL_SEARCH: 'visual_search',
};

export const DOMAIN_CONFIG = {
  memory: {
    key: 'memory',
    label: 'Episodic Memory',
    gameType: 'pair_matching',
    gameLabel: 'Pair Matching',
    color: '#B5562F', // Terracotta
    bgLight: 'bg-terracotta/10',
    borderLight: 'border-terracotta/30',
    textLight: 'text-terracotta',
    description: 'Visual memory retention, card pair recall & face-name recognition',
    targetParam: 'Correct Match Rate & Latency',
  },
  language: {
    key: 'language',
    label: 'Language & Semantic',
    gameType: 'word_association',
    gameLabel: 'Word Association',
    color: '#6E8C6A', // Sage
    bgLight: 'bg-sage/10',
    borderLight: 'border-sage/30',
    textLight: 'text-sage',
    description: 'Vocabulary retrieval speed, category naming & verbal fluency',
    targetParam: 'Words Recalled & Fluency Latency',
  },
  attention: {
    key: 'attention',
    label: 'Attention & Processing',
    gameType: 'visual_search',
    gameLabel: 'Visual Search',
    color: '#C9962C', // Gold
    bgLight: 'bg-gold/10',
    borderLight: 'border-gold/30',
    textLight: 'text-gold',
    description: 'Target detection speed, reaction consistency & distractor resistance',
    targetParam: 'Reaction Time & Variability',
  },
};

/**
 * Deterministic helper to generate realistic mock sessions for a patient over the last 30 days
 */
const generateMockSessionsForPatient = (patientId) => {
  const sessions = [];
  const now = new Date();

  // Helper to format ISO date N days ago
  const getDateDaysAgo = (daysAgo, hourOffset = 10, minuteOffset = 30) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hourOffset, minuteOffset, 0, 0);
    return d.toISOString();
  };

  // Domain 1: Memory (Pair Matching) - 7 sessions with realistic gentle progression
  const memoryScores = [0.72, 0.75, 0.74, 0.79, 0.81, 0.78, 0.85, 0.88];
  const memoryDaysAgo = [28, 24, 20, 16, 12, 8, 4, 1];

  memoryScores.forEach((score, idx) => {
    const daysAgo = memoryDaysAgo[idx];
    const duration = Math.round(110 + (1 - score) * 90);
    sessions.push({
      session_id: `sess_mem_${patientId}_${idx + 1}`,
      patient_profile_id: patientId,
      game_type: GAME_TYPES.PAIR_MATCHING,
      domain: DOMAINS.MEMORY,
      session_date: getDateDaysAgo(daysAgo, 10 + (idx % 3), 15 + (idx * 5) % 40),
      session_duration: duration,
      status: 'completed',
      difficulty_level: idx < 3 ? 1 : idx < 6 ? 2 : 3,
      score_normalized: parseFloat(score.toFixed(2)),
      // Game-specific fields (per GAMES_ANALYTICS_README.md)
      correct_match_rate: parseFloat((score + 0.04).toFixed(2)),
      total_flips: Math.round(14 + (1 - score) * 16),
      time_to_first_correct_match: parseFloat((5.4 - score * 2).toFixed(1)),
      repeat_error_rate: parseFloat((0.2 - score * 0.15).toFixed(2)),
      completion_time: duration,
      pairs_count: idx < 3 ? 4 : idx < 6 ? 6 : 8,
      used_face_name_variant: idx % 2 === 0,
      raw_trials: [],
    });
  });

  // Domain 2: Language (Word Association) - 7 sessions
  const languageScores = [0.78, 0.81, 0.80, 0.83, 0.82, 0.86, 0.89];
  const languageDaysAgo = [27, 22, 18, 14, 10, 6, 2];
  const prompts = [
    'Kitchen Items',
    'Local Vegetables & Fruits',
    'Family & Relatives',
    'Morning Household Activities',
    'Northeast River Animals',
    'Traditional Foods',
    'Everyday Objects',
  ];

  languageScores.forEach((score, idx) => {
    const daysAgo = languageDaysAgo[idx];
    sessions.push({
      session_id: `sess_lang_${patientId}_${idx + 1}`,
      patient_profile_id: patientId,
      game_type: GAME_TYPES.WORD_ASSOCIATION,
      domain: DOMAINS.LANGUAGE,
      session_date: getDateDaysAgo(daysAgo, 14 + (idx % 2), 20 + (idx * 7) % 35),
      session_duration: 60,
      status: 'completed',
      difficulty_level: idx < 4 ? 1 : 2,
      score_normalized: parseFloat(score.toFixed(2)),
      // Game-specific fields
      words_recalled_count: Math.round(7 + score * 8),
      response_latency_per_word: [2.1, 2.8, 3.4, 4.1, 5.0],
      category_switch_errors: score > 0.8 ? 0 : 1,
      language_used: 'assamese',
      category_prompt: prompts[idx % prompts.length],
      round_duration: 60,
      raw_trials: [],
    });
  });

  // Domain 3: Attention (Visual Search) - 7 sessions
  const attentionScores = [0.68, 0.71, 0.70, 0.76, 0.75, 0.81, 0.84];
  const attentionDaysAgo = [29, 25, 21, 15, 11, 7, 3];

  attentionScores.forEach((score, idx) => {
    const daysAgo = attentionDaysAgo[idx];
    const duration = Math.round(75 + (1 - score) * 45);
    const isAbandoned = idx === 2 && patientId === 'p102'; // Add an abandoned session for variety if p102

    sessions.push({
      session_id: `sess_att_${patientId}_${idx + 1}`,
      patient_profile_id: patientId,
      game_type: GAME_TYPES.VISUAL_SEARCH,
      domain: DOMAINS.ATTENTION,
      session_date: getDateDaysAgo(daysAgo, 16 + (idx % 3), 10 + (idx * 6) % 45),
      session_duration: isAbandoned ? 35 : duration,
      status: isAbandoned ? 'abandoned' : 'completed',
      difficulty_level: idx < 3 ? 1 : idx < 6 ? 2 : 3,
      score_normalized: parseFloat((isAbandoned ? score * 0.7 : score).toFixed(2)),
      // Game-specific fields
      reaction_time_avg: Math.round(720 - score * 260),
      reaction_time_variability: Math.round(140 - score * 65),
      omission_rate: parseFloat((0.18 - score * 0.14).toFixed(2)),
      false_positive_rate: parseFloat((0.12 - score * 0.09).toFixed(2)),
      within_session_drift: parseFloat((0.08 - score * 0.06).toFixed(2)),
      trial_count: 20,
      raw_trials: [],
    });
  });

  // Sort all sessions chronologically ascending
  return sessions.sort(
    (a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime()
  );
};

/**
 * Fetches all game sessions for a given patient.
 *
 * // BACKEND-TODO: see docs/API_ENDPOINTS_NEEDED.md (GET /api/patients/:patientId/game-sessions)
 *
 * @param {string} patientId
 * @returns {Promise<Array>}
 */
export const getGameSessions = async (patientId) => {
  /*
   * === REAL API CALL REPLACEMENT ===
   * When backend is ready:
   * const response = await apiClient.get(`/api/patients/${patientId}/game-sessions`);
   * return response.data;
   */

  return new Promise((resolve) => {
    setTimeout(() => {
      const data = generateMockSessionsForPatient(patientId || 'p101');
      resolve(data);
    }, 350); // Simulated network latency
  });
};

/**
 * Formats date to concise user-friendly display (e.g. "Aug 24" or "24 Aug, 10:30 AM")
 */
export const formatSessionDate = (isoString, includeTime = false) => {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;

  const options = {
    month: 'short',
    day: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  };

  return date.toLocaleDateString(undefined, options);
};

/**
 * Formats duration in seconds to "Xm Ys"
 */
export const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
};

export default {
  DOMAINS,
  GAME_TYPES,
  DOMAIN_CONFIG,
  getGameSessions,
  formatSessionDate,
  formatDuration,
};
