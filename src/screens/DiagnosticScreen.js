// src/screens/DiagnosticScreen.js - Modified to remove QuizAnalysisCache dependency
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
import { SUPPORTED_LANGUAGES } from '../constants/languages';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DiagnosticScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [diagnosticState, setDiagnosticState] = useState({
    databaseStats: {},
    testResults: [],
    testRunning: false
  });
  const { state } = useQuiz();
  const { settings } = state;
  
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      // Initialize database
      await GlobalTermsDatabase.init();
      
      // Collect stats
      const databaseStats = GlobalTermsDatabase.getStats();
      
      setDiagnosticState({
        databaseStats,
        testResults: [],
        testRunning: false
      });
    } catch (error) {
      console.error('Error loading diagnostic stats:', error);
      Alert.alert('Error', 'Failed to load diagnostic data');
    } finally {
      setIsLoading(false);
    }
  };

  const runDiagnosticTest = async () => {
    try {
      setDiagnosticState(prev => ({ ...prev, testRunning: true }));
      
      const testResults = [];
      const testQuestions = [
        "What do we remember on Anzac Day?",
        "What are the colours of the Australian Aboriginal Flag?",
        "What is Australia's system of government?"
      ];
      
      // Test language detection
      const testLanguage = settings?.nativeLanguage || 'en';
      const languageName = SUPPORTED_LANGUAGES.find(l => l.code === testLanguage)?.name || testLanguage;
      
      testResults.push({
        name: 'Language Detection',
        result: `Successfully using ${languageName} (${testLanguage})`,
        success: true
      });
      
      // Test database functionality
      try {
        const dbTerms = GlobalTermsDatabase.analyzeText(testQuestions[0], testLanguage);
        testResults.push({
          name: 'Keyword Database',
          result: `Found ${dbTerms.length} terms in database`,
          success: true
        });
      } catch (error) {
        testResults.push({
          name: 'Keyword Database',
          result: `Error: ${error.message}`,
          success: false
        });
      }
      
      // Test keywords.json integration
      try {
        // This assumes at least one term from keywords.json is in the database
        const allTerms = Object.keys(GlobalTermsDatabase.getAllTerms());
        const keywordsIntegrated = allTerms.length > 0;
        
        testResults.push({
          name: 'Keywords.json Integration',
          result: keywordsIntegrated 
            ? `Successfully loaded ${allTerms.length} terms` 
            : 'No terms loaded from keywords.json',
          success: keywordsIntegrated
        });
      } catch (error) {
        testResults.push({
          name: 'Keywords.json Integration',
          result: `Error: ${error.message}`,
          success: false
        });
      }
      
      // Test translation availability
      try {
        const translations = GlobalTermsDatabase.getAllTranslationsForLanguage(testLanguage);
        const translationCount = Object.keys(translations).length;
        
        testResults.push({
          name: 'Translation Availability',
          result: translationCount > 0 
            ? `Found ${translationCount} translations for ${testLanguage}` 
            : `No translations found for ${testLanguage}`,
          success: translationCount > 0
        });
      } catch (error) {
        testResults.push({
          name: 'Translation Availability',
          result: `Error: ${error.message}`,
          success: false
        });
      }
      
      // Calculate overall system health
      const successCount = testResults.filter(t => t.success).length;
      const healthPercentage = Math.round((successCount / testResults.length) * 100);
      
      testResults.push({
        name: 'Overall System Health',
        result: `${healthPercentage}% of tests passed (${successCount}/${testResults.length})`,
        success: healthPercentage >= 70 // At least 70% of tests should pass
      });
      
      setDiagnosticState(prev => ({
        ...prev,
        testResults,
        testRunning: false
      }));
    } catch (error) {
      console.error('Error running diagnostic test:', error);
      Alert.alert('Error', 'Failed to complete diagnostic tests');
      setDiagnosticState(prev => ({ ...prev, testRunning: false }));
    }
  };

  const refreshData = async () => {
    try {
      // Clear any cache keys from AsyncStorage
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith('@keyword_cache_'));
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }
      
      // Reload database from keywords.json
      await GlobalTermsDatabase.importFromKeywordsJson();
      
      // Reload stats
      await loadStats();
      
      Alert.alert('Success', 'System refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      Alert.alert('Error', 'Failed to refresh system data');
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
            System Diagnostics
          </Text>
          <View style={styles.exitButton} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={[
            styles.loadingText,
            { color: settings?.theme === 'dark' ? '#ccc' : '#666' }
          ]}>
            Loading diagnostic information...
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
          System Diagnostics
        </Text>
        <View style={styles.exitButton} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.statsContainer}>
          {/* Keyword System Status */}
          <View style={[
            styles.statsCard,
            { backgroundColor: settings?.theme === 'dark' ? '#333' : 'white' }
          ]}>
            <Text style={[
              styles.statsTitle,
              { color: settings?.theme === 'dark' ? '#fff' : '#1a1a1a' }
            ]}>
              Keyword Translation System
            </Text>
            
            <View style={styles.statRow}>
              <Text style={[
                styles.statLabel,
                { color: settings?.theme === 'dark' ? '#ccc' : '#666' }
              ]}>
                Status:
              </Text>
              <Text style={[
                styles.statValue,
                { color: '#34C759' }
              ]}>
                Active
              </Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={[
                styles.statLabel,
                { color: settings?.theme === 'dark' ? '#ccc' : '#666' }
              ]}>
                Translations:
              </Text>
              <Text style={[
                styles.statValue,
                { color: settings?.theme === 'dark' ? '#fff' : '#1a1a1a' }
              ]}>
                {Object.keys(diagnosticState.databaseStats.languageStats || {}).length || 0} languages
              </Text>
            </View>
          </View>
          
          {/* Terms Database Stats */}
          <View style={[
            styles.statsCard,
            { backgroundColor: settings?.theme === 'dark' ? '#333' : 'white' }
          ]}>
            <Text style={[
              styles.statsTitle,
              { color: settings?.theme === 'dark' ? '#fff' : '#1a1a1a' }
            ]}>
              Terms Database
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
                {diagnosticState.databaseStats.totalTerms || 0}
              </Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={[
                styles.statLabel,
                { color: settings?.theme === 'dark' ? '#ccc' : '#666' }
              ]}>
                Languages:
              </Text>
              <Text style={[
                styles.statValue,
                { color: settings?.theme === 'dark' ? '#fff' : '#1a1a1a' }
              ]}>
                {diagnosticState.databaseStats.totalLanguages || 0}
              </Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={[
                styles.statLabel,
                { color: settings?.theme === 'dark' ? '#ccc' : '#666' }
              ]}>
                Last Updated:
              </Text>
              <Text style={[
                styles.statValue,
                { color: settings?.theme === 'dark' ? '#fff' : '#1a1a1a' }
              ]}>
                {diagnosticState.databaseStats.lastUpdate ? 
                  new Date(diagnosticState.databaseStats.lastUpdate).toLocaleString() : 
                  'Never'}
              </Text>
            </View>
          </View>
          
          {/* Diagnostic Tests */}
          {diagnosticState.testResults.length > 0 && (
            <View style={[
              styles.statsCard,
              { backgroundColor: settings?.theme === 'dark' ? '#333' : 'white' }
            ]}>
              <Text style={[
                styles.statsTitle,
                { color: settings?.theme === 'dark' ? '#fff' : '#1a1a1a' }
              ]}>
                Diagnostic Test Results
              </Text>
              
              {diagnosticState.testResults.map((test, index) => (
                <View key={index} style={styles.testResultRow}>
                  <Text style={[
                    styles.testName,
                    { color: settings?.theme === 'dark' ? '#fff' : '#1a1a1a' }
                  ]}>
                    {test.name}:
                  </Text>
                  <Text style={[
                    styles.testResult,
                    { 
                      color: test.success ? 
                        '#34C759' : (settings?.theme === 'dark' ? '#ff6b6b' : '#ff3b30')
                    }
                  ]}>
                    {test.result}
                  </Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Action Buttons */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: '#007AFF' },
              diagnosticState.testRunning && styles.disabledButton
            ]}
            onPress={runDiagnosticTest}
            disabled={diagnosticState.testRunning}
          >
            {diagnosticState.testRunning ? (
              <View style={styles.loadingButtonContent}>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.actionButtonText}>Running Tests...</Text>
              </View>
            ) : (
              <Text style={styles.actionButtonText}>Run Diagnostic Test</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#FF9500', marginTop: 10 }]}
            onPress={refreshData}
          >
            <Text style={styles.actionButtonText}>Refresh Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#5856D6', marginTop: 10 }]}
            onPress={loadStats}
          >
            <Text style={styles.actionButtonText}>Refresh Statistics</Text>
          </TouchableOpacity>
          
          <Text style={[
            styles.disclaimerText,
            { color: settings?.theme === 'dark' ? '#ccc' : '#666' }
          ]}>
            This diagnostic screen helps verify that all components of the translation system
            are working correctly. The app uses a local keyword database for definitions and translations.
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
  testResultRow: {
    marginBottom: 10,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  testResult: {
    fontSize: 14,
    marginLeft: 10,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
  loadingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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