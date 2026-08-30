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

### `POST /api/auth/register`
- **Calling Service / Page:** `src/services/authService.js` (`Register.jsx`)
- **Purpose:** Register a new caregiver account and immediately return session token and caregiver profile.
- **Request Body:**
  ```json
  {
    "name": "Dr. Sarah Jenkins",
    "email": "sarah.jenkins@example.com",
    "password": "secure_password_123"
  }
  ```
- **Response Shape (200 OK / 201 Created):**
  ```json
  {
    "token": "mock_jwt_token_string",
    "caregiver": {
      "id": "cg_103",
      "name": "Dr. Sarah Jenkins",
      "email": "sarah.jenkins@example.com"
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Password too short or invalid parameters.
  - `409 Conflict`: Email already registered.
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

---

## 2. Patient Roster & Management

### `GET /api/caregiver/patients`
- **Calling Service / Page:** `src/services/patientService.js` (`Dashboard.jsx`)
- **Purpose:** Fetch list of all patients assigned to the logged-in caregiver.
- **Headers:** `Authorization: Bearer <token>`
- **Response Shape (200 OK):**
  ```json
  [
    {
      "id": "p101",
      "name": "Aarav Sharma",
      "age": 72,
      "diagnosis": "Mild Cognitive Impairment",
      "avatarUrl": null,
      "status": "stable",
      "statusLabel": "Active • Tablet synced",
      "lastCheckIn": "Today, 10:30 AM"
    },
    {
      "id": "p102",
      "name": "Maya Sen",
      "age": 68,
      "diagnosis": "Early Stage Alzheimer's",
      "avatarUrl": null,
      "status": "attention",
      "statusLabel": "Check-in pending",
      "lastCheckIn": "Yesterday, 6:15 PM"
    }
  ]
  ```
- **Error Responses:**
  - `401 Unauthorized`: Missing or invalid session token.

### `GET /api/caregiver/patients/:id`
- **Calling Service / Page:** `src/services/patientService.js` (`PatientDetails.jsx`)
- **Purpose:** Fetch detailed profile, emergency contact, and pairing status for a specific patient.
- **Headers:** `Authorization: Bearer <token>`
- **Response Shape (200 OK):**
  ```json
  {
    "id": "p101",
    "name": "Aarav Sharma",
    "age": 72,
    "gender": "Male",
    "dateOfBirth": "March 14, 1954",
    "healthIssue": "Mild Cognitive Impairment (MCI) • Early-stage memory recall decline • Hypertension",
    "avatarUrl": null,
    "status": "stable",
    "statusLabel": "Active • Tablet synced",
    "lastCheckIn": "Today, 10:30 AM",
    "emergencyContact": {
      "name": "Priya Sharma",
      "relationship": "Daughter (Primary Guardian)",
      "phone": "+91 98765 43210"
    },
    "deviceStatus": {
      "linked": true,
      "deviceName": "Lenovo Tab M10 Plus (Patient Unit 1)",
      "deviceId": "DEV-M10-8842",
      "lastSynced": "Today, 10:30 AM"
    }
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`: Missing or invalid session token.
  - `404 Not Found`: Patient not found or unauthorized access.

