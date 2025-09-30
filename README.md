# Safety Tracker App 📍🛡️

A React Native Expo app that tracks your location periodically and sends SOS alerts via WhatsApp if you haven't used the app for a configurable period.

## Features

- **Location Tracking**: Periodically tracks GPS coordinates and stores them locally
- **SOS Alerts**: Automatically sends WhatsApp messages to emergency contacts if app inactivity exceeds threshold
- **Configurable Settings**: Customize tracking interval and SOS trigger time
- **Local Storage**: Uses SQLite for secure local data storage
- **Background Operation**: Runs location tracking in the background (with OS limitations)

## Architecture

The app follows a modular agent-based architecture:

- **LocationTrackerAgent**: Handles GPS tracking and storage
- **AppUsageAgent**: Monitors app lifecycle events
- **SOSTriggerAgent**: Checks inactivity and triggers SOS
- **SettingsAgent**: Manages app configuration

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router
- **Database**: Expo SQLite
- **Location**: Expo Location
- **UI**: React Native Paper
- **Background Tasks**: Expo Background Fetch

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm start
   ```

3. **Run on device/emulator**
   - For Android: `npm run android`
   - For iOS: `npm run ios`
   - For web: `npm run web`

## Configuration

Settings can be configured through the app:

- **Location Interval**: How often to track location (minutes)
- **SOS Threshold**: Hours of inactivity before triggering SOS
- **Emergency Contacts**: Phone numbers for SOS messages

## Permissions Required

- Location access (foreground and background)
- Storage access for local database

## Limitations

- Background location tracking is limited by mobile OS restrictions
- WhatsApp deep links require WhatsApp to be installed
- App must be kept alive for continuous monitoring

## Development

- Run linting: `npm run lint`
- Reset project: `npm run reset-project`

## License

This project is for educational and safety purposes.
