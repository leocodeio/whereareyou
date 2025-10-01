import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Text, Card, Button, Switch, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackgroundTaskManager } from '@/services/BackgroundTaskManager';
import { AppUsageAgent } from '@/agents/AppUsageAgent';
import { Database, LocationLog } from '@/storage/Database';
import { logger } from '@/utils/Logger';
import { Colors, Spacing, BorderRadius, Shadow, Typography } from '@/config/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const [isTracking, setIsTracking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastLocation, setLastLocation] = useState<LocationLog | null>(null);
  const [settings, setSettings] = useState({
    locationIntervalMinutes: 15,
    inactivityThresholdHours: 24,
    sosContacts: [] as string[],
  });

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

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
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={[styles.card, { backgroundColor: colors.card }, Shadow.md]}>
          <Card.Title 
            title="Safety Tracker Status" 
            titleStyle={[Typography.heading3, { color: colors.text }]}
          />
          <Card.Content>
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, Typography.bodyMedium, { color: colors.text }]}>
                Tracking Active:
              </Text>
              <Switch 
                value={isTracking} 
                onValueChange={toggleTracking}
                thumbColor={isTracking ? colors.primary : colors.surface}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            <Button
              mode="contained"
              onPress={toggleTracking}
              style={[styles.toggleButton, { backgroundColor: colors.primary }]}
              labelStyle={[Typography.bodyMedium, { color: '#FFFFFF' }]}
              disabled={loading}
            >
              {isTracking ? 'Stop Tracking' : 'Start Tracking'}
            </Button>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: colors.card }, Shadow.md]}>
          <Card.Title 
            title="Current Settings" 
            titleStyle={[Typography.heading3, { color: colors.text }]}
          />
          <Card.Content>
            <View style={styles.settingRow}>
              <Text style={[Typography.body, { color: colors.textSecondary }]}>Interval:</Text>
              <Text style={[Typography.bodyMedium, { color: colors.text }]}>
                {settings.locationIntervalMinutes} minutes
              </Text>
            </View>
            <View style={styles.settingRow}>
              <Text style={[Typography.body, { color: colors.textSecondary }]}>SOS Threshold:</Text>
              <Text style={[Typography.bodyMedium, { color: colors.text }]}>
                {settings.inactivityThresholdHours} hours
              </Text>
            </View>
            <View style={styles.settingRow}>
              <Text style={[Typography.body, { color: colors.textSecondary }]}>SOS Contacts:</Text>
              <Text style={[Typography.bodyMedium, { color: colors.text }]}>
                {settings.sosContacts.length}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: colors.card }, Shadow.md]}>
          <Card.Title 
            title="Last Location" 
            titleStyle={[Typography.heading3, { color: colors.text }]}
          />
          <Card.Content>
            {lastLocation ? (
              <View>
                <View style={styles.locationRow}>
                  <Text style={[Typography.body, { color: colors.textSecondary }]}>Latitude:</Text>
                  <Text style={[Typography.bodyMedium, { color: colors.text }]}>
                    {lastLocation.latitude.toFixed(6)}
                  </Text>
                </View>
                <View style={styles.locationRow}>
                  <Text style={[Typography.body, { color: colors.textSecondary }]}>Longitude:</Text>
                  <Text style={[Typography.bodyMedium, { color: colors.text }]}>
                    {lastLocation.longitude.toFixed(6)}
                  </Text>
                </View>
                <View style={styles.locationRow}>
                  <Text style={[Typography.body, { color: colors.textSecondary }]}>Time:</Text>
                  <Text style={[Typography.bodyMedium, { color: colors.text }]}>
                    {new Date(lastLocation.timestamp).toLocaleString()}
                  </Text>
                </View>
                <Button 
                  onPress={refreshLocation} 
                  mode="outlined" 
                  style={[styles.refreshButton, { borderColor: colors.primary }]}
                  labelStyle={{ color: colors.primary }}
                >
                  Refresh Location
                </Button>
              </View>
            ) : (
              <Text style={[Typography.body, { color: colors.textSecondary }]}>
                No location data available
              </Text>
            )}
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: colors.card }, Shadow.md]}>
          <Card.Title 
            title="Quick Actions" 
            titleStyle={[Typography.heading3, { color: colors.text }]}
          />
          <Card.Content>
            <Button
              mode="outlined"
              onPress={() => {
                Alert.alert('Info', 'Settings screen will be available in navigation');
              }}
              style={[styles.actionButton, { borderColor: colors.primary }]}
              labelStyle={{ color: colors.primary }}
            >
              Open Settings
            </Button>
            <Button
              mode="outlined"
              onPress={() => {
                Alert.alert('Info', 'Logs screen will be available in navigation');
              }}
              style={[styles.actionButton, { borderColor: colors.primary }]}
              labelStyle={{ color: colors.primary }}
            >
              View Location Logs
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.body.fontSize,
  },
  card: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  statusLabel: {
    fontSize: Typography.bodyMedium.fontSize,
    fontWeight: Typography.bodyMedium.fontWeight,
  },
  toggleButton: {
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  refreshButton: {
    marginTop: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  actionButton: {
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
});