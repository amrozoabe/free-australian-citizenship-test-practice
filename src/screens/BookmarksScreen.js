import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useQuiz } from '../contexts/QuizContext';
import FeedbackButton from '../components/SimpleFeedbackButton';

export default function BookmarksScreen({ navigation }) {
  // Use try-catch for importing questions to handle possible import errors
  let questions = [];
  try {
    const questionsModule = require('../data/questions');
    questions = questionsModule.questions || [];
  } catch (error) {
    console.error('Error loading questions:', error);
  }

  const { state, dispatch } = useQuiz();
  const { bookmarks, settings } = state;

  const handleExit = () => {
    navigation.navigate('Home');
  };

  // Filter questions to find bookmarked ones - with safety checks
  const bookmarkedQuestions = Array.isArray(questions) && Array.isArray(bookmarks) 
    ? questions.filter(q => q && bookmarks.includes(q.id))
    : [];

  const handleRemoveBookmark = (questionId) => {
    dispatch({
      type: 'TOGGLE_BOOKMARK',
      payload: questionId
    });
    
    // Show feedback to the user
    Alert.alert(
      "Bookmark Removed",
      "This question has been removed from your bookmarks.",
      [{ text: "OK" }]
    );
  };

  // Component for a single question card - with null checks throughout
  const QuestionCard = ({ question }) => {
    if (!question) return null;
    
    return (
      <View style={[
        styles.card,
        { backgroundColor: settings?.theme === 'dark' ? '#333' : 'white' }
      ]}>
        <View style={styles.cardHeader}>
          <Text style={[
            styles.questionText,
            { color: settings?.theme === 'dark' ? '#fff' : '#1a1a1a' }
          ]}>
            {typeof question.question === 'string' ? question.question : 'No question text'}
          </Text>
          <TouchableOpacity
            style={styles.bookmarkButton}
            onPress={() => handleRemoveBookmark(question.id)}
          >
            <Text style={styles.bookmarkIcon}>🔖</Text>
          </TouchableOpacity>
        </View>

        {Array.isArray(question.options) && (
          <View style={styles.optionsContainer}>
            {question.options.map((option, index) => (
              <View
                key={index}
                style={[
                  styles.optionItem,
                  question.correct !== undefined && index === question.correct && styles.correctOption,
                ]}
              >
                <Text style={[
                  styles.optionText,
                  question.correct !== undefined && index === question.correct && styles.correctOptionText,
                  { color: settings?.theme === 'dark' ? '#fff' : '#1a1a1a' }
                ]}>
                  {option || 'No option text'}
                </Text>
                {question.correct !== undefined && index === question.correct && (
                  <Text style={styles.correctBadge}>✓</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {question.explanation && (
          <Text style={[
            styles.explanationText,
            { color: settings?.theme === 'dark' ? '#ccc' : '#666' }
          ]}>
            {question.explanation}
          </Text>
        )}
      </View>
    );
  };

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
          styles.title,
          { color: settings?.theme === 'dark' ? '#fff' : '#1a1a1a' }
        ]}>
          Bookmarks
        </Text>
        <View style={styles.exitButton}>
          {/* Empty view for flex spacing - ensure no raw text here */}
        </View>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerContent}>
          <Text style={[
            styles.subtitle,
            { color: settings?.theme === 'dark' ? '#fff' : '#1a1a1a' }
          ]}>
            Bookmarked Questions
          </Text>
          <Text style={[
            styles.subtitleCount,
            { color: settings?.theme === 'dark' ? '#ccc' : '#666' }
          ]}>
            {bookmarkedQuestions.length} saved questions
          </Text>
        </View>

        {bookmarkedQuestions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[
              styles.emptyText,
              { color: settings?.theme === 'dark' ? '#ccc' : '#666' }
            ]}>
              No bookmarked questions yet.{'\n'}
              Bookmark questions during practice to review them later.
            </Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => navigation.navigate('Quiz')}
            >
              <Text style={styles.startButtonText}>Start Practicing</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cardsContainer}>
            {bookmarkedQuestions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </View>
        )}
      </ScrollView>
      <FeedbackButton />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 10,
  },
  headerContent: {
    padding: 20,
    paddingTop: 0,
  },
  exitButton: {
    width: 80, // Fixed width for balanced spacing
  },
  exitButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitleCount: {
    fontSize: 16,
    marginBottom: 20,
  },
  cardsContainer: {
    padding: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
  },
  bookmarkButton: {
    padding: 5,
  },
  bookmarkIcon: {
    fontSize: 20,
  },
  optionsContainer: {
    marginBottom: 15,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  correctOption: {
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
  },
  correctOptionText: {
    color: '#34C759',
    fontWeight: '600',
  },
  correctBadge: {
    color: '#34C759',
    fontSize: 16,
    fontWeight: 'bold',
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});