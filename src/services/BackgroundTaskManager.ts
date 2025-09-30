import { LocationTrackerAgent } from '@/agents/LocationTrackerAgent';
import { SOSTriggerAgent } from '@/agents/SOSTriggerAgent';
import { SettingsAgent } from '@/agents/SettingsAgent';

export class BackgroundTaskManager {
  private locationAgent: LocationTrackerAgent;
  private sosAgent: SOSTriggerAgent;
  private settingsAgent: SettingsAgent;
  private isRunning = false;

  constructor() {
    this.locationAgent = new LocationTrackerAgent();
    this.sosAgent = new SOSTriggerAgent();
    this.settingsAgent = new SettingsAgent();
  }

  async startAllTasks(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    try {
      const settings = await this.settingsAgent.getSettings();

      // Start location tracking
      await this.locationAgent.startTracking(settings.locationIntervalMinutes);

      // Start SOS checking (check every hour)
      this.sosAgent.startPeriodicCheck(60); // Check every 60 minutes

      this.isRunning = true;
      console.log('Background tasks started');
    } catch (error) {
      console.error('Failed to start background tasks:', error);
      throw error;
    }
  }

  stopAllTasks(): void {
    this.locationAgent.stopTracking();
    this.sosAgent.stopPeriodicCheck();
    this.isRunning = false;
    console.log('Background tasks stopped');
  }

  isTasksRunning(): boolean {
    return this.isRunning;
  }

  getLocationAgent(): LocationTrackerAgent {
    return this.locationAgent;
  }

  getSosAgent(): SOSTriggerAgent {
    return this.sosAgent;
  }

  getSettingsAgent(): SettingsAgent {
    return this.settingsAgent;
  }

  // Method to restart tasks with new settings
  async restartTasks(): Promise<void> {
    this.stopAllTasks();
    await this.startAllTasks();
  }
}