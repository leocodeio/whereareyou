// App configuration constants
export const CONFIG = {
  // Default intervals and thresholds
  DEFAULT_LOCATION_INTERVAL_MINUTES: parseInt(process.env.DEFAULT_LOCATION_INTERVAL_MINUTES || '15'),
  DEFAULT_INACTIVITY_THRESHOLD_HOURS: parseInt(process.env.DEFAULT_INACTIVITY_THRESHOLD_HOURS || '24'),

  // Database table names
  TABLES: {
    LOCATION_LOGS: 'location_logs',
    SETTINGS: 'settings',
  },

  // Setting keys
  SETTINGS_KEYS: {
    LOCATION_INTERVAL: 'location_interval_minutes',
    INACTIVITY_THRESHOLD: 'inactivity_threshold_hours',
    SOS_CONTACTS: 'sos_contacts',
    LAST_OPEN_TIME: 'last_open_time',
  },

  // Error messages
  ERRORS: {
    PERMISSION_DENIED: 'Location permission denied',
    LOCATION_UNAVAILABLE: 'Location services unavailable',
    DATABASE_ERROR: 'Database operation failed',
  },
};