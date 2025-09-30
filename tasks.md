# Safety Tracker App Implementation Tasks

This document outlines the detailed tasks and subtasks for implementing the Safety Tracker application end-to-end, based on the specifications in `agents.md`. The tasks are organized into phases for logical progression: Setup, Core Agents Implementation, Integration, UI/UX, Testing, and Deployment. Each task includes subtasks, dependencies, and estimated effort.

## Phase 1: Project Setup and Configuration

### Task 1.1: Initialize React Native Project
- **Description**: Set up a new React Native project with TypeScript support.
- **Subtasks**:
  - Install React Native CLI and create a new project.
  - Configure TypeScript by adding `tsconfig.json`.
  - Set up basic project structure as per `agents.md` (folders: src/components, src/screens, src/services, src/agents, etc.).
  - Add necessary dependencies: React Navigation, React Native Paper, etc.
- **Dependencies**: None
- **Estimated Effort**: 2-3 hours
- **Deliverables**: Basic app structure with package.json updated.

### Task 1.2: Install and Configure Required Libraries
- **Description**: Install and set up libraries for location, permissions, storage, and background tasks.
- **Subtasks**:
  - Install `react-native-geolocation-service` for GPS tracking.
  - Install `react-native-permissions` for handling permissions.
  - Install `react-native-sqlite-storage` for local database.
  - Install `react-native-background-actions` for background tasks.
  - Install `react-native-paper` or `native-base` for UI components.
  - Configure Android and iOS permissions in respective folders.
- **Dependencies**: Task 1.1
- **Estimated Effort**: 3-4 hours
- **Deliverables**: Updated package.json and configured native modules.

### Task 1.3: Set Up Environment and Configuration Files
- **Description**: Create configuration files for app settings and environment variables.
- **Subtasks**:
  - Create `.env` file for sensitive data (e.g., API keys if needed).
  - Set up `src/config/index.ts` for app constants (e.g., default intervals).
  - Configure ESLint and Prettier for code quality.
- **Dependencies**: Task 1.1
- **Estimated Effort**: 1-2 hours
- **Deliverables**: .env, src/config/index.ts, .eslintrc.js, .prettierrc.js.

## Phase 2: Implement Core Agents

### Task 2.1: Implement SettingsAgent
- **Description**: Build the agent to manage persistent app configuration.
- **Subtasks**:
  - Create `src/agents/SettingsAgent.ts` with methods to get/set intervalMinutes, thresholdHours, sosContacts.
  - Implement validation for inputs (e.g., phone number regex, positive integers).
  - Use AsyncStorage or SQLite for persistence.
  - Add getters for other agents to access settings.
  - Handle errors like storage failures.
- **Dependencies**: Task 1.2 (for storage library)
- **Estimated Effort**: 4-5 hours
- **Deliverables**: SettingsAgent class with full CRUD operations.

### Task 2.2: Implement LocationTrackerAgent
- **Description**: Develop the agent for periodic GPS tracking and storage.
- **Subtasks**:
  - Create `src/agents/LocationTrackerAgent.ts`.
  - Integrate with `react-native-geolocation-service` to get coordinates.
  - Set up periodic execution using background tasks (respect interval from SettingsAgent).
  - Create `location_logs` table schema in SQLite.
  - Handle permissions (request if needed) and errors (PermissionDeniedError, LocationUnavailableError).
  - Persist data to DB and emit events on success/failure.
  - Ensure survival across app restarts using background scheduling.
- **Dependencies**: Task 1.2, Task 2.1
- **Estimated Effort**: 5-6 hours
- **Deliverables**: LocationTrackerAgent with background task integration.

### Task 2.3: Implement AppUsageAgent
- **Description**: Monitor app lifecycle events and update lastOpenTime.
- **Subtasks**:
  - Create `src/agents/AppUsageAgent.ts`.
  - Listen to app events (onAppLaunch, onAppResume) using React Native lifecycle hooks.
  - Update `lastOpenTime` in storage (AsyncStorage or DB).
  - Handle edge cases like app kills or storage failures.
- **Dependencies**: Task 1.2
- **Estimated Effort**: 2-3 hours
- **Deliverables**: AppUsageAgent integrated with app lifecycle.

### Task 2.4: Implement SOSTriggerAgent
- **Description**: Check inactivity and trigger SOS via WhatsApp or backend.
- **Subtasks**:
  - Create `src/agents/SOSTriggerAgent.ts`.
  - Run periodic background checks for inactivity (now - lastOpenTime >= thresholdHours).
  - Form WhatsApp deep link URL using sosContacts from SettingsAgent.
  - Use `Linking.openURL` to open WhatsApp.
  - Handle failures (no contacts, linking fails) and OS restrictions.
  - Optionally integrate backend endpoint for auto-send.
- **Dependencies**: Task 2.1, Task 2.3
- **Estimated Effort**: 4-5 hours
- **Deliverables**: SOSTriggerAgent with background scheduling.

## Phase 3: Integration and Services

### Task 3.1: Set Up Storage Layer
- **Description**: Implement local database for location logs and settings.
- **Subtasks**:
  - Create `src/storage/Database.ts` for SQLite setup.
  - Define tables: location_logs (id, latitude, longitude, timestamp), settings (key, value).
  - Implement CRUD operations for logs and settings.
  - Ensure thread-safety for background access.
- **Dependencies**: Task 1.2
- **Estimated Effort**: 3-4 hours
- **Deliverables**: Functional database layer.

### Task 3.2: Integrate Background Task Orchestration
- **Description**: Set up a scheduler for LocationTrackerAgent and SOSTriggerAgent.
- **Subtasks**:
  - Use `react-native-background-actions` to run agents periodically.
  - Handle OS limitations (e.g., Android battery optimization).
  - Reschedule tasks on app restart.
  - Monitor and log background task performance.
- **Dependencies**: Task 2.2, Task 2.4
- **Estimated Effort**: 3-4 hours
- **Deliverables**: Background task manager.

### Task 3.3: Error Handling and Logging
- **Description**: Standardize errors and implement logging across agents.
- **Subtasks**:
  - Define error types (PermissionDeniedError, DatabaseWriteError, etc.).
  - Create `src/utils/Logger.ts` for centralized logging.
  - Integrate logging in all agents.
  - Optionally add analytics.
- **Dependencies**: All Phase 2 tasks
- **Estimated Effort**: 2-3 hours
- **Deliverables**: Error classes and logging system.

## Phase 4: UI/UX Implementation

### Task 4.1: Build Settings Screen
- **Description**: Create UI for configuring interval, threshold, and SOS contacts.
- **Subtasks**:
  - Create `src/screens/SettingsScreen.tsx`.
  - Add form inputs for settings with validation.
  - Integrate with SettingsAgent for persistence.
  - Use React Native Paper for UI components.
- **Dependencies**: Task 2.1
- **Estimated Effort**: 3-4 hours
- **Deliverables**: Functional settings screen.

### Task 4.2: Build Home Screen
- **Description**: Main screen showing app status and quick actions.
- **Subtasks**:
  - Create `src/screens/HomeScreen.tsx`.
  - Display current settings and last location.
  - Add buttons to start/stop tracking.
  - Integrate with agents for real-time updates.
- **Dependencies**: All Phase 2 tasks
- **Estimated Effort**: 3-4 hours
- **Deliverables**: Home screen with agent integration.

### Task 4.3: Build Logs Screen
- **Description**: View stored location logs.
- **Subtasks**:
  - Create `src/screens/LogsScreen.tsx`.
  - Fetch and display location_logs from DB.
  - Add filtering/sorting options.
  - Use list components for performance.
- **Dependencies**: Task 3.1
- **Estimated Effort**: 2-3 hours
- **Deliverables**: Logs viewing screen.

### Task 4.4: Set Up Navigation
- **Description**: Configure app navigation between screens.
- **Subtasks**:
  - Set up React Navigation with stack navigator.
  - Define routes for Home, Settings, Logs.
  - Add bottom tab or drawer navigation.
- **Dependencies**: Task 4.1, 4.2, 4.3
- **Estimated Effort**: 2-3 hours
- **Deliverables**: Navigated app structure.

## Phase 5: Testing and Optimization

### Task 5.1: Unit Testing for Agents
- **Description**: Write tests for each agent.
- **Subtasks**:
  - Set up Jest and React Native Testing Library.
  - Test SettingsAgent CRUD operations.
  - Test LocationTrackerAgent with mocked GPS.
  - Test AppUsageAgent lifecycle events.
  - Test SOSTriggerAgent inactivity logic.
- **Dependencies**: All Phase 2 tasks
- **Estimated Effort**: 4-5 hours
- **Deliverables**: Test suites with >80% coverage.

### Task 5.2: Integration Testing
- **Description**: Test agent interactions and full workflows.
- **Subtasks**:
  - Test background task execution.
  - Test SOS triggering end-to-end.
  - Test on real devices for permissions and battery.
- **Dependencies**: Task 5.1
- **Estimated Effort**: 3-4 hours
- **Deliverables**: Integration test reports.

### Task 5.3: Performance Optimization
- **Description**: Optimize for battery and resources.
- **Subtasks**:
  - Profile background tasks for CPU/memory usage.
  - Implement optimizations (e.g., reduce location frequency).
  - Handle platform differences (iOS/Android).
- **Dependencies**: Task 3.2
- **Estimated Effort**: 2-3 hours
- **Deliverables**: Optimized app performance.

## Phase 6: Deployment and Documentation

### Task 6.1: Build and Release
- **Description**: Prepare for production release.
- **Subtasks**:
  - Build APK/IPA for Android/iOS.
  - Set up CI/CD if needed.
  - Configure app store listings.
- **Dependencies**: All previous tasks
- **Estimated Effort**: 3-4 hours
- **Deliverables**: Release-ready builds.

### Task 6.2: Documentation
- **Description**: Update README and inline docs.
- **Subtasks**:
  - Update README.md with setup instructions.
  - Add JSDoc comments to agents.
  - Document known issues and limitations.
- **Dependencies**: All tasks
- **Estimated Effort**: 2-3 hours
- **Deliverables**: Comprehensive documentation.

## Overall Notes
- **Total Estimated Effort**: 50-70 hours
- **Risks**: Background task limitations on mobile OS; ensure testing on real devices.
- **Milestones**: End of Phase 2 (Core functionality), End of Phase 4 (Full UI), End of Phase 5 (Tested app).
- **Next Steps**: Start with Phase 1, implement sequentially, and iterate based on testing feedback.