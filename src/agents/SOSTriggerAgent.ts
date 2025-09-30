import { Linking } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { CONFIG } from '@/config';

export class SOSTriggerAgent {
  private db: SQLite.SQLiteDatabase;
  private checkInterval?: number;
  private isChecking = false;

  constructor() {
    this.db = SQLite.openDatabaseSync('safety_tracker.db');
  }

  private async getSettings() {
    const results = await this.db.getAllAsync<{key: string, value: string}>(
      `SELECT key, value FROM ${CONFIG.TABLES.SETTINGS}`
    );

    const settings: Record<string, string> = {};
    results.forEach((row) => {
      settings[row.key] = row.value;
    });

    return {
      thresholdHours: parseInt(settings[CONFIG.SETTINGS_KEYS.INACTIVITY_THRESHOLD] || CONFIG.DEFAULT_INACTIVITY_THRESHOLD_HOURS.toString()),
      sosContacts: JSON.parse(settings[CONFIG.SETTINGS_KEYS.SOS_CONTACTS] || '[]'),
      lastOpenTime: settings[CONFIG.SETTINGS_KEYS.LAST_OPEN_TIME] ? new Date(settings[CONFIG.SETTINGS_KEYS.LAST_OPEN_TIME]) : null,
    };
  }

  private createWhatsAppUrl(message: string, phoneNumber: string): string {
    // WhatsApp deep link format: https://wa.me/phonenumber?text=message
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phoneNumber.replace(/\s+/g, '')}?text=${encodedMessage}`;
  }

  async checkAndTriggerSOS(): Promise<void> {
    try {
      const { thresholdHours, sosContacts, lastOpenTime } = await this.getSettings();

      if (!lastOpenTime || sosContacts.length === 0) {
        return; // No last open time or no contacts configured
      }

      const now = new Date();
      const hoursSinceLastOpen = (now.getTime() - lastOpenTime.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastOpen >= thresholdHours) {
        const message = `SOS Alert: I haven't opened the Safety Tracker app for ${Math.floor(hoursSinceLastOpen)} hours. Please check on me! Location tracking is active.`;

        for (const contact of sosContacts) {
          try {
            const url = this.createWhatsAppUrl(message, contact);
            await Linking.openURL(url);
            // Small delay between messages
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error) {
            console.error(`Failed to send SOS to ${contact}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('SOS check failed:', error);
    }
  }

  startPeriodicCheck(intervalMinutes: number = 60): void {
    if (this.isChecking) {
      this.stopPeriodicCheck();
    }

    this.isChecking = true;
    const intervalMs = intervalMinutes * 60 * 1000;

    // Initial check
    this.checkAndTriggerSOS();

    // Set up periodic checks
    this.checkInterval = setInterval(() => {
      this.checkAndTriggerSOS();
    }, intervalMs);
  }

  stopPeriodicCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = undefined;
    }
    this.isChecking = false;
  }

  isCurrentlyChecking(): boolean {
    return this.isChecking;
  }
}