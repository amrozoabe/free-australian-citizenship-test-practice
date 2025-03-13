// src/components/quiz/InteractiveQuestionText.js
import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { useQuiz } from '../../contexts/QuizContext';
import keywords from '../../data/keywords.json';  // The import path remains the same

const InteractiveQuestionText = ({ questionText = '' }) => {  // Add default empty string
  const [selectedWord, setSelectedWord] = useState(null);
  const { state } = useQuiz();
  const fadeAnim = new Animated.Value(0);

  const handleWordPress = (word, keywordData) => {
    setSelectedWord(word);
    
    // Animate the definition
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderWords = () => {
    if (!questionText) return null;  // Guard clause for empty text
    
    const words = questionText.split(/\s+/);
    
    return words.map((word, index) => {
      if (!word) return null;  // Guard clause for empty word
      
      const cleanWord = word.replace(/[.,!?'"()]/g, '').toLowerCase();
      
      // This change accommodates the new format of keywords.json
      // It now handles both the old format (array of strings) and the new format (array of objects)
      const keywordData = Array.isArray(keywords) ? 
        keywords.find(k => {
          if (typeof k === 'string') {
            return k.toLowerCase() === cleanWord;
          } else if (k && k.word) {
            return k.word.toLowerCase() === cleanWord;
          }
          return false;
        }) : null;

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

    // This change accommodates the new format of keywords.json
    const keywordData = Array.isArray(keywords) ? 
      keywords.find(k => {
        if (typeof k === 'string') {
          return k.toLowerCase() === selectedWord.toLowerCase();
        } else if (k && k.word) {
          return k.word.toLowerCase() === selectedWord.toLowerCase();
        }
        return false;
      }) : null;

    if (!keywordData) return null;

    // The definition rendering now handles both the old and new format
    const definition = typeof keywordData === 'object' ? keywordData.definition : null;
    const translation = typeof keywordData === 'object' && keywordData.translations ? 
      keywordData.translations[state.settings.language] : null;

    return (
      <Animated.View style={[styles.definitionContainer, { opacity: fadeAnim }]}>
        <Text style={styles.definitionTitle}>Definition</Text>
        {definition ? (
          <Text style={styles.definitionText}>{definition}</Text>
        ) : (
          <Text style={styles.definitionText}>No definition available</Text>
        )}
        
        {translation && (
          <>
            <Text style={styles.translationTitle}>
              Translation ({state.settings.language})
            </Text>
            <Text style={styles.translationText}>
              {translation}
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