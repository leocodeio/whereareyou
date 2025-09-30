import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import { SettingsAgent, Settings } from '@/agents/SettingsAgent';
import { logger } from '@/utils/Logger';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings>({
    locationIntervalMinutes: 15,
    inactivityThresholdHours: 24,
    sosContacts: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newContact, setNewContact] = useState('');

  const settingsAgent = new SettingsAgent();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const currentSettings = await settingsAgent.getSettings();
      setSettings(currentSettings);
    } catch (error) {
      logger.error('SettingsScreen', 'Failed to load settings', error as Error);
      Alert.alert('Error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await settingsAgent.updateSettings(settings);
      logger.info('SettingsScreen', 'Settings saved successfully', settings);
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      logger.error('SettingsScreen', 'Failed to save settings', error as Error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const addContact = () => {
    if (newContact.trim()) {
      setSettings(prev => ({
        ...prev,
        sosContacts: [...prev.sosContacts, newContact.trim()],
      }));
      setNewContact('');
    }
  };

  const removeContact = (index: number) => {
    setSettings(prev => ({
      ...prev,
      sosContacts: prev.sosContacts.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Location Settings" />
        <Card.Content>
          <TextInput
            label="Location Interval (minutes)"
            value={settings.locationIntervalMinutes.toString()}
            onChangeText={(text) => {
              const value = parseInt(text) || 1;
              setSettings(prev => ({ ...prev, locationIntervalMinutes: value }));
            }}
            keyboardType="numeric"
            style={styles.input}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="SOS Settings" />
        <Card.Content>
          <TextInput
            label="Inactivity Threshold (hours)"
            value={settings.inactivityThresholdHours.toString()}
            onChangeText={(text) => {
              const value = parseInt(text) || 1;
              setSettings(prev => ({ ...prev, inactivityThresholdHours: value }));
            }}
            keyboardType="numeric"
            style={styles.input}
          />

          <Text style={styles.subtitle}>SOS Contacts</Text>
          {settings.sosContacts.map((contact, index) => (
            <View key={index} style={styles.contactRow}>
              <Text style={styles.contactText}>{contact}</Text>
              <Button onPress={() => removeContact(index)} mode="outlined" compact>
                Remove
              </Button>
            </View>
          ))}

          <View style={styles.addContactRow}>
            <TextInput
              label="Add phone number"
              value={newContact}
              onChangeText={setNewContact}
              keyboardType="phone-pad"
              style={[styles.input, { flex: 1 }]}
            />
            <Button onPress={addContact} mode="contained" disabled={!newContact.trim()}>
              Add
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={saveSettings}
        loading={saving}
        disabled={saving}
        style={styles.saveButton}
      >
        Save Settings
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 8,
  },
  contactText: {
    flex: 1,
    fontSize: 16,
  },
  addContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveButton: {
    marginTop: 16,
  },
});