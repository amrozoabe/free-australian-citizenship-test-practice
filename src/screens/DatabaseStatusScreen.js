// src/screens/DatabaseStatusScreen.js - Updated to remove QuizAnalysisCache dependency
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useQuiz } from '../contexts/QuizContext';
import GlobalTermsDatabase from '../utils/GlobalTermsDatabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DatabaseStatusScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTerms: 0,
    totalLanguages: 0,
    languageStats: []
  });
  const { state } = useQuiz();
  const { settings } = state;

  useEffect(() => {
    loadDatabaseStats();
  }, []);

  const loadDatabaseStats = async () => {
    setIsLoading(true);
    try {
      // Initialize the database if it's not already initialized
      await GlobalTermsDatabase.init();
      
      // Get database stats
      const dbStats = GlobalTermsDatabase.getStats();
      
      setStats({
        totalTerms: dbStats.totalTerms || 0,
        totalLanguages: dbStats.totalLanguages || 0,
        languageStats: dbStats.languageStats || []
      });
    } catch (error) {
      console.error('Error loading database stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearDatabase = () => {
    Alert.alert(
      'Clear Database',
      'Are you sure you want to clear the entire terms database? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            await GlobalTermsDatabase.clearDatabase();
            
            // Also clear any cached keyword results
            const allKeys = await AsyncStorage.getAllKeys();
            const cacheKeys = allKeys.filter(key => key.startsWith('@keyword_cache_'));
            if (cacheKeys.length > 0) {
              await AsyncStorage.multiRemove(cacheKeys);
            }
            
            await loadDatabaseStats();
          }
        }
      ]
    );
  };

  const handleReinitializeDatabase = async () => {
    setIsLoading(true);
    try {
      await GlobalTermsDatabase.importFromKeywordsJson();
      await loadDatabaseStats();
      Alert.alert('Success', 'Database reinitialized from keywords.json');
    } catch (error) {
      console.error('Error reinitializing database:', error);
      Alert.alert('Error', 'Failed to reinitialize database');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExit = () => {
    navigation.navigate('Home');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[
        styles.container,
        { backgroundColor: settings?.theme === 'dark' ? '#1a1a1a' : '#f5f5f5' }
      ]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
            <Text style={styles.exitButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={[
            styles.headerTitle,
            { color: settings?.theme === 'dark' ? '#fff' : '#1a1a1a' }
          ]}>
            Terms Database
          </Text>
          <View style={styles.exitButton} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={[
            styles.loadingText,
            { color: settings?.theme === 'dark' ? '#ccc' : '#666' }
          ]}>
            Loading database statistics...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: settings?.theme === 'dark' ? '#1a1a1a' : '#f5f5f5' }
    ]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
          <Text style={styles.exitButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={[
          styles.headerTitle,
          { color: settings?.theme === 'dark' ? '#fff' : '#1a1a1a' }
        ]}>
          Terms Database
        </Text>
        <View style={styles.exitButton} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.statsContainer}>
          <View style={[
            styles.statsCard,
            { backgroundColor: settings?.theme === 'dark' ? '#333' : 'white' }
          ]}>
            <Text style={[
              styles.statsTitle,
              { color: settings?.theme === 'dark' ? '#fff' : '#1a1a1a' }
            ]}>
              Database Statistics
            </Text>
            
            <View style={styles.statRow}>
              <Text style={[
                styles.statLabel,
                { color: settings?.theme === 'dark' ? '#ccc' : '#666' }
              ]}>
                Total Terms:
              </Text>
              <Text style={[
                styles.statValue,
                { color: settings?.theme === 'dark' ? '#fff' : '#1a1a1a' }
              ]}>
                {stats.totalTerms}
              </Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={[
                styles.statLabel,
                { color: settings?.theme === 'dark' ? '#ccc' : '#666' }
              ]}>
                Languages Supported:
              </Text>
              <Text style={[
                styles.statValue,
                { color: settings?.theme === 'dark' ? '#fff' : '#1a1a1a' }
              ]}>
                {stats.totalLanguages}
              </Text>
            </View>
          </View>
          
          <Text style={[
            styles.sectionTitle,
            { color: settings?.theme === 'dark' ? '#fff' : '#1a1a1a' }
          ]}>
            Language Coverage
          </Text>
          
          {stats.languageStats.map(lang => (
            <View 
              key={lang.code}
              style={[
                styles.languageCard,
                { backgroundColor: settings?.theme === 'dark' ? '#333' : 'white' }
              ]}
            >
              <Text style={[
                styles.languageCode,
                { color: settings?.theme === 'dark' ? '#fff' : '#1a1a1a' }
              ]}>
                {lang.code}
              </Text>
              <Text style={[
                styles.translationCount,
                { color: settings?.theme === 'dark' ? '#fff' : '#1a1a1a' }
              ]}>
                {lang.count} terms
              </Text>
              <View style={[
                styles.progressBar,
                { backgroundColor: settings?.theme === 'dark' ? '#555' : '#eee' }
              ]}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(100, (lang.count / stats.totalTerms) * 100)}%` }
                  ]}
                />
              </View>
              <Text style={[
                styles.coverageText,
                { color: settings?.theme === 'dark' ? '#ccc' : '#666' }
              ]}>
                {Math.round((lang.count / stats.totalTerms) * 100)}% coverage
              </Text>
            </View>
          ))}
          
          <TouchableOpacity
            style={styles.reinitButton}
            onPress={handleReinitializeDatabase}
          >
            <Text style={styles.reinitButtonText}>Reinitialize from Keywords.json</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearDatabase}
          >
            <Text style={styles.clearButtonText}>Clear Database</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={loadDatabaseStats}
          >
            <Text style={styles.refreshButtonText}>Refresh Statistics</Text>
          </TouchableOpacity>
          
          <Text style={[
            styles.disclaimerText,
            { color: settings?.theme === 'dark' ? '#ccc' : '#666' }
          ]}>
            This database contains terms and translations from keywords.json.
            The app uses these definitions and translations to help users understand
            complex citizenship terms in their native language.
          </Text>
        </View>
      </ScrollView>
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
    paddingTop: 60,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    padding: 15,
  },
  statsCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 16,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 15,
  },
  languageCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  languageCode: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  translationCount: {
    fontSize: 14,
    marginTop: 5,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  coverageText: {
    fontSize: 12,
    marginTop: 5,
    textAlign: 'right',
  },
  reinitButton: {
    backgroundColor: '#5856D6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  reinitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#ff3b30',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimerText: {
    marginTop: 20,
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 10,
    marginBottom: 30,
  }
});