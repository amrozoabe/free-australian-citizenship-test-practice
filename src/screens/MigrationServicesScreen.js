// src/screens/MigrationServicesScreen.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Image, 
  Linking, 
  Platform
} from 'react-native';
import { useQuiz } from '../contexts/QuizContext';
import FeedbackButton from '../components/SimpleFeedbackButton';

export default function MigrationServicesScreen({ navigation }) {
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

  const handleContact = (method, value) => {
    if (method === 'phone') {
      const phoneUrl = Platform.OS === 'ios' ? `telprompt:${value}` : `tel:${value}`;
      Linking.openURL(phoneUrl);
    } else if (method === 'email') {
      Linking.openURL(`mailto:${value}`);
    }
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
          Migration Services
        </Text>
        <View style={styles.exitButton} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        <Text style={[
          styles.introText,
          { color: settings.theme === 'dark' ? '#ccc' : '#666' }
        ]}>
          We recommend trusted migration services to help with your journey to Australian citizenship.
        </Text>

        {/* Featured Service */}
        <View style={[
          styles.featuredService,
          { backgroundColor: settings.theme === 'dark' ? '#333' : 'white' }
        ]}>
          <Image 
            source={require('../../assets/images/icon.png')} 
            style={styles.serviceLogo}
            resizeMode="contain"
            defaultSource={require('../../assets/images/icon.png')} // Use a fallback image if IMS logo doesn't exist
          />
          
          <Text style={[
            styles.serviceName,
            { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
          ]}>
            Illawarra Multicultural Services
          </Text>

          <View style={styles.programBadge}>
            <Text style={styles.programBadgeText}>
              Community Support Program (CSP)
            </Text>
          </View>
          
          <Text style={[
            styles.serviceDescription,
            { color: settings.theme === 'dark' ? '#ddd' : '#333' }
          ]}>
            The Community Support Program (CSP) provides a pathway for Australian businesses, community organizations, families or individuals to support humanitarian entrants coming to Australia.
          </Text>

          <View style={styles.keyFeatures}>
            <Text style={[
              styles.featuresTitle,
              { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
            ]}>
              Key Features:
            </Text>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={[
                styles.featureText,
                { color: settings.theme === 'dark' ? '#ccc' : '#666' }
              ]}>
                Humanitarian settlement program
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={[
                styles.featureText,
                { color: settings.theme === 'dark' ? '#ccc' : '#666' }
              ]}>
                Support for refugees and humanitarian entrants
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={[
                styles.featureText,
                { color: settings.theme === 'dark' ? '#ccc' : '#666' }
              ]}>
                Settlement assistance and community integration
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={[
                styles.featureText,
                { color: settings.theme === 'dark' ? '#ccc' : '#666' }
              ]}>
                Employment and education pathways
              </Text>
            </View>
          </View>

          <View style={styles.serviceDetails}>
            <Text style={[
              styles.detailsTitle,
              { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
            ]}>
              Program Overview:
            </Text>
            
            <Text style={[
              styles.detailsText,
              { color: settings.theme === 'dark' ? '#ddd' : '#333' }
            ]}>
              The CSP is designed to provide a sustainable settlement pathway for refugees with employment prospects and family or community support in Australia. It enables communities and businesses to propose humanitarian entrants where they can offer settlement support.
            </Text>
            
            <Text style={[
              styles.detailsText,
              { color: settings.theme === 'dark' ? '#ddd' : '#333' }
            ]}>
              IMS provides comprehensive support services to help navigate the application process, ensuring successful settlement outcomes for humanitarian entrants.
            </Text>
          </View>

          <View style={styles.contactInfo}>
            <Text style={[
              styles.contactTitle,
              { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
            ]}>
              Contact Information:
            </Text>
            
            <TouchableOpacity 
              style={styles.contactItem}
              onPress={() => handleContact('phone', '0242297566')}
            >
              <Text style={styles.contactIcon}>📞</Text>
              <Text style={[
                styles.contactText,
                { color: settings.theme === 'dark' ? '#ccc' : '#666' }
              ]}>
                (02) 4229 7566
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.contactItem}
              onPress={() => handleContact('email', 'info@ims.org.au')}
            >
              <Text style={styles.contactIcon}>✉️</Text>
              <Text style={[
                styles.contactText,
                { color: settings.theme === 'dark' ? '#ccc' : '#666' }
              ]}>
                info@ims.org.au
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactItem}>
              <Text style={styles.contactIcon}>📍</Text>
              <Text style={[
                styles.contactText,
                { color: settings.theme === 'dark' ? '#ccc' : '#666' }
              ]}>
                17 Auburn Street, Wollongong NSW 2500
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.websiteButton}
            onPress={() => handleOpenLink('https://ims.org.au/our-programs/community-support-program-csp/')}
          >
            <Text style={styles.websiteButtonText}>
              Visit Website
            </Text>
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={[
            styles.disclaimerText,
            { color: settings.theme === 'dark' ? '#aaa' : '#888' }
          ]}>
            Disclaimer: We recommend these services based on our experience, but we are not affiliated with them. Please conduct your own research to ensure they meet your specific needs.
          </Text>
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
  introText: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 24,
  },
  featuredService: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  serviceLogo: {
    height: 80,
    width: '100%',
    marginBottom: 15,
  },
  serviceName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  programBadge: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 15,
  },
  programBadgeText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  serviceDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  keyFeatures: {
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  featureIcon: {
    color: '#34C759',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    marginTop: 2,
  },
  featureText: {
    fontSize: 16,
    flex: 1,
  },
  serviceDetails: {
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  detailsText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
  contactInfo: {
    marginBottom: 20,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  contactText: {
    fontSize: 16,
  },
  websiteButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  websiteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    marginBottom: 30,
    padding: 15,
  },
  disclaimerText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});