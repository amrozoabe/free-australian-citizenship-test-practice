import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useQuiz } from '../contexts/QuizContext';

export default function ResultScreen({ route, navigation }) {
  const { score, total, answers = [] } = route.params;
  const percentage = Math.round((score / total) * 100);
  const { state } = useQuiz();

  const getResultMessage = () => {
    if (percentage >= 75) {
      return "Congratulations! You're well prepared for the citizenship test!";
    } else if (percentage >= 50) {
      return "Good effort! With a bit more practice, you'll be ready for the test.";
    } else {
      return "Keep practicing! Review the materials and try again.";
    }
  };

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: state.theme === 'dark' ? '#1a1a1a' : '#f5f5f5' }
    ]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={[
            styles.title,
            { color: state.theme === 'dark' ? '#fff' : '#1a1a1a' }
          ]}>
            Quiz Results
          </Text>
        </View>
        
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>
            {score} / {total}
          </Text>
          <Text style={styles.percentageText}>
            {percentage}%
          </Text>
        </View>

        <Text style={styles.message}>{getResultMessage()}</Text>

        <Text style={[
          styles.reviewTitle,
          { color: state.theme === 'dark' ? '#fff' : '#1a1a1a' }
        ]}>
          Question Review
        </Text>

        {answers.map((answer, index) => (
          <View 
            key={index}
            style={[
              styles.questionReview,
              { backgroundColor: state.theme === 'dark' ? '#333' : 'white' }
            ]}
          >
            <Text style={[
              styles.questionText,
              { color: state.theme === 'dark' ? '#fff' : '#1a1a1a' }
            ]}>
              {index + 1}. {answer.question}
            </Text>
            
            <View style={styles.answerContainer}>
              <Text style={[
                styles.answerLabel,
                { color: state.theme === 'dark' ? '#ccc' : '#666' }
              ]}>
                Your answer:
              </Text>
              <Text style={[
                styles.answerText,
                !answer.isCorrect && styles.wrongAnswer,
                { color: state.theme === 'dark' ? '#fff' : '#1a1a1a' }
              ]}>
                {answer.selectedAnswer}
              </Text>
            </View>

            {!answer.isCorrect && (
              <View style={styles.answerContainer}>
                <Text style={[
                  styles.answerLabel,
                  { color: state.theme === 'dark' ? '#ccc' : '#666' }
                ]}>
                  Correct answer:
                </Text>
                <Text style={[
                  styles.answerText,
                  styles.correctAnswer
                ]}>
                  {answer.correctAnswer}
                </Text>
              </View>
            )}
          </View>
        ))}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.retryButton]}
            onPress={() => navigation.navigate('Quiz')}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.homeButton]}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.buttonText}>Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  scoreContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  percentageText: {
    fontSize: 24,
    color: '#666',
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginHorizontal: 20,
    marginBottom: 30,
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  questionReview: {
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  answerContainer: {
    marginTop: 5,
  },
  answerLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  answerText: {
    fontSize: 16,
    paddingVertical: 5,
  },
  wrongAnswer: {
    color: '#ff3b30',
  },
  correctAnswer: {
    color: '#34C759',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    marginTop: 10,
  },
  button: {
    flex: 1,
    margin: 10,
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
  },
  homeButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});