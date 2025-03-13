import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useQuiz } from '../contexts/QuizContext';
import LanguageSelector from '../components/LanguageSelector';

export default function HomeScreen({ navigation }) {
  const { state } = useQuiz();
  const { statistics, settings } = state;

  const MenuButton = ({ title, icon, onPress, color = '#007AFF' }) => (
    <TouchableOpacity 
      style={[styles.menuButton, { backgroundColor: color }]} 
      onPress={onPress}
    >
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuButtonText}>{title}</Text>
    </TouchableOpacity>
  );

  const StatItem = ({ value, label }) => (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: settings.theme === 'dark' ? '#1a1a1a' : '#f5f5f5' }
    ]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={[
            styles.title,
            { color: settings.theme === 'dark' ? '#fff' : '#1a1a1a' }
          ]}>
            Australian Citizenship Test Practice
          </Text>
          <Text style={[
            styles.subtitle,
            { color: settings.theme === 'dark' ? '#ccc' : '#666' }
          ]}>
            Prepare for your citizenship test with our practice questions
          </Text>
        </View>
        <LanguageSelector />
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <StatItem 
            value={statistics.totalQuestions} 
            label="Questions Answered"
          />
          <StatItem 
            value={`${Math.round(statistics.averageScore)}%`} 
            label="Average Score"
          />
          <StatItem 
            value={statistics.streakDays} 
            label="Day Streak"
          />
        </View>

        {/* Main Menu */}
        <View style={styles.menuGrid}>
          <MenuButton
            title="Start Quiz"
            icon="📝"
            onPress={() => navigation.navigate('Quiz')}
            color="#007AFF"
          />
          <MenuButton
            title="Study Materials"
            icon="📚"
            onPress={() => navigation.navigate('Study')}
            color="#34C759"
          />
          <MenuButton
            title="Statistics"
            icon="📊"
            onPress={() => navigation.navigate('Statistics')}
            color="#5856D6"
          />
          <MenuButton
            title="Bookmarks"
            icon="🔖"
            onPress={() => navigation.navigate('Bookmarks')}
            color="#FF9500"
          />
          <MenuButton
            title="Settings"
            icon="⚙️"
            onPress={() => navigation.navigate('Settings')}
            color="#8E8E93"
          />
          <MenuButton
            title="Practice Mode"
            icon="🎯"
            onPress={() => navigation.navigate('Quiz', { mode: 'practice' })}
            color="#FF2D55"
          />
          <MenuButton
            title="Terms Database"
            icon="🔤"
            onPress={() => navigation.navigate('DatabaseStatus')}
            color="#AF52DE"
          />
          <MenuButton
            title="Diagnostics"
            icon="🔍"
            onPress={() => navigation.navigate('Diagnostic')}
            color="#5AC8FA"
          />
        </View>

        {/* Additional Info */}
        {statistics.lastStudyDate && (
          <Text style={[
            styles.lastStudied,
            { color: settings.theme === 'dark' ? '#ccc' : '#666' }
          ]}>
            Last studied: {new Date(statistics.lastStudyDate).toLocaleDateString()}
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10, // Reduced top padding since SafeAreaView handles the notch
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  menuButton: {
    width: '48%',
    aspectRatio: 1.5,
    backgroundColor: '#007AFF',
    borderRadius: 15,
    padding: 15,
    margin: '1%',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  menuButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  lastStudied: {
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
    fontSize: 14,
  }
});