import * as SQLite from 'expo-sqlite';
import { CONFIG } from '@/config';

export interface LocationLog {
  id: number;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export class Database {
  private db: SQLite.SQLiteDatabase;

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

      CREATE TABLE IF NOT EXISTS ${CONFIG.TABLES.SETTINGS} (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);
  }

  // Location Logs CRUD
  async insertLocationLog(latitude: number, longitude: number): Promise<number> {
    const result = await this.db.runAsync(
      `INSERT INTO ${CONFIG.TABLES.LOCATION_LOGS} (latitude, longitude) VALUES (?, ?)`,
      [latitude, longitude]
    );
    return result.lastInsertRowId;
  }

  async getLocationLogs(limit: number = 100, offset: number = 0): Promise<LocationLog[]> {
    const results = await this.db.getAllAsync(
      `SELECT * FROM ${CONFIG.TABLES.LOCATION_LOGS} ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return results as LocationLog[];
  }

  async deleteLocationLogs(olderThanDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await this.db.runAsync(
      `DELETE FROM ${CONFIG.TABLES.LOCATION_LOGS} WHERE timestamp < ?`,
      [cutoffDate.toISOString()]
    );
    return result.changes;
  }

  // Settings CRUD
  async setSetting(key: string, value: string): Promise<void> {
    await this.db.runAsync(
      `INSERT OR REPLACE INTO ${CONFIG.TABLES.SETTINGS} (key, value) VALUES (?, ?)`,
      [key, value]
    );
  }

  async getSetting(key: string): Promise<string | null> {
    const result = await this.db.getFirstAsync<{value: string}>(
      `SELECT value FROM ${CONFIG.TABLES.SETTINGS} WHERE key = ?`,
      [key]
    );
    return result ? result.value : null;
  }

  async getAllSettings(): Promise<Record<string, string>> {
    const results = await this.db.getAllAsync<{key: string, value: string}>(
      `SELECT key, value FROM ${CONFIG.TABLES.SETTINGS}`
    );

    const settings: Record<string, string> = {};
    results.forEach((row) => {
      settings[row.key] = row.value;
    });
    return settings;
  }

  async deleteSetting(key: string): Promise<void> {
    await this.db.runAsync(
      `DELETE FROM ${CONFIG.TABLES.SETTINGS} WHERE key = ?`,
      [key]
    );
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    await this.db.execAsync(`
      DELETE FROM ${CONFIG.TABLES.LOCATION_LOGS};
      DELETE FROM ${CONFIG.TABLES.SETTINGS};
    `);
  }

  async getDatabaseStats(): Promise<{
    locationLogsCount: number;
    settingsCount: number;
  }> {
    const locationResult = await this.db.getFirstAsync<{count: number}>(
      `SELECT COUNT(*) as count FROM ${CONFIG.TABLES.LOCATION_LOGS}`
    );
    const settingsResult = await this.db.getFirstAsync<{count: number}>(
      `SELECT COUNT(*) as count FROM ${CONFIG.TABLES.SETTINGS}`
    );

    return {
      locationLogsCount: locationResult?.count || 0,
      settingsCount: settingsResult?.count || 0,
    };
  }
}