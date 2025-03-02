import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
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

export default function StatisticsScreen({ navigation }) {
  const { state } = useQuiz();
  const { statistics, settings } = state;

  const handleExit = () => {
    navigation.navigate('Home');
  };

  const formatTime = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
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

      <ScrollView style={styles.scrollView}>
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
    paddingTop: 30,
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
  scrollView: {
    padding: 20,
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
  scoreDate: {
    fontSize: 14,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
});