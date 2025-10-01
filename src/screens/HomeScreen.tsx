import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { Text, Card, Switch, ActivityIndicator, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { BackgroundTaskManager } from '@/services/BackgroundTaskManager';
import { AppUsageAgent } from '@/agents/AppUsageAgent';
import { Database, LocationLog } from '@/storage/Database';
import { logger } from '@/utils/Logger';
import { Colors, Spacing, BorderRadius, Shadow, Typography } from '@/config/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Pill } from '@/components/ui/Pill';

function formatRelativeTime(timestamp: string): string {
  const then = new Date(timestamp).getTime();
  const now = Date.now();
  const diffMs = now - then;
  if (diffMs < 0) return 'just now';
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

export default function HomeScreen() {
  const [isTracking, setIsTracking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [lastLocation, setLastLocation] = useState<LocationLog | null>(null);
  const [timeTick, setTimeTick] = useState(0); // force refresh of relative time
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

  const refreshData = React.useCallback(async () => {
    try {
      // Refresh settings
      const currentSettings = await taskManager.getSettingsAgent().getSettings();
      setSettings(currentSettings);

      // Refresh last location
      const logs = await database.getLocationLogs(1);
      if (logs.length > 0) {
        setLastLocation(logs[0]);
      } else {
        setLastLocation(null);
      }

      // Refresh tracking status
      setIsTracking(taskManager.isTasksRunning());
    } catch (error) {
      logger.error('HomeScreen', 'Failed to refresh data', error as Error);
    }
  }, []);

  useEffect(() => {
    initializeApp();
    updateLastOpenTime();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refreshData();
    }, [refreshData])
  );

  // interval to update relative time display and refresh data when tracking
  useEffect(() => {
    if (!isTracking) return;
    const id = setInterval(() => {
      setTimeTick((t) => t + 1);
      // Refresh data every 5 minutes when tracking is active
      refreshData();
    }, 300000); // 5 minutes
    return () => clearInterval(id);
  }, [isTracking, refreshData]);

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
    if (refreshLoading) return;
    setRefreshLoading(true);
    try {
      const locationAgent = taskManager.getLocationAgent();
      const location = await locationAgent.getCurrentLocation();
      await locationAgent.saveLocation(location.latitude, location.longitude);

      // Refresh data to update UI
      await refreshData();

      logger.info('HomeScreen', 'Location refreshed', location);
    } catch (error) {
      logger.error('HomeScreen', 'Failed to refresh location', error as Error);
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setRefreshLoading(false);
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
        {/* Tracking Status */}
        <Card style={[styles.card, { backgroundColor: colors.card }, Shadow.md]}>
          <Card.Title
            title="Safety Tracker"
            titleStyle={[Typography.heading3, { color: colors.text }]}
          />
          <Card.Content>
            <View style={styles.trackingHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.statusLabel, Typography.bodyMedium, { color: colors.text }]}>Safety Tracking</Text>
                <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>Automatically logs your location periodically.</Text>
              </View>
              <Switch
                value={isTracking}
                onValueChange={toggleTracking}
                thumbColor={isTracking ? colors.primary : colors.surface}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
            <View style={styles.inlineStatusRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.statusDot, { backgroundColor: isTracking ? colors.success : colors.border }]} />
                <Text style={[Typography.bodyMedium, { color: colors.text }]}>{isTracking ? 'Active' : 'Stopped'}</Text>
              </View>
              {lastLocation && (
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>Last update {formatRelativeTime(lastLocation.timestamp)}</Text>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Current Settings Pills */}
        <Card style={[styles.card, { backgroundColor: colors.card }, Shadow.md]}>
          <Card.Title
            title="Current Settings"
            titleStyle={[Typography.heading3, { color: colors.text }]}
          />
          <Card.Content>
            <View style={styles.pillsRow}>
              <Pill label="Interval" value={`${settings.locationIntervalMinutes}m`} tone="primary" />
              <Pill label="SOS Idle" value={`${settings.inactivityThresholdHours}h`} tone="warning" />
              <Pill label="Contacts" value={settings.sosContacts.length} tone={settings.sosContacts.length > 0 ? 'success' : 'default'} />
            </View>
          </Card.Content>
        </Card>

        {/* Last Location */}
        <Card style={[styles.card, { backgroundColor: colors.card }, Shadow.md]}>
          <Card.Title
            title="Last Location"
            titleStyle={[Typography.heading3, { color: colors.text }]}
            right={(props: any) => (
              refreshLoading ? (
                <ActivityIndicator {...props} size={20} color={colors.primary} />
              ) : (
                <IconButton
                  {...props}
                  icon="refresh"
                  size={20}
                  onPress={refreshLocation}
                  disabled={!isTracking}
                  iconColor={isTracking ? colors.primary : colors.textSecondary}
                />
              )
            )}
          />
          <Card.Content>
            {lastLocation ? (
              <View>
                <View style={styles.lastLocationGrid}>
                  <View style={styles.coordRow}>
                    <Text style={[Typography.caption, { color: colors.textSecondary }]}>Lat</Text>
                    <Text style={[Typography.bodyMedium, { color: colors.text }]}>{lastLocation.latitude.toFixed(5)}</Text>
                  </View>
                  <View style={styles.coordRow}>
                    <Text style={[Typography.caption, { color: colors.textSecondary }]}>Lon</Text>
                    <Text style={[Typography.bodyMedium, { color: colors.text }]}>{lastLocation.longitude.toFixed(5)}</Text>
                  </View>
                  <View style={[styles.coordRow, { flexBasis: '100%', marginTop: Spacing.sm }]}>
                    <Text style={[Typography.caption, { color: colors.textSecondary }]}>Updated</Text>
                    <Text style={[Typography.body, { color: colors.text }]}>
                      {(() => { const d = new Date(lastLocation.timestamp); return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); })()} ({formatRelativeTime(lastLocation.timestamp)})
                    </Text>
                  </View>
                </View>
                <View style={styles.actionsRow}>
                  <IconButton
                    icon="content-copy"
                    size={18}
                    onPress={async () => {
                      try {
                        const coords = `${lastLocation.latitude.toFixed(5)}, ${lastLocation.longitude.toFixed(5)}`;
                        // Dynamic import to avoid issues if clipboard module not installed yet
                        // Lazy require avoid TS module resolution error if not installed yet
                        // eslint-disable-next-line @typescript-eslint/no-var-requires
                        const Clipboard = require('expo-clipboard');
                        if (Clipboard?.setStringAsync) {
                          await Clipboard.setStringAsync(coords);
                        } else if (Clipboard?.setString) {
                          Clipboard.setString(coords);
                        }
                        Alert.alert('Copied', 'Coordinates copied to clipboard');
                      } catch (e) {
                        logger.error('HomeScreen', 'Copy failed', e as Error);
                        Alert.alert('Error', 'Failed to copy coordinates');
                      }
                    }}
                    iconColor={colors.primary}
                  />
                  <IconButton
                    icon="map"
                    size={18}
                    onPress={async () => {
                      try {
                        const lat = lastLocation.latitude;
                        const lon = lastLocation.longitude;
                        const url = Platform.select({
                          ios: `maps:0,0?q=${lat},${lon}`,
                          android: `geo:${lat},${lon}?q=${lat},${lon}`,
                          default: `https://www.google.com/maps?q=${lat},${lon}`,
                        });
                        if (url) {
                          const Linking = await import('expo-linking');
                          Linking.openURL(url);
                        }
                      } catch (e) {
                        logger.error('HomeScreen', 'Open map failed', e as Error);
                        Alert.alert('Error', 'Failed to open maps');
                      }
                    }}
                    iconColor={colors.primary}
                  />
                  <IconButton
                    icon="share-variant"
                    size={18}
                    onPress={async () => {
                      try {
                        const lat = lastLocation.latitude.toFixed(5);
                        const lon = lastLocation.longitude.toFixed(5);
                        const message = `Last location: ${lat}, ${lon}\nhttps://www.google.com/maps?q=${lat},${lon}`;
                        const RN = await import('react-native');
                        const { Share } = RN;
                        await Share.share({ message });
                      } catch (e) {
                        logger.error('HomeScreen', 'Share failed', e as Error);
                        Alert.alert('Error', 'Failed to share location');
                      }
                    }}
                    iconColor={colors.primary}
                  />
                </View>
              </View>
            ) : (
              <Text style={[Typography.body, { color: colors.textSecondary }]}>
                {isTracking ? 'Waiting for first location fix…' : 'Tracking disabled'}
              </Text>
            )}
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
  trackingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  statusLabel: {
    fontSize: Typography.bodyMedium.fontSize,
    fontWeight: Typography.bodyMedium.fontWeight,
  },
  inlineStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.xs,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  lastLocationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: Spacing.md,
  },
  coordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexBasis: '48%',
    marginBottom: Spacing.xs,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  }
});
