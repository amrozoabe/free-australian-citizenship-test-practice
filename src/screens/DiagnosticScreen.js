// src/screens/DiagnosticScreen.js
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
import QuizAnalysisCache from '../utils/QuizAnalysisCache';
import claudeService from '../services/claudeTranslationService';
import { SUPPORTED_LANGUAGES } from '../constants/languages';
import apiKeyValidator from '../utils/apiKeyValidator';

export default function DiagnosticScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [diagnosticState, setDiagnosticState] = useState({
    databaseStats: {},
    cacheStats: {},
    testResults: [],
    apiKeyValid: false,
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
      // Initialize databases if needed
      await Promise.all([
        GlobalTermsDatabase.init(),
        QuizAnalysisCache.init()
      ]);
      
      // Collect stats
      const databaseStats = GlobalTermsDatabase.getStats();
      const cacheStats = await QuizAnalysisCache.getStats();
      const apiKeyValid = apiKeyValidator.validateClaudeApiKey();
      
      setDiagnosticState({
        databaseStats,
        cacheStats,
        testResults: [],
        apiKeyValid,
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
      
      // Test term identification
      try {
        const testText = testQuestions[0];
        const keyTerms = claudeService.identifyKeyTerms(testText);
        testResults.push({
          name: 'Term Identification',
          result: `Found ${keyTerms.length} terms: ${keyTerms.join(', ')}`,
          success: keyTerms.length > 0
        });
      } catch (error) {
        testResults.push({
          name: 'Term Identification',
          result: `Error: ${error.message}`,
          success: false
        });
      }
      
      // Test database lookup
      try {
        const dbTerms = GlobalTermsDatabase.analyzeText(testQuestions[0], testLanguage);
        testResults.push({
          name: 'Database Lookup',
          result: `Found ${dbTerms.length} terms in database`,
          success: true
        });
      } catch (error) {
        testResults.push({
          name: 'Database Lookup',
          result: `Error: ${error.message}`,
          success: false
        });
      }
      
      // Test cache functionality
      try {
        // First try to get from cache (should be a cache miss)
        await QuizAnalysisCache.getFromCache(testQuestions[1], testLanguage);
        
        // Add to cache
        await QuizAnalysisCache.saveToCache(testQuestions[1], testLanguage, {
          terms: [{ term: 'test', explanation: 'test', translation: 'test' }]
        });
        
        // Try to get it again (should be a cache hit)
        const cacheResult = await QuizAnalysisCache.getFromCache(testQuestions[1], testLanguage);
        
        testResults.push({
          name: 'Cache Operation',
          result: cacheResult ? 'Cache write and read successful' : 'Cache read failed',
          success: !!cacheResult
        });
      } catch (error) {
        testResults.push({
          name: 'Cache Operation',
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
      
      // Test translation system with a fallback term (to avoid API calls)
      try {
        const fallbackResult = claudeService.getFallbackAnalysis(
          "The Australian parliamentary democracy follows the rule of law", 
          testLanguage
        );
        
        const hasTranslations = fallbackResult.terms && 
                               fallbackResult.terms.length > 0 && 
                               fallbackResult.terms[0].translation;
        
        testResults.push({
          name: 'Translation System',
          result: hasTranslations 
            ? `Found translations for ${fallbackResult.terms.length} terms` 
            : 'No translations found',
          success: hasTranslations
        });
      } catch (error) {
        testResults.push({
          name: 'Translation System',
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
      // Clear cache
      await QuizAnalysisCache.clearCache();
      
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
          {/* API Status */}
          <View style={[
            styles.statsCard,
            { backgroundColor: settings?.theme === 'dark' ? '#333' : 'white' }
          ]}>
            <Text style={[
              styles.statsTitle,
              { color: settings?.theme === 'dark' ? '#fff' : '#1a1a1a' }
            ]}>
              API Status
            </Text>
            
            <View style={styles.statRow}>
              <Text style={[
                styles.statLabel,
                { color: settings?.theme === 'dark' ? '#ccc' : '#666' }
              ]}>
                Claude API Key:
              </Text>
              <Text style={[
                styles.statValue,
                { 
                  color: diagnosticState.apiKeyValid ? 
                    '#34C759' : (settings?.theme === 'dark' ? '#ff6b6b' : '#ff3b30') 
                }
              ]}>
                {diagnosticState.apiKeyValid ? 'Valid' : 'Not Configured'}
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
          
          {/* Cache Stats */}
          <View style={[
            styles.statsCard,
            { backgroundColor: settings?.theme === 'dark' ? '#333' : 'white' }
          ]}>
            <Text style={[
              styles.statsTitle,
              { color: settings?.theme === 'dark' ? '#fff' : '#1a1a1a' }
            ]}>
              Cache Statistics
            </Text>
            
            <View style={styles.statRow}>
              <Text style={[
                styles.statLabel,
                { color: settings?.theme === 'dark' ? '#ccc' : '#666' }
              ]}>
                Cached Items:
              </Text>
              <Text style={[
                styles.statValue,
                { color: settings?.theme === 'dark' ? '#fff' : '#1a1a1a' }
              ]}>
                {diagnosticState.cacheStats.totalEntries || 0}
              </Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={[
                styles.statLabel,
                { color: settings?.theme === 'dark' ? '#ccc' : '#666' }
              ]}>
                Last Cleanup:
              </Text>
              <Text style={[
                styles.statValue,
                { color: settings?.theme === 'dark' ? '#fff' : '#1a1a1a' }
              ]}>
                {diagnosticState.cacheStats.lastCleanup ? 
                  new Date(diagnosticState.cacheStats.lastCleanup).toLocaleString() : 
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
            are working correctly. If any test fails, try refreshing the data or checking your
            internet connection.
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