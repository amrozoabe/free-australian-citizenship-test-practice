// src/screens/AboutScreen.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  Linking
} from 'react-native';
import { useQuiz } from '../contexts/QuizContext';
import FeedbackButton from '../components/SimpleFeedbackButton';

export default function AboutScreen({ navigation }) {
  const { state } = useQuiz();
  const { settings } = state;

  const handleExit = () => {
    navigation.navigate('Home');
  };

  const handleOpenLink = (url) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
      }
    });
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
          About
        </Text>
        <View style={styles.exitButton} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
            { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
          ]}>
            About This App
          </Text>
          <Text style={[
            styles.paragraph,
            { color: settings.theme === 'dark' ? '#ddd' : '#333' }
          ]}>
            The Australian Citizenship Test Practice App was created to assist individuals who are learning English prepare for their Australian citizenship test. The app provides study materials, practice questions, and multilingual support to help candidates better understand the content in their native language.
          </Text>
          <Text style={[
            styles.paragraph,
            { color: settings.theme === 'dark' ? '#ddd' : '#333' }
          ]}>
            Our goal is to break down language barriers and create equal opportunities for all prospective citizens, regardless of their English proficiency level. By providing materials in multiple languages, we aim to help people focus on learning the content rather than struggling with language comprehension.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
            { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
          ]}>
            About the Developer
          </Text>
          <Text style={[
            styles.paragraph,
            { color: settings.theme === 'dark' ? '#ddd' : '#333' }
          ]}>
            The developer of this application holds a Bachelor of Engineering (Honours) in Electrical Engineering and a Bachelor of Commerce in Business Analytics. With over five years of experience in social services, the developer has worked closely with migrant communities and understands the challenges faced by those navigating the path to citizenship.
          </Text>
          <Text style={[
            styles.paragraph,
            { color: settings.theme === 'dark' ? '#ddd' : '#333' }
          ]}>
            Currently working as an Engineer at Ausgrid, the developer created this app as a passion project, drawing on both technical expertise and social services background to create a tool that addresses a real need in migrant communities.
          </Text>
          <Text style={[
            styles.paragraph,
            { color: settings.theme === 'dark' ? '#ddd' : '#333' }
          ]}>
            The developer's firsthand experience with the challenges faced by English learners in the citizenship process inspired the creation of this app, with a particular focus on making citizenship information accessible to all.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
            { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
          ]}>
            Our Mission
          </Text>
          <Text style={[
            styles.paragraph,
            { color: settings.theme === 'dark' ? '#ddd' : '#333' }
          ]}>
            We believe that language should not be a barrier to citizenship for those who are committed to becoming Australians and contributing to our society. Our mission is to empower migrants with the knowledge they need to succeed in their citizenship journey.
          </Text>
          <Text style={[
            styles.paragraph,
            { color: settings.theme === 'dark' ? '#ddd' : '#333' }
          ]}>
            By providing:
          </Text>
          <Text style={[
            styles.bulletPoint,
            { color: settings.theme === 'dark' ? '#ddd' : '#333' }
          ]}>
            • Study materials in multiple languages
          </Text>
          <Text style={[
            styles.bulletPoint,
            { color: settings.theme === 'dark' ? '#ddd' : '#333' }
          ]}>
            • Practice tests that simulate the real citizenship test
          </Text>
          <Text style={[
            styles.bulletPoint,
            { color: settings.theme === 'dark' ? '#ddd' : '#333' }
          ]}>
            • Explanations of key terms and concepts
          </Text>
          <Text style={[
            styles.bulletPoint,
            { color: settings.theme === 'dark' ? '#ddd' : '#333' }
          ]}>
            • Connection to additional resources when needed
          </Text>
          <Text style={[
            styles.paragraph,
            { color: settings.theme === 'dark' ? '#ddd' : '#333' }
          ]}>
            We hope to contribute to a more inclusive and supportive pathway to Australian citizenship.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
            { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
          ]}>
            Acknowledgment of Country
          </Text>
          <Text style={[
            styles.paragraph,
            { color: settings.theme === 'dark' ? '#ddd' : '#333' }
          ]}>
            We acknowledge the Traditional Custodians of the lands on which we live and work, and pay our respects to Elders past, present and emerging. We recognize their continuing connection to land, water, and community.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
            { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
          ]}>
            App Information
          </Text>
          <View style={styles.infoRow}>
            <Text style={[
              styles.infoLabel,
              { color: settings.theme === 'dark' ? '#aaa' : '#666' }
            ]}>
              Version:
            </Text>
            <Text style={[
              styles.infoValue,
              { color: settings.theme === 'dark' ? '#fff' : '#333' }
            ]}>
              1.0.0
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[
              styles.infoLabel,
              { color: settings.theme === 'dark' ? '#aaa' : '#666' }
            ]}>
              Last Updated:
            </Text>
            <Text style={[
              styles.infoValue,
              { color: settings.theme === 'dark' ? '#fff' : '#333' }
            ]}>
              April 2025
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[
              styles.infoLabel,
              { color: settings.theme === 'dark' ? '#aaa' : '#666' }
            ]}>
              Languages:
            </Text>
            <Text style={[
              styles.infoValue,
              { color: settings.theme === 'dark' ? '#fff' : '#333' }
            ]}>
              30 supported languages
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.legalButton}
            onPress={() => navigation.navigate('Legal')}
          >
            <Text style={styles.legalButtonText}>
              View Legal Information
            </Text>
          </TouchableOpacity>
        </View>
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
  bulletPoint: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 5,
    marginLeft: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 15,
    width: 120,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 15,
    flex: 1,
  },
  buttonContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  legalButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  legalButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});