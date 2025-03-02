import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import QuizScreen from './screens/QuizScreen';
import ResultScreen from './screens/ResultScreen';
import SettingsScreen from './screens/SettingsScreen';
import StatisticsScreen from './screens/StatisticsScreen';
import StudyScreen from './screens/StudyScreen'; // Add this import
import BookmarksScreen from './screens/BookmarksScreen'; // Add this import

const Stack = createNativeStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Quiz" 
          component={QuizScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Result" 
          component={ResultScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Statistics" 
          component={StatisticsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Study" 
          component={StudyScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Bookmarks" 
          component={BookmarksScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}