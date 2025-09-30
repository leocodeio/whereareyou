# Agents Specification

## Overview

This document describes the agents (or modules) involved in the Safety Tracker application.  
It defines their responsibilities, inputs, outputs, and interactions.

---

## Agent: LocationTrackerAgent

**Purpose**

- To periodically get device’s GPS coordinates (latitude, longitude)
- To persist these coordinates in the local database

**Inputs**  
| Parameter | Type | Description |
|---|---|---|
| intervalMinutes | integer | How often (in minutes) the agent should sample location |
| permissions | object | Location permissions status (foreground / background) |

**Outputs / Effects**

- Writes records into `location_logs` table with schema `(id, latitude, longitude, timestamp)`
- Emits events or callbacks on success / failure

**Failures / Edge Cases Handling**

- If permission is denied → raise `PermissionDeniedError`
- If GPS not available → raise `LocationUnavailableError`
- If saving to DB fails → raise `DatabaseWriteError`

**Lifecycle / Scheduling**

- Runs in background mode
- Must survive app restarts / OS kills (subject to OS constraints)
- Respects user’s configured interval

---

## Agent: AppUsageAgent

**Purpose**

- To monitor when the app is opened or resumed
- To update the `lastOpenTime`

**Inputs**

- App lifecycle events (e.g. `onAppLaunch`, `onAppResume`)

**Outputs / Effects**

- Updates stored `lastOpenTime` (e.g. in AsyncStorage)

**Edge Cases**

- If storage fails → log error
- If app frozen / killed → next run should resume monitoring

---

## Agent: SOSTriggerAgent

**Purpose**

- To check if user has been inactive (i.e. hasn’t opened the app) for ≥ configured threshold `x` hours
- To trigger SOS message via WhatsApp link (or backend)

**Inputs**  
| Parameter | Type | Description |
|---|---|---|
| thresholdHours | integer | Number of hours of inactivity before triggering SOS |
| lastOpenTime | timestamp | Last app open / resume time |
| sosContacts | list of phone numbers | Recipients for SOS |

**Outputs / Effects**

- If inactivity ≥ threshold → form a WhatsApp deep link URL and open via system (`Linking.openURL`)
- Optionally, invoke backend endpoint for auto send

**Failures / Edge Cases**

- If no contacts configured → no action
- If Linking.openURL fails → catch and log error
- If background task cannot run (due to OS restrictions) → fallback or schedule next run

---

## Agent: SettingsAgent

**Purpose**

- To manage persistent app configuration (interval `y`, threshold `x`, SOS contacts)

**Inputs**

- UI Events (user updates settings)

**Outputs / Effects**

- Persist settings in storage (e.g. AsyncStorage or other persistent store)
- Provide getters for other agents

**Validations / Constraints**

- `intervalMinutes` must be ≥ some minimum (e.g. 1 minute)
- `thresholdHours` must be > 0
- Phone numbers must match a regex / country code format

---

## Inter-Agent Interaction Summary

1. **SettingsAgent** holds the configuration (interval, threshold, contacts).
2. **LocationTrackerAgent** reads the tracking interval from SettingsAgent, periodically gets location, stores it.
3. **AppUsageAgent** updates `lastOpenTime` whenever the app is used.
4. **SOSTriggerAgent** runs periodically (background task) and checks if `(now – lastOpenTime) >= thresholdHours`; if yes, triggers SOS using contacts from SettingsAgent.

---

## Scheduling / Background Execution

- Background scheduling orchestrates **LocationTrackerAgent** and **SOSTriggerAgent**
- The OS (Android / iOS) may limit frequency or kill background tasks — agents must handle rescheduling
- Agents must run with minimal overhead (lightweight, low CPU / memory use)

---

## Errors & Logging

- Standardize error types (e.g. `PermissionDeniedError`, `TimeoutError`, `DatabaseError`)
- Agents should log error with context (agent name, input parameters, error stack)
- Consider a centralized logging / analytics agent (optional)

---

## Future Extensions (optional agents)

- **SyncAgent** — sync stored location logs to a remote server / cloud
- **GeoFenceAgent** — monitor entering / exiting geofenced areas and send alerts
- **LiveTrackingAgent** — share live location with contacts

---

Codebase Structure & Technologies
Project Folder Structure
SafetyTrackerApp/
├── android/ # Android-specific code and configurations
├── ios/ # iOS-specific code and configurations
├── src/
│ ├── assets/ # Static assets like images and fonts
│ ├── components/ # Reusable UI components
│ ├── screens/ # App screens (Home, Logs, Settings)
│ ├── services/ # Business logic and API interactions
│ ├── agents/ # Background agents (Location, SOS)
│ ├── hooks/ # Custom React hooks
│ ├── navigation/ # Navigation setup
│ ├── storage/ # Local storage management (e.g., SQLite)
│ ├── utils/ # Utility functions and constants
│ ├── config/ # Configuration files
│ └── App.tsx # App entry point
├── .env # Environment variables
├── package.json # Project metadata and dependencies
├── tsconfig.json # TypeScript configuration
└── README.md # Project documentation

Technologies & Libraries

Framework: React Native

Language: TypeScript

Navigation: React Navigation

State Management: React Context API / Hooks

Background Tasks: react-native-background-actions

Location Services: react-native-geolocation-service

Permissions: react-native-permissions

Local Storage: SQLite (react-native-sqlite-storage)

WhatsApp Integration: React Native's Linking API

UI Components: React Native Paper / NativeBase

Code Quality: ESLint, Prettier

Do's

Use TypeScript: Leverage TypeScript for type safety and better code maintainability.

Modular Structure: Organize code by features and responsibilities (e.g., agents, services, components).

Handle Permissions Explicitly: Request and manage permissions for location and background tasks.

Optimize Background Tasks: Use react-native-background-actions for efficient background processing.

Validate User Input: Ensure all user inputs (e.g., SOS contacts, time intervals) are validated.

Implement Error Handling: Gracefully handle errors and edge cases, especially for background tasks.

Test on Real Devices: Test background functionality on actual devices to account for OS-specific behaviors.

Document Code: Maintain clear and concise documentation for code and project setup.

❌ Don’ts

Avoid Mixing UI and Logic: Keep UI components separate from business logic and background tasks.

Don’t Overuse Background Tasks: Use background tasks judiciously to conserve battery and resources.

Avoid Hardcoding Sensitive Data: Do not hardcode sensitive information like phone numbers or API keys.

Don’t Ignore Platform Differences: Be aware of and handle platform-specific behaviors and limitations.

Avoid Blocking the Main Thread: Ensure background tasks do not block the main UI thread.

Don’t Skip Testing: Always test background functionalities under various conditions (e.g., app in background, app killed).
