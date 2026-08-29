# ARCHITECTURE.md: AI-Powered Cognitive & Memory Assistance Platform

## 1. System Overview & Offline-First Implementation
The architecture ensures zero wasted resources by strictly adhering to a modular, offline-first client-server model[cite: 4]. 

### Client-Side (Edge) Implementation
* **Framework:** Spin up Flutter or React Native using Riverpod or Redux to aggressively cache state, maintaining a highly efficient cross-platform codebase that never hangs offline[cite: 4].
* **Local Storage:** Wrap mobile SQLite and web/PWA IndexedDB to perfectly replicate a simplified version of the cloud DB schema, instantly saving game sessions, cached regional audio, and performance logs locally[cite: 4].
* **Accessibility UI:** Hardcode UI components with massive ultra-large touch targets (48px+) and enforce high-contrast visuals optimized specifically for low-literacy elderly users[cite: 4].

## 2. Data Flow & Sync Strategy
To minimize cloud computing costs and handle unreliable networks in the North Eastern Region (NER)[cite: 4]:
1. **Interaction & Local Write:** All gameplay and voice interactions are immediately written to SQLite/IndexedDB[cite: 4].
2. **Background Sync Manager:** Drop in a background sync manager (like a worker isolate) that stays sleeping until network connectivity is restored[cite: 4].
3. **Payload Queueing:** Compress local session logs into batched, optimized JSON payload arrays to save major data[cite: 4].
4. **Cloud Push:** Fire REST/GraphQL requests to securely push these payloads to the backend API, relying on timestamp-based logic to resolve conflicts[cite: 4].
5. **Asset Pulling:** Only trigger downloads for massive culturally themed game packages and regional audio assets once the outbound sync clears[cite: 4].

## 3. Backend & Cloud Infrastructure
* **API Gateway:** Deploy Node.js or FastAPI to chew through highly concurrent, asynchronous data streams from edge devices[cite: 4]. 
* **Database:** Hook into MongoDB to store structured patient logs and progress metrics, or utilize Firebase for rapid real-time dashboard updates[cite: 4].
* **Caregiver Portal:** Build a web-based dashboard to visualize daily task completion rates and longitudinal cognitive charts for health workers and families[cite: 4].

## 4. AI Algorithm Implementations (The 3 Pillars)

### Pillar 1: Dynamic Difficulty Adaptation
Replaces static levels with a Multi-Armed Bandit (MAB) engine[cite: 4].
* **Algorithm:** Code a Multi-Armed Bandit utilizing Upper Confidence Bound (UCB) to balance exploring new cognitive challenges versus exploiting known comfortable difficulties[cite: 4].
* **Evaluation Formula:** Crunch the user's Performance Score ($S$) continuously[cite: 4]:
  $$S = (w_1 \times \text{Accuracy}) - (w_2 \times \text{AvgLatency}) - (w_3 \times \text{ErrorRate})$$
* **Adaptation Execution:** If the score drops below a baseline ($S < T_{low}$), grid sizes decrease (e.g., 4x4 to 3x2) and timers extend[cite: 4]. If $S > T_{high}$, distractors are introduced to stimulate neural plasticity[cite: 4].

### Pillar 2: Voice AI & Conversational Interface
* **Speech-to-Text (STT):** Run lightweight edge models like Whisper.cpp or Cloud APIs (Google STT) for Assamese, Bengali, and Manipuri, pinged by a Voice Activity Detector (VAD) to save battery[cite: 4].
* **Natural Language Understanding (NLU):** Utilize a lightweight intent classifier to extract structured entities (e.g., {Task: Medication, Time: 09:00, Status: Complete}) from daily recall sessions[cite: 4].
* **Text-to-Speech (TTS):** Regional-accented TTS generates natural, warm prompts[cite: 4].

### Pillar 3: Predictive Analytics & Anomaly Detection
Processes logs over rolling windows (7-day / 30-day) to flag cognitive drift[cite: 4].
* **Cognitive Drift (Linear Regression):** Map historical performance scores to a regression line, $\hat{y} = \beta_0 + \beta_1 x$, to track memory decline trends[cite: 4]. A negative slope ($\beta_1$) beyond a threshold indicates decline[cite: 4].
* **Anomaly Detection:** Tracks baseline variance[cite: 4]. If daily recall accuracy tanks by >25% or average hesitation spikes significantly, trigger an automated high-priority alert to caregivers[cite: 4].


---


### Authentication

- Unified Role-Based Auth

- The Caregiver (The Admin): They get the actual account creation flow. Think email/password, Google OAuth, or mobile OTP. They hold the keys, view those Pillar 3 analytics dashboards, and manage the backend settings.

- The Patient (The User): Use Device Pairing. The caregiver logs into the patient's tablet once and scans a QR code or taps a magic link to lock that specific device into a simplified "Patient Mode."

- Behind the scenes, it's the exact same authentication pool (like Firebase Auth or Auth0). You just slap a custom claim on their session token (e.g., role: 'caregiver' vs. device_role: 'patient').

- The UX Split: When the app boots up, it reads that role. If it's the caregiver, load up the complex data graphs. If it's the patient, skip all menus and drop them straight into those big 48px+ touch targets and cognitive games!


### Step-by-Step Implementation

1. **Scaffold the Offline-First Edge App**

  - Build the UI with Flutter or React Native using high-contrast themes and oversized 48px+ touch targets.
  - Set up local SQLite schemas to cache sessions, regional audio, and gameplay locally before touching the network.

2. **Build the Background Queue & Sync Engine**

  - Deploy background worker isolates to monitor network status.
  - Compress local session logs into batched JSON payload arrays to push upstream when connectivity is restored.
  
3. **Spin Up Cloud API & Caregiver Portal**

  - Deploy FastAPI to ingest batch streams and store structured longitudinal metrics in MongoDB.
  - Build a caregiver web dashboard showing task completion, trends, and alert logs.
  
4. **Integrate Dynamic Difficulty (Pillar 1)**

  - Implement a Multi-Armed Bandit (UCB) engine adjusting challenge levels dynamically.
  - *Calculate live performance scores*: $$S = (w_1 \times \text{Accuracy}) - (w_2 \times \text{AvgLatency}) - (w_3 \times \text{ErrorRate})$$
  - Auto-scale grid sizes and adjust time limits when $S$ crosses defined thresholds.
  
5. **Deploy Voice AI & Daily Recall Loop (Pillar 2)**

  - Set up battery-friendly Voice Activity Detection (VAD) with local STT (Whisper.cpp) and regional TTS.- Run lightweight intent classification to extract task details and conversational entities.
  
6. **Activate Predictive Analytics & Alerts (Pillar 3)**

  - Use Random Forest Classifier to find correlations and generate analytics.
  - Fire automated alerts to the caregiver portal whenever accuracy drops $>25\%$ or hesitation spikes.


### Games to be Included

1. **Cultural Pattern Matcher (Visual Memory)**

Adaptive tile-matching grids (starting at 3x2 and scaling to 4x4) using regional symbols and crafts to stimulate working memory.

2. **Voice Reminiscence & Daily Recall (Episodic Memory)**

Conversational trivia and daily check-ins where users recount stories or routines using voice input.

3. **Audio-Visual Sound Hunt (Auditory Processing)**

Players match traditional instruments, animal sounds, or regional words with corresponding visual tiles.

4. **Sequential Path Tracker (Executive Function)**

Sequence reproduction game where patterns illuminate with varying time delays and adaptive distractors.


### Tech Stack

1. **Frontend**: Flutter (App), SolidJS
2. **Backend**: FastAPI
3. **Database**: SQLite (caching), MongoDB (metrics/stats)
4. **Authentication**: Firebase
