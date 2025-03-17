import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useQuiz } from '../contexts/QuizContext';

export default function ResultScreen({ route, navigation }) {
  const { score, total, answers = [] } = route.params;
  const percentage = Math.round((score / total) * 100);
  const { state, dispatch } = useQuiz();
  
  // State for values questions results
  const [valuesQuestions, setValuesQuestions] = useState([]);
  const [allValuesCorrect, setAllValuesCorrect] = useState(false);
  const [isPassing, setIsPassing] = useState(false);
  
  // Check if the user has passed the test
  useEffect(() => {
    // Extract values questions (Part 4)
    const values = answers.filter(answer => 
      answer.section === 'Part 4: Australian values'
    );
    
    setValuesQuestions(values);
    
    // Check if all values questions are answered correctly
    const allValuesCorrect = values.length > 0 && 
                           values.every(answer => answer.isCorrect);
    
    setAllValuesCorrect(allValuesCorrect);
    
    // Determine if the user has passed: all values questions correct AND at least 75% overall
    const isPassing = allValuesCorrect && percentage >= 75;
    
    setIsPassing(isPassing);
  }, [answers, percentage]);
  
  useEffect(() => {
    if (answers.length > 0) {
      // Process answers to extract category statistics
      const categoryCounts = {};
      
      // Tally answers by category
      answers.forEach(answer => {
        if (answer.section) {
          if (!categoryCounts[answer.section]) {
            categoryCounts[answer.section] = { total: 0, correct: 0 };
          }
          
          categoryCounts[answer.section].total += 1;
          if (answer.isCorrect) {
            categoryCounts[answer.section].correct += 1;
          }
        }
      });
      
      // Calculate time spent (for now just estimating 30 seconds per question)
      const timeSpent = Math.round(total * 0.5); // Time in minutes
      
      // Add the score to the user's history
      dispatch({
        type: 'ADD_SCORE',
        payload: {
          score,
          total,
          percentage,
          date: new Date().toISOString(),
          timeSpent,
          categoryResults: categoryCounts, // Add category data
          passed: isPassing // Add passing status
        }
      });
      
      // Mark individual questions as completed
      answers.forEach(answer => {
        if (answer.questionId) {
          dispatch({
            type: 'MARK_QUESTION_COMPLETED',
            payload: {
              questionId: answer.questionId,
              correct: answer.isCorrect,
              section: answer.section // Include the section
            }
          });
        }
      });
    }
  }, [isPassing]);

  const getResultMessage = () => {
    if (isPassing) {
      return "Congratulations! You've passed the test by answering all values questions correctly and scoring at least 75% overall.";
    } else if (!allValuesCorrect && percentage >= 75) {
      return "You scored above 75%, but you didn't answer all values questions correctly. To pass the official test, you must answer all five values questions correctly.";
    } else if (allValuesCorrect && percentage < 75) {
      return "You answered all values questions correctly, but you need to score at least 75% overall to pass. Keep practicing!";
    } else {
      return "To pass the official test, you need to answer all five values questions correctly and score at least 75% overall. Keep practicing!";
    }
  };

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: state.settings?.theme === 'dark' ? '#1a1a1a' : '#f5f5f5' }
    ]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={[
            styles.title,
            { color: state.settings?.theme === 'dark' ? '#fff' : '#1a1a1a' }
          ]}>
            Quiz Results
          </Text>
        </View>
        
        <View style={[
          styles.scoreContainer,
          { backgroundColor: state.settings?.theme === 'dark' ? '#333' : 'white' }
        ]}>
          <Text style={[
            styles.resultLabel,
            { 
              color: isPassing ? '#4CAF50' : '#F44336'
            }
          ]}>
            {isPassing ? 'PASSED' : 'NOT PASSED'}
          </Text>
          <Text style={styles.scoreText}>
            {score} / {total}
          </Text>
          <Text style={styles.percentageText}>
            {percentage}%
          </Text>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  width: `${percentage}%`,
                  backgroundColor: percentage >= 75 ? '#4CAF50' : percentage >= 50 ? '#FFC107' : '#F44336'
                }
              ]} 
            />
          </View>
          
          {/* Values questions requirement */}
          <View style={styles.valuesRequirement}>
            <Text style={styles.requirementLabel}>Values Questions:</Text>
            <Text style={[
              styles.requirementStatus,
              { color: allValuesCorrect ? '#4CAF50' : '#F44336' }
            ]}>
              {allValuesCorrect 
                ? 'All Correct ✓' 
                : `${valuesQuestions.filter(q => q.isCorrect).length}/${valuesQuestions.length} Correct ✗`}
            </Text>
          </View>
          
          <View style={styles.valuesRequirement}>
            <Text style={styles.requirementLabel}>Overall Score:</Text>
            <Text style={[
              styles.requirementStatus,
              { color: percentage >= 75 ? '#4CAF50' : '#F44336' }
            ]}>
              {percentage >= 75 
                ? 'At least 75% ✓' 
                : 'Below 75% ✗'}
            </Text>
          </View>
        </View>

        <Text style={[
          styles.message,
          { color: state.settings?.theme === 'dark' ? '#ccc' : '#666' }
        ]}>
          {getResultMessage()}
        </Text>

        {/* Category breakdown */}
        <Text style={[
          styles.sectionTitle,
          { color: state.settings?.theme === 'dark' ? '#fff' : '#1a1a1a' }
        ]}>
          Performance by Category
        </Text>
        
        <CategoryBreakdown answers={answers} theme={state.settings?.theme} />

        <Text style={[
          styles.reviewTitle,
          { color: state.settings?.theme === 'dark' ? '#fff' : '#1a1a1a' }
        ]}>
          Question Review
        </Text>

        {answers.map((answer, index) => (
          <View 
            key={index}
            style={[
              styles.questionReview,
              { backgroundColor: state.settings?.theme === 'dark' ? '#333' : 'white' },
              // Highlight values questions
              answer.section === 'Part 4: Australian values' && styles.valuesQuestion
            ]}
          >
            {answer.section === 'Part 4: Australian values' && (
              <View style={styles.valuesBadge}>
                <Text style={styles.valuesBadgeText}>Values Question</Text>
              </View>
            )}
            
            <Text style={[
              styles.questionText,
              { color: state.settings?.theme === 'dark' ? '#fff' : '#1a1a1a' }
            ]}>
              {index + 1}. {answer.question}
            </Text>
            
            <View style={styles.answerContainer}>
              <Text style={[
                styles.answerLabel,
                { color: state.settings?.theme === 'dark' ? '#ccc' : '#666' }
              ]}>
                Your answer:
              </Text>
              <Text style={[
                styles.answerText,
                !answer.isCorrect && styles.wrongAnswer,
                answer.isCorrect && styles.correctAnswer,
                { color: state.settings?.theme === 'dark' ? '#fff' : '#1a1a1a' }
              ]}>
                {answer.selectedAnswer}
              </Text>
            </View>

            {!answer.isCorrect && (
              <View style={styles.answerContainer}>
                <Text style={[
                  styles.answerLabel,
                  { color: state.settings?.theme === 'dark' ? '#ccc' : '#666' }
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

// Category Breakdown Component
const CategoryBreakdown = ({ answers, theme }) => {
  if (!answers || answers.length === 0) return null;
  
  // Group answers by section/category
  const categories = {};
  
  answers.forEach(answer => {
    const section = answer.section || 'Uncategorized';
    
    if (!categories[section]) {
      categories[section] = { total: 0, correct: 0 };
    }
    
    categories[section].total += 1;
    if (answer.isCorrect) {
      categories[section].correct += 1;
    }
  });
  
  // Convert to array for rendering
  const categoryData = Object.keys(categories).map(section => ({
    name: getShortCategoryName(section),
    fullName: section,
    total: categories[section].total,
    correct: categories[section].correct,
    percentage: Math.round((categories[section].correct / categories[section].total) * 100)
  }));
  
  if (categoryData.length === 0) return null;
  
  return (
    <View style={[
      styles.categoryBreakdown,
      { backgroundColor: theme === 'dark' ? '#333' : 'white' }
    ]}>
      {categoryData.map((category, index) => (
        <View key={index} style={styles.categoryItem}>
          <View style={styles.categoryHeader}>
            <Text style={[
              styles.categoryName,
              { color: theme === 'dark' ? '#fff' : '#1a1a1a' }
            ]}>
              {category.name}
              {category.fullName.includes('values') && (
                <Text style={styles.importantBadge}> (Important)</Text>
              )}
            </Text>
            <Text style={[
              styles.categoryPercentage,
              { 
                color: getCategoryColor(category.percentage) 
              }
            ]}>
              {category.percentage}%
            </Text>
          </View>
          
          <View style={styles.categoryDetails}>
            <Text style={[
              styles.categoryScore,
              { color: theme === 'dark' ? '#ccc' : '#666' }
            ]}>
              {category.correct}/{category.total} correct
            </Text>
            
            <View style={styles.miniProgressContainer}>
              <View 
                style={[
                  styles.miniProgress, 
                  { 
                    width: `${category.percentage}%`,
                    backgroundColor: getCategoryColor(category.percentage)
                  }
                ]} 
              />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

// Helper to get shorter category names
const getShortCategoryName = (fullName) => {
  const shortNames = {
    'Part 1: Australia and its people': 'Australia & its people',
    'Part 2: Australia\'s democratic beliefs, rights and liberties': 'Democratic beliefs',
    'Part 3: Government and the law in Australia': 'Government & law',
    'Part 4: Australian values': 'Australian values'
  };
  
  return shortNames[fullName] || fullName;
};

// Helper to get color based on score percentage
const getCategoryColor = (percentage) => {
  if (percentage >= 75) return '#4CAF50'; // Green
  if (percentage >= 50) return '#FFC107'; // Yellow
  return '#F44336'; // Red
};

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
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resultLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  percentageText: {
    fontSize: 24,
    color: '#666',
    marginBottom: 10,
  },
  progressBarContainer: {
    width: '100%',
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 15,
  },
  progressBar: {
    height: '100%',
  },
  valuesRequirement: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 5,
    marginVertical: 5,
  },
  requirementLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  requirementStatus: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 25,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 15,
    marginTop: 10,
  },
  // Category breakdown styles
  categoryBreakdown: {
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryItem: {
    marginBottom: 15,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
  },
  importantBadge: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#ff9500', // Orange color for emphasis
  },
  categoryPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryDetails: {
    marginTop: 5,
  },
  categoryScore: {
    fontSize: 14,
    marginBottom: 5,
  },
  miniProgressContainer: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  miniProgress: {
    height: '100%',
  },
  // Question review styles
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
  valuesQuestion: {
    borderLeftWidth: 4,
    borderLeftColor: '#ff9500', // Orange border for values questions
  },
  valuesBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ff9500',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  valuesBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    marginRight: 80, // Make room for the badge
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
    color: '#F44336',
  },
  correctAnswer: {
    color: '#4CAF50',
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