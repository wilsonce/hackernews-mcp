// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';

// Import screen components (actual files exist, but might be empty or placeholders)
import HomeScreen from '../screens/HomeScreen';
import MovieListScreen from '../screens/MovieListScreen';
import TVShowListScreen from '../screens/TVShowListScreen';
import DetailScreen from '../screens/DetailScreen';
import PlayerScreen from '../screens/PlayerScreen';
import SearchScreen from '../screens/SearchScreen';

// Define the ParamList for the stack navigator
// This helps with type safety for navigation props
export type RootStackParamList = {
  Home: undefined; // No params for HomeScreen
  MovieList: { typeId?: number; title?: string }; // Example: pass a type ID for movies
  TVShowList: { typeId?: number; title?: string }; // Example: pass a type ID for TV shows
  Detail: { vod_id: number }; // vod_id is required for DetailScreen
  Player: { videoUrl: string; title?: string }; // videoUrl is required for PlayerScreen
  Search: undefined; // No params for SearchScreen (or could take an initial query)
};

// Helper types for screen props
export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type MovieListScreenProps = NativeStackScreenProps<RootStackParamList, 'MovieList'>;
export type TVShowListScreenProps = NativeStackScreenProps<RootStackParamList, 'TVShowList'>;
export type DetailScreenProps = NativeStackScreenProps<RootStackParamList, 'Detail'>;
export type PlayerScreenProps = NativeStackScreenProps<RootStackParamList, 'Player'>;
export type SearchScreenProps = NativeStackScreenProps<RootStackParamList, 'Search'>;


const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'RabbitMV Home' }} />
        <Stack.Screen name="MovieList" component={MovieListScreen} options={({ route }) : ({ title: route.params?.title || 'Movies' })} />
        <Stack.Screen name="TVShowList" component={TVShowListScreen} options={({ route }) : ({ title: route.params?.title || 'TV Shows' })} />
        <Stack.Screen name="Detail" component={DetailScreen} options={{ title: 'Details' }} />
        <Stack.Screen name="Player" component={PlayerScreen} options={{ title: 'Now Playing', headerShown: false }} />
        <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Search' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
