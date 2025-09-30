import * as SQLite from 'expo-sqlite';
import { CONFIG } from '@/config';

export class AppUsageAgent {
  private db: SQLite.SQLiteDatabase;

  constructor() {
    this.db = SQLite.openDatabaseSync('safety_tracker.db');
  }

  private async initializeDatabase(): Promise<void> {
    // Settings table is already created in SettingsAgent
    // But ensure it exists
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS ${CONFIG.TABLES.SETTINGS} (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);
  }

  async updateLastOpenTime(): Promise<void> {
    try {
      const now = new Date().toISOString();
      await this.db.runAsync(
        `INSERT OR REPLACE INTO ${CONFIG.TABLES.SETTINGS} (key, value) VALUES (?, ?)`,
        [CONFIG.SETTINGS_KEYS.LAST_OPEN_TIME, now]
      );
    } catch (error) {
      console.error('Failed to update last open time:', error);
      // Log error but don't throw - app should continue
    }
  }

  async getLastOpenTime(): Promise<Date | null> {
    try {
      const result = await this.db.getFirstAsync<{value: string}>(
        `SELECT value FROM ${CONFIG.TABLES.SETTINGS} WHERE key = ?`,
        [CONFIG.SETTINGS_KEYS.LAST_OPEN_TIME]
      );
      return result ? new Date(result.value) : null;
    } catch (error) {
      console.error('Failed to get last open time:', error);
      return null;
    }
  }
}