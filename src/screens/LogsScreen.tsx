import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Card, Button, ActivityIndicator, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Database, LocationLog } from '@/storage/Database';
import { logger } from '@/utils/Logger';
import { Colors, Spacing, BorderRadius, Shadow, Typography } from '@/config/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function LogsScreen() {
  const [logs, setLogs] = useState<LocationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const database = new Database();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    loadingText: {
      marginTop: Spacing.md,
      fontSize: Typography.body.fontSize,
      color: colors.text,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: Spacing.md,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerText: {
      fontSize: Typography.heading3.fontSize,
      fontWeight: Typography.heading3.fontWeight,
      color: colors.text,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.xl,
      backgroundColor: colors.background,
    },
    emptyText: {
      fontSize: Typography.heading3.fontSize,
      fontWeight: Typography.heading3.fontWeight,
      marginBottom: Spacing.sm,
      textAlign: 'center',
      color: colors.text,
    },
    emptySubtext: {
      fontSize: Typography.body.fontSize,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    listContainer: {
      padding: Spacing.md,
    },
    logCard: {
      marginBottom: Spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.md,
      ...Shadow.sm,
    },
    timestamp: {
      fontSize: Typography.caption.fontSize,
      color: colors.textSecondary,
      marginBottom: Spacing.xs,
    },
    logText: {
      fontSize: Typography.body.fontSize,
      color: colors.text,
    },
    fab: {
      position: 'absolute',
      margin: Spacing.md,
      right: 0,
      bottom: 0,
      backgroundColor: colors.primary,
    },
  });

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const locationLogs = await database.getLocationLogs(100);
      setLogs(locationLogs);
      logger.debug('LogsScreen', `Loaded ${locationLogs.length} location logs`);
    } catch (error) {
      logger.error('LogsScreen', 'Failed to load logs', error as Error);
      Alert.alert('Error', 'Failed to load location logs');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  };

  const clearOldLogs = async () => {
    Alert.alert(
      'Clear Old Logs',
      'Delete logs older than 30 days?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const deletedCount = await database.deleteLocationLogs(30);
              logger.info('LogsScreen', `Deleted ${deletedCount} old logs`);
              Alert.alert('Success', `Deleted ${deletedCount} old logs`);
              loadLogs(); // Refresh the list
            } catch (error) {
              logger.error('LogsScreen', 'Failed to clear old logs', error as Error);
              Alert.alert('Error', 'Failed to clear old logs');
            }
          },
        },
      ]
    );
  };

  const renderLogItem = ({ item }: { item: LocationLog }) => (
    <Card style={styles.logCard}>
      <Card.Content>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
        <Text style={styles.logText}>Latitude: {item.latitude.toFixed(6)}</Text>
        <Text style={styles.logText}>Longitude: {item.longitude.toFixed(6)}</Text>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading logs...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Location Logs ({logs.length})</Text>
        <Button 
          onPress={clearOldLogs} 
          mode="outlined" 
          compact
          textColor={colors.primary}
          buttonColor={colors.surface}
        >
          Clear Old
        </Button>
      </View>

      {logs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No location logs available</Text>
          <Text style={styles.emptySubtext}>
            Start tracking to see location history here
          </Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderLogItem}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FAB
        icon="refresh"
        onPress={onRefresh}
        style={styles.fab}
        loading={refreshing}
        color={colors.surface}
      />
    </SafeAreaView>
  );
}