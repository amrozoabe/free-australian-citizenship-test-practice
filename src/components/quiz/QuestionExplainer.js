// src/components/quiz/QuestionExplainer.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useQuiz } from '../../contexts/QuizContext';

const QuestionExplainer = ({ terms = [], isLoading = false }) => {
  const { state } = useQuiz();
  const { settings } = state;
  const isDarkMode = settings?.theme === 'dark';

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { color: isDarkMode ? '#ccc' : '#666' }]}>
          Analyzing question...
        </Text>
      </View>
    );
  }

  if (!terms || terms.length === 0) {
    return null;
  }

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDarkMode ? '#333' : '#f8f9fa' }
    ]}>
      <Text style={[
        styles.header,
        { color: isDarkMode ? '#fff' : '#333' }
      ]}>
        Key Terms
      </Text>
      
      {terms.map((item, index) => (
        <View key={index} style={styles.termContainer}>
          <Text style={[
            styles.term,
            { color: isDarkMode ? '#fff' : '#1a1a1a' }
          ]}>
            {item.term}
          </Text>
          
          <Text style={[
            styles.explanation,
            { color: isDarkMode ? '#ccc' : '#555' }
          ]}>
            {item.explanation}
          </Text>
          
          {item.translation && (
            <View style={styles.translationContainer}>
              <Text style={[
                styles.translationHeader,
                { color: isDarkMode ? '#ddd' : '#444' }
              ]}>
                Translation:
              </Text>
              <Text style={[
                styles.translation,
                { color: isDarkMode ? '#ddd' : '#444' }
              ]}>
                {item.translation}
              </Text>
            </View>
          )}
          
          {index < terms.length - 1 && (
            <View style={[
              styles.divider,
              { backgroundColor: isDarkMode ? '#444' : '#ddd' }
            ]} />
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  termContainer: {
    marginBottom: 10,
  },
  term: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  explanation: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  translationContainer: {
    marginTop: 4,
  },
  translationHeader: {
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
    marginBottom: 2,
  },
  translation: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  loadingContainer: {
    marginVertical: 15,
    padding: 10,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontStyle: 'italic',
  }
});

export default QuestionExplainer;