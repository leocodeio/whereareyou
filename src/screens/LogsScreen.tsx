import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Card, Button, ActivityIndicator, FAB } from 'react-native-paper';
import { Database, LocationLog } from '@/storage/Database';
import { logger } from '@/utils/Logger';

export default function LogsScreen() {
  const [logs, setLogs] = useState<LocationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const database = new Database();

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
        <Text>Latitude: {item.latitude.toFixed(6)}</Text>
        <Text>Longitude: {item.longitude.toFixed(6)}</Text>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading logs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Location Logs ({logs.length})</Text>
        <Button onPress={clearOldLogs} mode="outlined" compact>
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  logCard: {
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});