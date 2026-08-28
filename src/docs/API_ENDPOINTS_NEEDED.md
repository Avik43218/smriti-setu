# API Endpoints Needed — Backend Integration Tracker

This document tracks all backend interactions proposed by the Caregiver App.
As stub functions are added to `src/services/`, they must be documented here.

---

## 1. Authentication

### `POST /api/auth/login`
- **Calling Service / Page:** `src/services/authService.js` (`Login.jsx`)
- **Purpose:** Authenticate caregiver credentials and establish session.
- **Request Body:**
  ```json
  {
    "email": "caregiver@example.com",
    "password": "user_password"
  }
  ```
- **Response Shape (200 OK):**
  ```json
  {
    "token": "mock_jwt_token_string",
    "caregiver": {
      "id": "cg_101",
      "name": "Dr. Sarah",
      "email": "caregiver@example.com"
    }
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`: Invalid email or password.
  - `422 Unprocessable Entity`: Validation failure.

### `POST /api/auth/logout`
- **Calling Service / Page:** `src/services/authService.js` (`NavSidebar.jsx` / user profile menu)
- **Purpose:** Invalidate current authentication token / session.
- **Headers:** `Authorization: Bearer <token>`
- **Response Shape (200 OK):**
  ```json
  {
    "message": "Logged out successfully"
  }
  ```
