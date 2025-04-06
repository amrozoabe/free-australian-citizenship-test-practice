// src/components/SimpleFeedbackButton.js
import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Linking,
  Alert
} from 'react-native';
import { useQuiz } from '../contexts/QuizContext';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

const SimpleFeedbackButton = () => {
  const { state } = useQuiz();
  const isDarkMode = state.settings?.theme === 'dark';

  // Add your Google Form or Microsoft Form URL here
  // This is a placeholder - replace with your actual form URL
  const FEEDBACK_FORM_URL = 'https://forms.gle/yourFormLink';
  
  // Optionally add device info to the URL to pre-fill form fields
  const getDeviceInfoForUrl = async () => {
    try {
      // Get basic device info
      const deviceName = await Device.getDeviceName() || 'Unknown device';
      const deviceType = Device.deviceType === Device.DeviceType.PHONE ? 'Phone' : 'Tablet';
      const appVersion = Constants.manifest.version || '1.0.0';
      const platformOS = Platform.OS;
      const platformVersion = Platform.Version;
      const language = state.settings?.nativeLanguage || 'en';
      
      // Encode device info as URL parameters
      // Google Forms example: adding prefill parameters
      // Note: You'll need to replace 'entry.123456789' with your actual form field IDs
      const urlParams = new URLSearchParams({
        'entry.123456789': `${deviceName} (${deviceType})`,
        'entry.987654321': `${platformOS} ${platformVersion}`,
        'entry.456789123': `App v${appVersion}, Lang: ${language}`
      });
      
      return `${FEEDBACK_FORM_URL}?${urlParams.toString()}`;
    } catch (error) {
      console.error('Error getting device info:', error);
      return FEEDBACK_FORM_URL;
    }
  };

  const handleFeedbackPress = async () => {
    try {
      const formUrl = await getDeviceInfoForUrl();
      
      // Check if the URL can be opened
      const canOpen = await Linking.canOpenURL(formUrl);
      
      if (canOpen) {
        await Linking.openURL(formUrl);
      } else {
        Alert.alert(
          'Cannot Open Link',
          'Unable to open the feedback form. Please check your internet connection.'
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'There was a problem opening the feedback form.'
      );
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.feedbackButton,
        { backgroundColor: isDarkMode ? '#333' : '#fff' }
      ]}
      onPress={handleFeedbackPress}
    >
      <Text style={[
        styles.feedbackButtonText,
        { color: isDarkMode ? '#fff' : '#333' }
      ]}>
        💡 Feedback
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  feedbackButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#ddd',
    zIndex: 1000,
  },
  feedbackButtonText: {
    fontSize: 14,
    fontWeight: '500',
  }
});

export default SimpleFeedbackButton;