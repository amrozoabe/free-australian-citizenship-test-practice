import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { useQuiz } from '../contexts/QuizContext';

const StatCard = ({ title, value, suffix = '', theme }) => (
  <View style={[
    styles.statCard,
    { backgroundColor: theme === 'dark' ? '#333' : 'white' }
  ]}>
    <Text style={[
      styles.statValue,
      { color: theme === 'dark' ? '#fff' : '#1a1a1a' }
    ]}>
      {value}{suffix}
    </Text>
    <Text style={[
      styles.statTitle,
      { color: theme === 'dark' ? '#ccc' : '#666' }
    ]}>
      {title}
    </Text>
  </View>
);

const PassRateStat = ({ scores, theme }) => {
  // Calculate pass rate
  const totalAttempts = scores.length;
  const passedAttempts = scores.filter(score => score.passed).length;
  const passRate = totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0;
  
  return (
    <View style={[
      styles.passRateCard,
      { backgroundColor: theme === 'dark' ? '#333' : 'white' }
    ]}>
      <Text style={[
        styles.passRateTitle,
        { color: theme === 'dark' ? '#fff' : '#1a1a1a' }
      ]}>
        Quiz Pass Rate
      </Text>
      
      <View style={styles.passRateContainer}>
        <View style={styles.passRateCircle}>
          <Text style={styles.passRateValue}>
            {passRate.toFixed(0)}%
          </Text>
          <Text style={styles.passRateDetail}>
            {passedAttempts}/{totalAttempts}
          </Text>
        </View>
        
        <View style={styles.passRateInfo}>
          <Text style={[
            styles.passRateInfoText,
            { color: theme === 'dark' ? '#ccc' : '#666' }
          ]}>
            To pass: 
          </Text>
          <Text style={[
            styles.passRequirement,
            { color: theme === 'dark' ? '#fff' : '#1a1a1a' }
          ]}>
            • All values questions correct
          </Text>
          <Text style={[
            styles.passRequirement,
            { color: theme === 'dark' ? '#fff' : '#1a1a1a' }
          ]}>
            • At least 75% overall score
          </Text>
        </View>
      </View>
    </View>
  );
};

const CategoryPerformance = ({ stats, theme }) => {
  // Get data for all categories
  const categoryData = Object.keys(stats).map(category => ({
    category: getCategoryShortName(category),
    accuracy: stats[category].accuracy || 0,
    total: stats[category].total || 0,
    correct: stats[category].correct || 0,
    isValues: category.includes('values')
  })).filter(item => item.total > 0); // Only show categories with data
  
  if (categoryData.length === 0) {
    return (
      <View style={[
        styles.emptySection,
        { backgroundColor: theme === 'dark' ? '#333' : 'white' }
      ]}>
        <Text style={{ color: theme === 'dark' ? '#ccc' : '#666' }}>
          No category data available yet. Complete some quizzes to see your performance by category.
        </Text>
      </View>
    );
  }
  
  return (
    <View style={[
      styles.categoryContainer,
      { backgroundColor: theme === 'dark' ? '#333' : 'white' }
    ]}>
      {categoryData.map((data, index) => (
        <View key={index} style={styles.categoryItem}>
          <View style={styles.categoryHeader}>
            <View style={styles.categoryTitleContainer}>
              <Text style={[
                styles.categoryName,
                { color: theme === 'dark' ? '#fff' : '#1a1a1a' }
              ]}>
                {data.category}
              </Text>
              {data.isValues && (
                <Text style={styles.importantCategory}> (Important)</Text>
              )}
            </View>
            <View style={styles.statsNumbers}>
              <Text style={[
                styles.categoryAccuracy,
                { color: getAccuracyColor(data.accuracy, theme) }
              ]}>
                {data.accuracy}%
              </Text>
              <Text style={[
                styles.categoryCount,
                { color: theme === 'dark' ? '#aaa' : '#777' }
              ]}>
                {data.correct}/{data.total}
              </Text>
            </View>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${data.accuracy}%`, backgroundColor: getAccuracyColor(data.accuracy, theme) }
              ]} 
            />
          </View>
        </View>
      ))}
    </View>
  );
};

// Helper function to get color based on accuracy percentage
const getAccuracyColor = (accuracy, theme) => {
  if (accuracy >= 80) return '#4CAF50'; // Green
  if (accuracy >= 60) return '#FFC107'; // Yellow
  return '#F44336'; // Red
};

// Helper function to shorten category names
const getCategoryShortName = (category) => {
  const parts = {
    'Part 1: Australia and its people': 'Part 1',
    'Part 2: Australia\'s democratic beliefs, rights and liberties': 'Part 2',
    'Part 3: Government and the law in Australia': 'Part 3',
    'Part 4: Australian values': 'Part 4'
  };
  
  return parts[category] || category;
};

const ActivityCalendar = ({ dailyActivity, theme }) => {
  // Convert data format for display
  const days = Object.keys(dailyActivity).sort((a, b) => 
    new Date(a) - new Date(b)
  ).slice(-7); // Get last 7 days
  
  if (days.length === 0) {
    return (
      <View style={[
        styles.emptySection,
        { backgroundColor: theme === 'dark' ? '#333' : 'white' }
      ]}>
        <Text style={{ color: theme === 'dark' ? '#ccc' : '#666' }}>
          No activity data available yet.
        </Text>
      </View>
    );
  }
  
  // Find max questions in a day for scaling
  const maxQuestions = Math.max(
    ...days.map(day => dailyActivity[day].questions || 0),
    5 // Min scale to make small numbers visible
  );
  
  return (
    <View style={[
      styles.activityContainer,
      { backgroundColor: theme === 'dark' ? '#333' : 'white' }
    ]}>
      <View style={styles.graphContainer}>
        {days.map((day, index) => {
          const data = dailyActivity[day];
          const height = data.questions > 0 
            ? (data.questions / maxQuestions) * 100 
            : 0;
          
          const accuracy = data.questions > 0
            ? Math.round((data.correct / data.questions) * 100)
            : 0;
          
          return (
            <View key={index} style={styles.dayColumn}>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.activityBar, 
                    { 
                      height: `${height}%`,
                      backgroundColor: data.questions > 0 
                        ? getAccuracyColor(accuracy, theme) 
                        : theme === 'dark' ? '#555' : '#ddd'
                    }
                  ]} 
                />
              </View>
              <Text style={[
                styles.dayLabel,
                { color: theme === 'dark' ? '#ccc' : '#666' }
              ]}>
                {formatDayLabel(day)}
              </Text>
              <Text style={[
                styles.questionCount,
                { color: theme === 'dark' ? '#aaa' : '#888' }
              ]}>
                {data.questions}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// Format date to day of week
const formatDayLabel = (dateStr) => {
  const date = new Date(dateStr);
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
};

// Format time in hours and minutes
const formatTime = (minutes) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hrs ? `${hrs}h ${mins}m` : `${mins}m`;
};

// Format date string
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

export default function StatisticsScreen({ navigation }) {
  const { state } = useQuiz();
  const { statistics, settings } = state;
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'categories', 'activity'

  const handleExit = () => {
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: settings.theme === 'dark' ? '#1a1a1a' : '#f5f5f5' }
    ]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
          <Text style={styles.exitButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={[
          styles.headerTitle,
          { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
        ]}>
          Statistics
        </Text>
        <View style={styles.exitButton} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'overview' && styles.activeTab,
            { backgroundColor: settings.theme === 'dark' ? '#333' : 'white' }
          ]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'overview' && styles.activeTabText,
            { color: settings.theme === 'dark' ? '#ccc' : '#666' }
          ]}>
            Overview
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'categories' && styles.activeTab,
            { backgroundColor: settings.theme === 'dark' ? '#333' : 'white' }
          ]}
          onPress={() => setActiveTab('categories')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'categories' && styles.activeTabText,
            { color: settings.theme === 'dark' ? '#ccc' : '#666' }
          ]}>
            Categories
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'activity' && styles.activeTab,
            { backgroundColor: settings.theme === 'dark' ? '#333' : 'white' }
          ]}
          onPress={() => setActiveTab('activity')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'activity' && styles.activeTabText,
            { color: settings.theme === 'dark' ? '#ccc' : '#666' }
          ]}>
            Activity
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {activeTab === 'overview' && (
          <>
            {/* Pass Rate Card */}
            <PassRateStat 
              scores={state.scores} 
              theme={settings.theme} 
            />
            
            <View style={styles.statsGrid}>
              <StatCard
                title="Questions Answered"
                value={statistics.totalQuestions || 0}
                theme={settings.theme}
              />
              <StatCard
                title="Average Score"
                value={Math.round(statistics.averageScore || 0)}
                suffix="%"
                theme={settings.theme}
              />
              <StatCard
                title="Best Score"
                value={Math.round(statistics.bestScore || 0)}
                suffix="%"
                theme={settings.theme}
              />
              <StatCard
                title="Study Streak"
                value={statistics.streakDays || 0}
                suffix=" days"
                theme={settings.theme}
              />
              <StatCard
                title="Time Spent"
                value={formatTime(statistics.timeSpent || 0)}
                theme={settings.theme}
              />
              <StatCard
                title="Quiz Attempts"
                value={statistics.totalQuizAttempts || 0}
                theme={settings.theme}
              />
            </View>

            <Text style={[
              styles.sectionTitle,
              { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
            ]}>
              Recent Activity
            </Text>

            {state.scores && state.scores.length > 0 ? (
              <View style={styles.recentScores}>
                {state.scores.slice(-5).reverse().map((score, index) => (
                  <View
                    key={index}
                    style={[
                      styles.scoreCard,
                      { backgroundColor: settings.theme === 'dark' ? '#333' : 'white' }
                    ]}
                  >
                    <View style={styles.scoreCardLeft}>
                      <Text style={[
                        styles.scoreDate,
                        { color: settings.theme === 'dark' ? '#ccc' : '#666' }
                      ]}>
                        {formatDate(score.date)}
                      </Text>
                      <Text style={[
                        styles.scoreValue,
                        { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
                      ]}>
                        {score.score}/{score.total} ({Math.round((score.score / score.total) * 100)}%)
                      </Text>
                    </View>
                    {score.passed !== undefined && (
                      <View style={[
                        styles.passedBadge,
                        { backgroundColor: score.passed ? '#4CAF50' : '#F44336' }
                      ]}>
                        <Text style={styles.passedText}>
                          {score.passed ? 'PASSED' : 'FAILED'}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[
                styles.emptyText,
                { color: settings.theme === 'dark' ? '#ccc' : '#666' }
              ]}>
                No quiz attempts yet
              </Text>
            )}
          </>
        )}

        {activeTab === 'categories' && (
          <>
            <Text style={[
              styles.sectionTitle,
              { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
            ]}>
              Performance by Category
            </Text>
            
            <View style={styles.categoryNote}>
              <View style={styles.noteDot} />
              <Text style={[
                styles.noteText,
                { color: settings.theme === 'dark' ? '#ccc' : '#666' }
              ]}>
                Part 4 (Australian values) questions must all be correct to pass
              </Text>
            </View>
            
            <CategoryPerformance 
              stats={statistics.categoryStats} 
              theme={settings.theme} 
            />
          </>
        )}

        {activeTab === 'activity' && (
          <>
            <Text style={[
              styles.sectionTitle,
              { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
            ]}>
              Last 7 Days Activity
            </Text>
            
            <ActivityCalendar 
              dailyActivity={statistics.dailyActivity || {}} 
              theme={settings.theme} 
            />
            
            <View style={[
              styles.weeklySummary,
              { backgroundColor: settings.theme === 'dark' ? '#333' : 'white' }
            ]}>
              <Text style={[
                styles.summaryText,
                { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
              ]}>
                Questions this week: <Text style={styles.highlightText}>{statistics.lastWeekQuestions || 0}</Text>
              </Text>
              {statistics.lastStudyDate && (
                <Text style={[
                  styles.summaryText,
                  { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
                ]}>
                  Last study date: <Text style={styles.highlightText}>{formatDate(statistics.lastStudyDate)}</Text>
                </Text>
              )}
            </View>
          </>
        )}
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
    paddingTop: 50, // Extra padding for notch
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
  // Tab navigation
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 15,
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    width: '48%',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statTitle: {
    fontSize: 14,
  },
  // Pass Rate Card styles
  passRateCard: {
    width: '100%',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  passRateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  passRateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passRateCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  passRateValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  passRateDetail: {
    fontSize: 14,
    color: '#666',
  },
  passRateInfo: {
    flex: 1,
  },
  passRateInfoText: {
    fontSize: 16,
    marginBottom: 8,
  },
  passRequirement: {
    fontSize: 14,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  recentScores: {
    marginBottom: 20,
  },
  scoreCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scoreCardLeft: {
    flex: 1,
  },
  scoreDate: {
    fontSize: 14,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  passedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  passedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
  // Category performance styles
  categoryContainer: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  categoryNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  noteDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff9500',
    marginRight: 8,
  },
  noteText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  categoryItem: {
    marginBottom: 15,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
  },
  importantCategory: {
    fontSize: 14,
    fontWeight: '400',
    fontStyle: 'italic',
    color: '#ff9500', // Orange for importance
  },
  statsNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryAccuracy: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  categoryCount: {
    fontSize: 14,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  emptySection: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  // Activity calendar styles
  activityContainer: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  graphContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    width: '60%',
    height: '80%',
    justifyContent: 'flex-end',
  },
  activityBar: {
    width: '100%',
    minHeight: 5,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  dayLabel: {
    fontSize: 12,
    marginTop: 5,
  },
  questionCount: {
    fontSize: 10,
  },
  weeklySummary: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 5,
  },
  highlightText: {
    color: '#007AFF',
    fontWeight: '600',
  }
});