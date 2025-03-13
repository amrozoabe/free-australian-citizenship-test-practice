import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  Animated,
  Vibration,
  Alert,
  Modal
} from 'react-native';
import { useQuiz } from '../contexts/QuizContext';
import { questions } from '../data/questions';
import QuestionExplainer from '../components/quiz/QuestionExplainer';
import claudeService from '../services/claudeTranslationService';
import HelpModal from '../components/quiz/HelpModal';

function shuffleOptions(question) {
  const options = [...question.options];
  const correctOption = options[question.correct];
  
  // Shuffle the options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  
  // Find the new index of the correct answer
  const newCorrectIndex = options.indexOf(correctOption);
  
  return {
    ...question,
    options: options,
    correct: newCorrectIndex
  };
}

function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function getQuestionsForQuiz(allQuestions, mode, category) {
  // If in practice mode with a specific category, return questions from that section
  if (mode === 'practice' && category) {
    // Map category IDs to sections
    const categoryToSection = {
      'part1': 'Part 1: Australia and its people',
      'part2': 'Part 2: Australia\'s democratic beliefs, rights and liberties',
      'part3': 'Part 3: Government and the law in Australia',
      'part4': 'Part 4: Australian values'
    };
    
    const sectionName = categoryToSection[category];
    
    if (sectionName) {
      // Filter questions for this section and shuffle them
      const sectionQuestions = allQuestions.filter(q => q.section === sectionName);
      return shuffleArray(sectionQuestions).map(q => shuffleOptions(q));
    }
  }
  
  // For practice mode without category, return all shuffled questions
  if (mode === 'practice' && !category) {
    return shuffleArray(allQuestions).map(q => shuffleOptions(q));
  }
  
  // For a regular quiz, select 5 questions from each section
  if (mode === 'full' || mode === 'quiz') {
    const sections = [
      'Part 1: Australia and its people',
      'Part 2: Australia\'s democratic beliefs, rights and liberties',
      'Part 3: Government and the law in Australia',
      'Part 4: Australian values'
    ];
    
    // Group questions by section
    const questionsBySection = {};
    sections.forEach(section => {
      questionsBySection[section] = allQuestions.filter(q => q.section === section);
    });
    
    // Select and shuffle 5 questions from each section
    let selectedQuestions = [];
    sections.forEach(section => {
      const sectionQuestions = questionsBySection[section];
      const shuffledSectionQuestions = shuffleArray(sectionQuestions);
      selectedQuestions = [
        ...selectedQuestions,
        ...shuffledSectionQuestions.slice(0, 5)
      ];
    });
    
    // Shuffle the combined questions again to mix the sections
    return shuffleArray(selectedQuestions).map(q => shuffleOptions(q));
  }
  
  // Default: return all shuffled questions
  return shuffleArray(allQuestions).map(q => shuffleOptions(q));
}

export default function QuizScreen({ navigation, route }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [showQuestionList, setShowQuestionList] = useState(false);
  const [termsAnalysis, setTermsAnalysis] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  // Help modal state variables
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpTerms, setHelpTerms] = useState([]);
  const [isLoadingHelp, setIsLoadingHelp] = useState(false);
  
  const { state, dispatch } = useQuiz();
  const mode = route.params?.mode || 'full';
  const category = route.params?.category;

  useEffect(() => {
    // Get questions based on mode and category
    const selectedQuestions = getQuestionsForQuiz(questions, mode, category);
    
    // If in quiz mode, limit to 20 questions (which should be 5 from each section)
    const finalQuestions = (mode === 'full' || mode === 'quiz') && selectedQuestions.length > 20 
      ? selectedQuestions.slice(0, 20) 
      : selectedQuestions;
    
    setQuizQuestions(finalQuestions);
    
    // Initialize answers array
    setAnswers(new Array(finalQuestions.length).fill(null));
    
    // Log the number of questions for debugging
    console.log(`Quiz mode: ${mode}, category: ${category}, questions: ${finalQuestions.length}`);
  }, [mode, category]);

  // Function to handle the help button press
  const handleHelpPress = async () => {
    setShowHelpModal(true);
    setIsLoadingHelp(true);
    setHelpTerms([]);
    
    try {
      const currentQ = quizQuestions[currentQuestion];
      if (!currentQ) return;
      
      const questionText = typeof currentQ.question === 'string' 
        ? currentQ.question 
        : currentQ.question?.text || '';
      
      const result = await claudeService.analyzeQuestionAndOptions(
        questionText, 
        currentQ.options, 
        state.settings?.nativeLanguage || 'en'
      );
      
      // Set the terms for both the help modal and the question explanation section
      setHelpTerms(result.terms || []);
      setTermsAnalysis(result.terms || []);
    } catch (error) {
      console.error('Error getting help:', error);
      // Use fallback analysis if API call fails
      const currentQ = quizQuestions[currentQuestion];
      if (currentQ) {
        const questionText = typeof currentQ.question === 'string'
          ? currentQ.question
          : currentQ.question?.text || '';
        
        const fallbackResult = claudeService.getFallbackAnalysis(
          questionText + ' ' + currentQ.options.join(' '),
          state.settings?.nativeLanguage || 'en'
        );
        setHelpTerms(fallbackResult.terms || []);
        setTermsAnalysis(fallbackResult.terms || []);
      }
    } finally {
      setIsLoadingHelp(false);
    }
  };

  const handleAnswer = (selectedIndex) => {
    // Don't do anything if already answered in quiz mode
    if (mode !== 'practice' && answers[currentQuestion]) return;
    
    const isCorrect = selectedIndex === quizQuestions[currentQuestion].correct;
    
    if (isCorrect) {
      setScore(score + 1);
    } else if (state.settings?.vibrationEnabled) {
      Vibration.vibrate(200);
    }
  
    // Update answers array
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = {
      selectedIndex,
      isCorrect,
      question: quizQuestions[currentQuestion].question,
      selectedAnswer: quizQuestions[currentQuestion].options[selectedIndex],
      correctAnswer: quizQuestions[currentQuestion].options[quizQuestions[currentQuestion].correct]
    };
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      animateTransition();
      setCurrentQuestion(currentQuestion + 1);
      // Clear any existing terms analysis when moving to a new question
      setTermsAnalysis([]);
    } else if (mode === 'practice') {
      // In practice mode, go back to the first question
      animateTransition();
      setCurrentQuestion(0);
      setAnswers(new Array(quizQuestions.length).fill(null)); // Reset answers
      setTermsAnalysis([]);
    } else {
      // In quiz mode, go to results
      navigation.navigate('Result', { 
        score, 
        total: quizQuestions.length,
        answers
      });
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      animateTransition();
      setCurrentQuestion(currentQuestion - 1);
      // Clear any existing terms analysis when moving to a new question
      setTermsAnalysis([]);
    }
  };

  const handleQuestionSelect = (index) => {
    setShowQuestionList(false);
    animateTransition();
    setCurrentQuestion(index);
    // Clear any existing terms analysis when moving to a new question
    setTermsAnalysis([]);
  };

  const handleExit = () => {
    Alert.alert(
      'Exit Quiz',
      'Are you sure you want to exit? Your progress will not be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: () => navigation.navigate('Home') }
      ]
    );
  };

  const animateTransition = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Question List Modal
  const QuestionListModal = () => (
    <Modal
      visible={showQuestionList}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowQuestionList(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContent,
          { backgroundColor: state.settings?.theme === 'dark' ? '#333' : 'white' }
        ]}>
          <View style={styles.modalHeader}>
            <Text style={[
              styles.modalTitle,
              { color: state.settings?.theme === 'dark' ? '#fff' : '#1a1a1a' }
            ]}>
              Questions
            </Text>
            <TouchableOpacity onPress={() => setShowQuestionList(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.questionList}>
            {quizQuestions.map((q, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.questionItem,
                  currentQuestion === index && styles.currentQuestionItem,
                  answers[index] && styles.answeredQuestionItem
                ]}
                onPress={() => handleQuestionSelect(index)}
              >
                <Text style={[
                  styles.questionItemText,
                  { color: state.settings?.theme === 'dark' ? '#fff' : '#1a1a1a' }
                ]}>
                  {index + 1}. {typeof q.question === 'string' 
                    ? q.question.substring(0, 50) 
                    : q.question?.text?.substring(0, 50) || ''}...
                </Text>
                {answers[index] && (
                  <Text style={[
                    styles.questionStatus,
                    { color: answers[index].isCorrect ? '#34C759' : '#ff3b30' }
                  ]}>
                    {answers[index].isCorrect ? '✓' : '✗'}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (quizQuestions.length === 0) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const currentQuestionText = typeof quizQuestions[currentQuestion].question === 'string'
    ? quizQuestions[currentQuestion].question
    : quizQuestions[currentQuestion].question?.text || '';

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: state.settings?.theme === 'dark' ? '#1a1a1a' : '#f5f5f5' }
    ]}>
      <QuestionListModal />
      <HelpModal
        visible={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        isLoading={isLoadingHelp}
        terms={helpTerms}
        isDarkMode={state.settings?.theme === 'dark'}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
            <Text style={styles.exitButtonText}>Exit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setShowQuestionList(true)}
            style={styles.questionCounter}
          >
            <Text style={[
              styles.questionCounterText,
              { color: state.settings?.theme === 'dark' ? '#fff' : '#1a1a1a' }
            ]}>
              {currentQuestion + 1} / {quizQuestions.length}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.modeIndicator}>
            {mode === 'practice' ? '🎯 Practice' : '📝 Quiz'}
          </Text>
        </View>

        {/* Section indicator */}
        {quizQuestions[currentQuestion]?.section && (
          <Text style={[
            styles.sectionIndicator,
            { color: state.settings?.theme === 'dark' ? '#ccc' : '#666' }
          ]}>
            {quizQuestions[currentQuestion].section}
          </Text>
        )}

        {/* Question content */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={[
            styles.questionText,
            { color: state.settings?.theme === 'dark' ? '#fff' : '#1a1a1a' }
          ]}>
            {currentQuestionText}
          </Text>

          {/* Help button */}
          <TouchableOpacity 
            style={styles.helpButton}
            onPress={handleHelpPress}
          >
            <Text style={styles.helpButtonText}>Need Help? 🔍</Text>
          </TouchableOpacity>

          <View style={styles.optionsContainer}>
            {quizQuestions[currentQuestion].options.map((option, index) => (
              <TouchableOpacity
                key={`option-${index}`}
                style={[
                  styles.optionButton,
                  answers[currentQuestion]?.selectedIndex === index && styles.selectedOption,
                  answers[currentQuestion] && index === quizQuestions[currentQuestion].correct && 
                    styles.correctOption,
                  answers[currentQuestion]?.selectedIndex === index && 
                  !answers[currentQuestion].isCorrect && styles.wrongOption
                ]}
                onPress={() => handleAnswer(index)}
                disabled={mode !== 'practice' && Boolean(answers[currentQuestion])}
              >
                <Text style={[
                  styles.optionText,
                  { color: state.settings?.theme === 'dark' ? '#fff' : '#1a1a1a' }
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Explanation */}
          {answers[currentQuestion] && (
            <View style={styles.explanationContainer}>
              <Text style={[
                styles.explanationTitle,
                { color: state.settings?.theme === 'dark' ? '#fff' : '#1a1a1a' }
              ]}>
                Explanation:
              </Text>
              <Text style={[
                styles.explanationText,
                { color: state.settings?.theme === 'dark' ? '#ddd' : '#333' }
              ]}>
                {quizQuestions[currentQuestion].explanation}
              </Text>
            </View>
          )}
          
          {/* Terms analysis - only shown after "Need Help?" is clicked */}
          {termsAnalysis.length > 0 && (
            <QuestionExplainer 
              terms={termsAnalysis} 
              isLoading={isAnalyzing}
            />
          )}
        </Animated.View>

        {/* Navigation buttons */}
        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[styles.navButton, currentQuestion === 0 && styles.disabledButton]}
            onPress={handlePrevious}
            disabled={currentQuestion === 0}
          >
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>

          {(mode === 'practice' || answers[currentQuestion]) && (
            <TouchableOpacity 
              style={styles.navButton} 
              onPress={handleNext}
            >
              <Text style={styles.navButtonText}>
                {currentQuestion === quizQuestions.length - 1 && mode !== 'practice'
                  ? 'See Results'
                  : 'Next Question'
                }
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 60, // Extra padding for notch
    minHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  exitButton: {
    padding: 10,
  },
  exitButtonText: {
    color: '#ff3b30',
    fontSize: 16,
  },
  questionCounter: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  questionCounterText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modeIndicator: {
    fontSize: 16,
  },
  sectionIndicator: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 15,
    textAlign: 'center',
  },
  questionText: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
  },
  helpButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignSelf: 'flex-end',
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  optionsContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  optionText: {
    fontSize: 16,
  },
  selectedOption: {
    backgroundColor: '#e3f2fd',
    borderColor: '#007AFF',
  },
  correctOption: {
    backgroundColor: '#edf7ed',
    borderColor: '#4caf50',
  },
  wrongOption: {
    backgroundColor: '#fdecea',
    borderColor: '#f44336',
  },
  explanationContainer: {
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 22,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  navButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  navButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  questionList: {
    maxHeight: '90%',
  },
  questionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  currentQuestionItem: {
    backgroundColor: 'rgba(0,122,255,0.1)',
  },
  answeredQuestionItem: {
    opacity: 0.8,
  },
  questionItemText: {
    flex: 1,
    fontSize: 16,
  },
  questionStatus: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
});