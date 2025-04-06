// src/screens/LegalScreen.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView 
} from 'react-native';
import { useQuiz } from '../contexts/QuizContext';
import FeedbackButton from '../components/SimpleFeedbackButton';

export default function LegalScreen({ navigation }) {
  const { state } = useQuiz();
  const { settings } = state;

  const handleExit = () => {
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={[
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
          Legal Information
        </Text>
        <View style={styles.exitButton} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
            { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
          ]}>
            Disclaimer
          </Text>
          <Text style={[
            styles.paragraph,
            { color: settings.theme === 'dark' ? '#ddd' : '#333' }
          ]}>
            This application ("Australian Citizenship Test Practice") is provided for educational and informational purposes only. While we strive to keep the information up to date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information, products, services, or related graphics contained in this application.
          </Text>
          <Text style={[
            styles.paragraph,
            { color: settings.theme === 'dark' ? '#ddd' : '#333' }
          ]}>
            Any reliance you place on such information is therefore strictly at your own risk. In no event will we be liable for any loss or damage including without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits arising out of, or in connection with, the use of this application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
            { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
          ]}>
            Not Official Government Material
          </Text>
          <Text style={[
            styles.paragraph,
            { color: settings.theme === 'dark' ? '#ddd' : '#333' }
          ]}>
            This application is not affiliated with, endorsed by, or in any way officially connected with the Australian Government, the Department of Home Affairs, or any official citizenship testing authority. The questions, content, and resources provided in this application are prepared independently based on publicly available information and should not be considered official test materials.
          </Text>
          <Text style={[
            styles.paragraph,
            { color: settings.theme === 'dark' ? '#ddd' : '#333' }
          ]}>
            For official information regarding Australian citizenship requirements and testing, please visit the Department of Home Affairs website or contact your local immigration office.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
            { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
          ]}>
            Third-Party Services
          </Text>
          <Text style={[
            styles.paragraph,
            { color: settings.theme === 'dark' ? '#ddd' : '#333' }
          ]}>
            This application may recommend or reference third-party services, including but not limited to tutoring services and migration assistance. These recommendations are provided for informational purposes only. The developer of this application does not endorse, guarantee, or assume responsibility for any such third-party services.
          </Text>
          <Text style={[
            styles.paragraph,
            { color: settings.theme === 'dark' ? '#ddd' : '#333' }
          ]}>
            Users should conduct their own research and exercise due diligence before engaging with any third-party service providers. Any arrangement made between a user and a third-party service is solely between those parties, and the developer shall not be liable for any issues arising from such arrangements.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
            { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
          ]}>
            Privacy Policy
          </Text>
          <Text style={[
            styles.paragraph,
            { color: settings.theme === 'dark' ? '#ddd' : '#333' }
          ]}>
            This application collects and stores user data locally on your device to provide personalized learning experiences, track progress, and save preferences. We do not transmit your personal data to external servers except when explicitly requested by you (such as when booking services or contacting support).
          </Text>
          <Text style={[
            styles.paragraph,
            { color: settings.theme === 'dark' ? '#ddd' : '#333' }
          ]}>
            Any diagnostic or usage data that may be collected is anonymous and used solely for the purpose of improving the application's functionality and user experience. You may clear all locally stored data at any time by using the reset options in the Settings screen.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
            { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
          ]}>
            Intellectual Property
          </Text>
          <Text style={[
            styles.paragraph,
            { color: settings.theme === 'dark' ? '#ddd' : '#333' }
          ]}>
            All content in this application, including but not limited to text, graphics, logos, icons, images, audio clips, and software, is the property of the application developer and is protected by Australian and international copyright laws.
          </Text>
          <Text style={[
            styles.paragraph,
            { color: settings.theme === 'dark' ? '#ddd' : '#333' }
          ]}>
            You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material in this application without prior written consent.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
            { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
          ]}>
            Governing Law
          </Text>
          <Text style={[
            styles.paragraph,
            { color: settings.theme === 'dark' ? '#ddd' : '#333' }
          ]}>
            These terms and conditions are governed by and construed in accordance with the laws of Australia. Any disputes relating to these terms and conditions shall be subject to the exclusive jurisdiction of the courts of Australia.
          </Text>
        </View>

        <Text style={[
          styles.lastUpdated,
          { color: settings.theme === 'dark' ? '#aaa' : '#777' }
        ]}>
          Last updated: April 2025
        </Text>
      </ScrollView>
      <FeedbackButton />
    </SafeAreaView>
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
    paddingTop: 60, // Extra padding for notch
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
  scrollView: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 15,
  },
  lastUpdated: {
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
    marginVertical: 20,
  }
});