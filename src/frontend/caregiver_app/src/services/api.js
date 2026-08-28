/**
 * Primary API Gateway for Caregiver App
 * 
 * Routes all API calls through a centralized service structure.
 */

export * from './authService';
import authService from './authService';

export default {
  auth: authService,
};
