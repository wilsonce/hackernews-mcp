// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { getVodList } from '../api/api';
import { VodItem } from '../types';
import MovieCard from '../components/MovieCard';
import { HomeScreenProps } from '../navigation/AppNavigator';

const MOVIE_TYPE_ID = 1;
const TV_SHOW_TYPE_ID = 2;
const cardMargin = 8; // Defined here for use in listContent padding

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  // ... (state and useEffect logic remains the same) ...
  const [latestMovies, setLatestMovies] = useState<VodItem[]>([]);
  const [latestTVShows, setLatestTVShows] = useState<VodItem[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [loadingTVShows, setLoadingTVShows] = useState(true);
  const [errorMovies, setErrorMovies] = useState<string | null>(null);
  const [errorTVShows, setErrorTVShows] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: '#1c1c1c', // Darker header
      },
      headerTintColor: '#fff', // Light title color
      title: 'RabbitMV Home', // Explicitly set title as it might be dynamic in AppNavigator
    });

    const fetchMovies = async () => {
      try {
        setLoadingMovies(true);
        setErrorMovies(null);
        const response = await getVodList({ t: MOVIE_TYPE_ID, pg: 1 });
        setLatestMovies(response.list.slice(0, 6));
      } catch (e) {
        setErrorMovies('Failed to load movies.');
      } finally {
        setLoadingMovies(false);
      }
    };

    const fetchTVShows = async () => {
      try {
        setLoadingTVShows(true);
        setErrorTVShows(null);
        const response = await getVodList({ t: TV_SHOW_TYPE_ID, pg: 1 });
        setLatestTVShows(response.list.slice(0, 6));
      } catch (e) {
        setErrorTVShows('Failed to load TV shows.');
      } finally {
        setLoadingTVShows(false);
      }
    };

    fetchMovies();
    fetchTVShows();
  }, [navigation]);

  const renderMovieCard = ({ item }: { item: VodItem }) => (
    <MovieCard
      item={item}
      onPress={() => navigation.navigate('Detail', { vod_id: item.vod_id })}
    />
  );

  const ListSection: React.FC<{
    title: string;
    data: VodItem[];
    loading: boolean;
    error: string | null;
    onViewMore?: () => void;
  }> = ({ title, data, loading, error, onViewMore }) => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {onViewMore && <TouchableOpacity onPress={onViewMore}><Text style={styles.viewMore}>View More</Text></TouchableOpacity>}
      </View>
      {loading && <ActivityIndicator size="large" color="#007bff" style={styles.loader} />}
      {error && <Text style={styles.errorText}>{error}</Text>}
      {!loading && !error && data.length === 0 && <Text style={styles.emptyText}>No items found.</Text>}
      {!loading && !error && data.length > 0 && (
        <FlatList
          data={data}
          renderItem={renderMovieCard}
          keyExtractor={(item) => item.vod_id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ListSection
        title="Latest Movies"
        data={latestMovies}
        loading={loadingMovies}
        error={errorMovies}
        onViewMore={() => navigation.navigate('MovieList', { title: 'Latest Movies', typeId: MOVIE_TYPE_ID })}
      />
      <ListSection
        title="Latest TV Shows"
        data={latestTVShows}
        loading={loadingTVShows}
        error={errorTVShows}
        onViewMore={() => navigation.navigate('TVShowList', { title: 'Latest TV Shows', typeId: TV_SHOW_TYPE_ID })}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark background for the whole screen
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f5f5f5', // Light text
  },
  viewMore: {
    fontSize: 14,
    color: '#007bff', // Link color, can be adjusted
  },
  loader: {
    marginTop: 20,
    alignSelf: 'center',
  },
  errorText: {
    color: '#ff6b6b', // Softer red for errors on dark background
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#a0a0a0', // Lighter gray
    paddingHorizontal: 16,
  },
  row: {
    // justifyContent: 'space-between', // Ensure cards are spaced out from edges
    // paddingHorizontal: cardMargin / 2, // This might be better handled by MovieCard margin or FlatList contentContainerStyle
  },
  listContent: {
    paddingHorizontal: cardMargin / 2, // Provides edge spacing for the grid
  }
});

export default HomeScreen;
