import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Text, Card, Button, Switch, ActivityIndicator } from 'react-native-paper';
import { BackgroundTaskManager } from '@/services/BackgroundTaskManager';
import { AppUsageAgent } from '@/agents/AppUsageAgent';
import { Database, LocationLog } from '@/storage/Database';
import { logger } from '@/utils/Logger';

export default function HomeScreen() {
  const [isTracking, setIsTracking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastLocation, setLastLocation] = useState<LocationLog | null>(null);
  const [settings, setSettings] = useState({
    locationIntervalMinutes: 15,
    inactivityThresholdHours: 24,
    sosContacts: [] as string[],
  });

  const taskManager = new BackgroundTaskManager();
  const appUsageAgent = new AppUsageAgent();
  const database = new Database();

  useEffect(() => {
    initializeApp();
    updateLastOpenTime();
  }, []);

  const initializeApp = async () => {
    try {
      const currentSettings = await taskManager.getSettingsAgent().getSettings();
      setSettings(currentSettings);

      const logs = await database.getLocationLogs(1);
      if (logs.length > 0) {
        setLastLocation(logs[0]);
      }

      setIsTracking(taskManager.isTasksRunning());
    } catch (error) {
      logger.error('HomeScreen', 'Failed to initialize app', error as Error);
    } finally {
      setLoading(false);
    }
  };

  const updateLastOpenTime = async () => {
    await appUsageAgent.updateLastOpenTime();
  };

  const toggleTracking = async () => {
    try {
      if (isTracking) {
        taskManager.stopAllTasks();
        setIsTracking(false);
        logger.info('HomeScreen', 'Tracking stopped');
      } else {
        await taskManager.startAllTasks();
        setIsTracking(true);
        logger.info('HomeScreen', 'Tracking started');

        // Refresh last location after starting
        setTimeout(async () => {
          const logs = await database.getLocationLogs(1);
          if (logs.length > 0) {
            setLastLocation(logs[0]);
          }
        }, 2000);
      }
    } catch (error) {
      logger.error('HomeScreen', 'Failed to toggle tracking', error as Error);
      Alert.alert('Error', 'Failed to toggle tracking. Please check permissions.');
    }
  };

  const refreshLocation = async () => {
    try {
      const locationAgent = taskManager.getLocationAgent();
      const location = await locationAgent.getCurrentLocation();
      await locationAgent.saveLocation(location.latitude, location.longitude);

      const logs = await database.getLocationLogs(1);
      if (logs.length > 0) {
        setLastLocation(logs[0]);
      }

      logger.info('HomeScreen', 'Location refreshed', location);
    } catch (error) {
      logger.error('HomeScreen', 'Failed to refresh location', error as Error);
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Safety Tracker Status" />
        <Card.Content>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Tracking Active:</Text>
            <Switch value={isTracking} onValueChange={toggleTracking} />
          </View>

          <Button
            mode="contained"
            onPress={toggleTracking}
            style={styles.toggleButton}
            disabled={loading}
          >
            {isTracking ? 'Stop Tracking' : 'Start Tracking'}
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Current Settings" />
        <Card.Content>
          <Text>Interval: {settings.locationIntervalMinutes} minutes</Text>
          <Text>SOS Threshold: {settings.inactivityThresholdHours} hours</Text>
          <Text>SOS Contacts: {settings.sosContacts.length}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Last Location" />
        <Card.Content>
          {lastLocation ? (
            <View>
              <Text>Latitude: {lastLocation.latitude.toFixed(6)}</Text>
              <Text>Longitude: {lastLocation.longitude.toFixed(6)}</Text>
              <Text>Time: {new Date(lastLocation.timestamp).toLocaleString()}</Text>
              <Button onPress={refreshLocation} mode="outlined" style={styles.refreshButton}>
                Refresh Location
              </Button>
            </View>
          ) : (
            <Text>No location data available</Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Quick Actions" />
        <Card.Content>
          <Button
            mode="outlined"
            onPress={() => {
              // Navigate to settings - will implement with navigation
              Alert.alert('Info', 'Settings screen will be available in navigation');
            }}
            style={styles.actionButton}
          >
            Open Settings
          </Button>
          <Button
            mode="outlined"
            onPress={() => {
              // Navigate to logs
              Alert.alert('Info', 'Logs screen will be available in navigation');
            }}
            style={styles.actionButton}
          >
            View Location Logs
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  card: {
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleButton: {
    marginTop: 8,
  },
  refreshButton: {
    marginTop: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
});