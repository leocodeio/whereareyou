import * as Location from 'expo-location';
import * as SQLite from 'expo-sqlite';
import { CONFIG } from '@/config';
import { logger } from '@/utils/Logger';

export class PermissionDeniedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermissionDeniedError';
  }
}

export class LocationUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LocationUnavailableError';
  }
}

export class DatabaseWriteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseWriteError';
  }
}

export class LocationTrackerAgent {
  private db: SQLite.SQLiteDatabase;
  private intervalId?: number;
  private isTracking = false;

  constructor() {
    this.db = SQLite.openDatabaseSync('safety_tracker.db');
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS ${CONFIG.TABLES.LOCATION_LOGS} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  async requestPermissions(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new PermissionDeniedError(CONFIG.ERRORS.PERMISSION_DENIED);
    }

    // For background permissions (limited in Expo)
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    return backgroundStatus === 'granted';
  }

  async getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    try {
      logger.debug('LocationTrackerAgent', 'Requesting current location');

      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        logger.error('LocationTrackerAgent', 'Location permission denied', new PermissionDeniedError(CONFIG.ERRORS.PERMISSION_DENIED));
        throw new PermissionDeniedError(CONFIG.ERRORS.PERMISSION_DENIED);
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      if (!location) {
        logger.error('LocationTrackerAgent', 'Location unavailable', new LocationUnavailableError(CONFIG.ERRORS.LOCATION_UNAVAILABLE));
        throw new LocationUnavailableError(CONFIG.ERRORS.LOCATION_UNAVAILABLE);
      }

      logger.info('LocationTrackerAgent', 'Location obtained', {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      logger.error('LocationTrackerAgent', 'Failed to get current location', error as Error);
      throw error;
    }
  }

  async saveLocation(latitude: number, longitude: number): Promise<void> {
    try {
      logger.debug('LocationTrackerAgent', 'Saving location to database', { latitude, longitude });

      await this.db.runAsync(
        `INSERT INTO ${CONFIG.TABLES.LOCATION_LOGS} (latitude, longitude) VALUES (?, ?)`,
        [latitude, longitude]
      );

      logger.info('LocationTrackerAgent', 'Location saved successfully');
    } catch (error) {
      logger.error('LocationTrackerAgent', 'Failed to save location', error as Error, { latitude, longitude });
      throw new DatabaseWriteError(CONFIG.ERRORS.DATABASE_ERROR);
    }
  }

  async startTracking(intervalMinutes: number): Promise<void> {
    if (this.isTracking) {
      this.stopTracking();
    }

    await this.requestPermissions();

    this.isTracking = true;
    const intervalMs = intervalMinutes * 60 * 1000;

    // Initial location
    try {
      const location = await this.getCurrentLocation();
      await this.saveLocation(location.latitude, location.longitude);
    } catch (error) {
      console.error('Initial location error:', error);
    }

    // Set up periodic tracking
    this.intervalId = setInterval(async () => {
      try {
        const location = await this.getCurrentLocation();
        await this.saveLocation(location.latitude, location.longitude);
      } catch (error) {
        console.error('Location tracking error:', error);
      }
    }, intervalMs);
  }

  stopTracking(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.isTracking = false;
  }

  isCurrentlyTracking(): boolean {
    return this.isTracking;
  }
}