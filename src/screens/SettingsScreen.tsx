import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Text, Card, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SettingsAgent, Settings } from '@/agents/SettingsAgent';
import { logger } from '@/utils/Logger';
import { Colors, Spacing, BorderRadius, Shadow, Typography } from '@/config/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings>({
    locationIntervalMinutes: 15,
    inactivityThresholdHours: 24,
    sosContacts: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newContact, setNewContact] = useState('');

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

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
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading settings...</Text>
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
            title="Location Settings" 
            titleStyle={[Typography.heading3, { color: colors.text }]}
          />
          <Card.Content>
            <TextInput
              label="Location Interval (minutes)"
              value={settings.locationIntervalMinutes.toString()}
              onChangeText={(text) => {
                const value = parseInt(text) || 1;
                setSettings(prev => ({ ...prev, locationIntervalMinutes: value }));
              }}
              keyboardType="numeric"
              mode="outlined"
              style={[styles.input, { backgroundColor: colors.surfaceVariant, borderRadius: BorderRadius.md }]}
              outlineColor={colors.borderVariant}
              activeOutlineColor={colors.primary}
              textColor={colors.text}
              theme={{
                colors: {
                  primary: colors.primary,
                  background: colors.surfaceVariant,
                  onSurface: colors.text,
                  placeholder: colors.textSecondary,
                }
              }}
            />
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: colors.card }, Shadow.md]}>
          <Card.Title 
            title="SOS Settings" 
            titleStyle={[Typography.heading3, { color: colors.text }]}
          />
          <Card.Content>
            <TextInput
              label="Inactivity Threshold (hours)"
              value={settings.inactivityThresholdHours.toString()}
              onChangeText={(text) => {
                const value = parseInt(text) || 1;
                setSettings(prev => ({ ...prev, inactivityThresholdHours: value }));
              }}
              keyboardType="numeric"
              mode="outlined"
              style={[styles.input, { backgroundColor: colors.surfaceVariant, borderRadius: BorderRadius.md }]}
              outlineColor={colors.borderVariant}
              activeOutlineColor={colors.primary}
              textColor={colors.text}
              theme={{
                colors: {
                  primary: colors.primary,
                  background: colors.surfaceVariant,
                  onSurface: colors.text,
                  placeholder: colors.textSecondary,
                }
              }}
            />

            <Text style={[styles.subtitle, Typography.bodyMedium, { color: colors.text }]}>
              SOS Contacts
            </Text>
            {settings.sosContacts.map((contact, index) => (
              <View key={index} style={[styles.contactRow, { backgroundColor: colors.surfaceVariant }]}>
                <Text style={[styles.contactText, Typography.body, { color: colors.text }]}>
                  {contact}
                </Text>
                <Button 
                  onPress={() => removeContact(index)} 
                  mode="outlined" 
                  compact
                  style={{ borderColor: colors.error }}
                  labelStyle={{ color: colors.error }}
                >
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
                mode="outlined"
                style={[styles.input, styles.contactInput, { backgroundColor: colors.surfaceVariant, borderRadius: BorderRadius.md }]}
                outlineColor={colors.borderVariant}
                activeOutlineColor={colors.primary}
                textColor={colors.text}
                theme={{
                  colors: {
                    primary: colors.primary,
                    background: colors.surfaceVariant,
                    onSurface: colors.text,
                    placeholder: colors.textSecondary,
                  }
                }}
              />
              <Button 
                onPress={addContact} 
                mode="contained" 
                disabled={!newContact.trim()}
                style={[styles.addButton, { backgroundColor: colors.primary }]}
                labelStyle={{ color: '#FFFFFF' }}
              >
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
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          labelStyle={[Typography.bodyMedium, { color: '#FFFFFF' }]}
        >
          Save Settings
        </Button>
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
  input: {
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: Typography.bodyMedium.fontSize,
    fontWeight: Typography.bodyMedium.fontWeight,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  contactText: {
    flex: 1,
    fontSize: Typography.body.fontSize,
  },
  addContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  contactInput: {
    flex: 1,
  },
  addButton: {
    borderRadius: BorderRadius.md,
  },
  saveButton: {
    marginTop: Spacing.md,
    borderRadius: BorderRadius.md,
  },
});