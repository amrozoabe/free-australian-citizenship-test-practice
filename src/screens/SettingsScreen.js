import React from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useQuiz } from '../contexts/QuizContext';
import FeedbackButton from '../components/SimpleFeedbackButton';

export default function SettingsScreen({ navigation }) {
  const { state, dispatch } = useQuiz();
  const { settings } = state;

  const updateSetting = (key, value) => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { [key]: value }
    });
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Reset Progress',
      'Are you sure you want to reset all your progress? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset',
          style: 'destructive',
          onPress: () => dispatch({ type: 'RESET_PROGRESS' })
        }
      ]
    );
  };

  const handleExit = () => {
    navigation.navigate('Home');
  };

  return (
    <ScrollView style={[
      styles.container,
      { backgroundColor: settings.theme === 'dark' ? '#1a1a1a' : '#f5f5f5' }
    ]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
          <Text style={styles.exitButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={[
          styles.headerTitle,
          { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
        ]}>
          Settings
        </Text>
        <View style={styles.exitButton} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
            { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
          ]}>
            App Settings
          </Text>

          <View style={styles.setting}>
            <Text style={[
              styles.settingText,
              { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
            ]}>
              Dark Mode
            </Text>
            <Switch
              value={settings.theme === 'dark'}
              onValueChange={(value) => 
                updateSetting('theme', value ? 'dark' : 'light')
              }
            />
          </View>

        </View>

        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
            { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
          ]}>
            Data Management
          </Text>

          <TouchableOpacity 
            style={styles.dangerButton}
            onPress={handleResetProgress}
          >
            <Text style={styles.dangerButtonText}>
              Reset All Progress
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
            { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
          ]}>
            Information
          </Text>
          
          <TouchableOpacity 
            style={[
              styles.infoButton,
              { backgroundColor: settings.theme === 'dark' ? '#333' : '#fff' }
            ]}
            onPress={() => navigation.navigate('About')}
          >
            <Text style={[
              styles.infoButtonText,
              { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
            ]}>
              About This App
            </Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.infoButton,
              { backgroundColor: settings.theme === 'dark' ? '#333' : '#fff' }
            ]}
            onPress={() => navigation.navigate('Legal')}
          >
            <Text style={[
              styles.infoButtonText,
              { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
            ]}>
              Legal Information
            </Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
            { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
          ]}>
            App Version
          </Text>
          <Text style={[
            styles.aboutText,
            { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
          ]}>
            Version 1.0.0
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60, // Added extra padding for notch
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  exitButton: {
    width: 80,
  },
  exitButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  settingText: {
    fontSize: 16,
  },
  dangerButton: {
    backgroundColor: '#ff3b30',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  dangerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoButtonText: {
    fontSize: 16,
  },
  chevron: {
    fontSize: 22,
    color: '#8E8E93',
  },
  aboutText: {
    fontSize: 16,
    marginTop: 5,
  },
});