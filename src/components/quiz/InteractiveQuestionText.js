// src/components/quiz/InteractiveQuestionText.js
import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { useQuiz } from '../../contexts/QuizContext';
import keywords from '../../data/keywords.json';

const InteractiveQuestionText = ({ questionText = '' }) => {  // Add default empty string
  const [selectedWord, setSelectedWord] = useState(null);
  const { state } = useQuiz();
  const fadeAnim = new Animated.Value(0);

  const renderWords = () => {
    if (!questionText) return null;  // Guard clause for empty text
    
    const words = questionText.split(/\s+/);
    
    return words.map((word, index) => {
      if (!word) return null;  // Guard clause for empty word
      
      const cleanWord = word.replace(/[.,!?'"()]/g, '').toLowerCase();
      const keywordData = keywords.find(k => k?.word?.toLowerCase() === cleanWord);

      return (
        <TouchableOpacity
          key={`${word}-${index}`}
          onPress={() => keywordData && handleWordPress(word, keywordData)}
          disabled={!keywordData}
        >
          <Text style={[
            styles.word,
            keywordData && styles.highlightedWord,
            selectedWord === word && styles.selectedWord
          ]}>
            {word}{' '}
          </Text>
        </TouchableOpacity>
      );
    });
  };

  const renderDefinition = () => {
    if (!selectedWord) return null;

    const keywordData = keywords.find(
      k => k.word.toLowerCase() === selectedWord.toLowerCase()
    );

    if (!keywordData) return null;

    return (
      <Animated.View style={[styles.definitionContainer, { opacity: fadeAnim }]}>
        <Text style={styles.definitionTitle}>Definition</Text>
        <Text style={styles.definitionText}>{keywordData.definition}</Text>
        
        {keywordData.translations[state.settings.language] && (
          <>
            <Text style={styles.translationTitle}>
              Translation ({state.settings.language})
            </Text>
            <Text style={styles.translationText}>
              {keywordData.translations[state.settings.language]}
            </Text>
          </>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        {renderWords()}
      </View>
      {renderDefinition()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  textContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  word: {
    fontSize: 16,
    lineHeight: 24,
  },
  highlightedWord: {
    textDecorationLine: 'underline',
    color: '#2196F3',
  },
  selectedWord: {
    backgroundColor: '#E3F2FD',
  },
  definitionContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  definitionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  definitionText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  translationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 8,
  },
  translationText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  }
});

export default InteractiveQuestionText;