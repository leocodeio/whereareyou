import * as SQLite from 'expo-sqlite';
import { CONFIG } from '@/config';

export interface Settings {
  locationIntervalMinutes: number;
  inactivityThresholdHours: number;
  sosContacts: string[];
}

export class SettingsAgent {
  private db: SQLite.SQLiteDatabase;

  constructor() {
    this.db = SQLite.openDatabaseSync('safety_tracker.db');
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS ${CONFIG.TABLES.SETTINGS} (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);
  }

  async getSettings(): Promise<Settings> {
    const results = await this.db.getAllAsync(
      `SELECT key, value FROM ${CONFIG.TABLES.SETTINGS}`
    );

    const settings: any = {};
    results.forEach((row: any) => {
      settings[row.key] = row.value;
    });

    return {
      locationIntervalMinutes: parseInt(settings[CONFIG.SETTINGS_KEYS.LOCATION_INTERVAL] || CONFIG.DEFAULT_LOCATION_INTERVAL_MINUTES.toString()),
      inactivityThresholdHours: parseInt(settings[CONFIG.SETTINGS_KEYS.INACTIVITY_THRESHOLD] || CONFIG.DEFAULT_INACTIVITY_THRESHOLD_HOURS.toString()),
      sosContacts: JSON.parse(settings[CONFIG.SETTINGS_KEYS.SOS_CONTACTS] || '[]'),
    };
  }

  async setLocationInterval(minutes: number): Promise<void> {
    if (minutes < 1) {
      throw new Error('Location interval must be at least 1 minute');
    }
    await this.db.runAsync(
      `INSERT OR REPLACE INTO ${CONFIG.TABLES.SETTINGS} (key, value) VALUES (?, ?)`,
      [CONFIG.SETTINGS_KEYS.LOCATION_INTERVAL, minutes.toString()]
    );
  }

  async setInactivityThreshold(hours: number): Promise<void> {
    if (hours <= 0) {
      throw new Error('Inactivity threshold must be greater than 0');
    }
    await this.db.runAsync(
      `INSERT OR REPLACE INTO ${CONFIG.TABLES.SETTINGS} (key, value) VALUES (?, ?)`,
      [CONFIG.SETTINGS_KEYS.INACTIVITY_THRESHOLD, hours.toString()]
    );
  }

  async setSosContacts(contacts: string[]): Promise<void> {
    // Validate phone numbers (basic regex)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    for (const contact of contacts) {
      if (!phoneRegex.test(contact.replace(/\s+/g, ''))) {
        throw new Error(`Invalid phone number: ${contact}`);
      }
    }
    await this.db.runAsync(
      `INSERT OR REPLACE INTO ${CONFIG.TABLES.SETTINGS} (key, value) VALUES (?, ?)`,
      [CONFIG.SETTINGS_KEYS.SOS_CONTACTS, JSON.stringify(contacts)]
    );
  }

  async updateSettings(settings: Partial<Settings>): Promise<void> {
    if (settings.locationIntervalMinutes !== undefined) {
      await this.setLocationInterval(settings.locationIntervalMinutes);
    }
    if (settings.inactivityThresholdHours !== undefined) {
      await this.setInactivityThreshold(settings.inactivityThresholdHours);
    }
    if (settings.sosContacts !== undefined) {
      await this.setSosContacts(settings.sosContacts);
    }
  }
}