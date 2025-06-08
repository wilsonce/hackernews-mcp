// src/screens/SearchScreen.tsx
import React, { useState, useEffect } from 'react'; // Added useEffect
import { View, Text, TextInput, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Keyboard, StatusBar } from 'react-native';
import { getVodList } from '../api/api';
import { VodItem } from '../types';
import MovieCard from '../components/MovieCard';
import { SearchScreenProps } from '../navigation/AppNavigator';

const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  // ... (state variables are the same)
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<VodItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  // const [isLoading, setIsLoading] = useState(false); // Not used directly for full screen loader here
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      // title: 'Search', // Title is already set in AppNavigator
      headerStyle: { backgroundColor: '#1c1c1c' },
      headerTintColor: '#fff',
      headerBackTitleVisible: false,
    });
  }, [navigation]);

  // ... (handleSearch, onSearchSubmit, handleLoadMore, renderMovieCard, ListFooter, ListEmpty are the same)
  const handleSearch = async (page: number, query: string, loadingMore = false) => {
    if (!query.trim()) {
        setResults([]);
        setHasSearched(false);
        Keyboard.dismiss();
        return;
      }

      Keyboard.dismiss();

      if (page > totalPages && page !== 1 && !loadingMore) { // Corrected condition for not over-fetching
          setIsLoadingMore(false);
          return;
      }

      if (loadingMore) {
        setIsLoadingMore(true);
      } else {
        setIsSearching(true);
        setResults([]);
      }
      setError(null);
      setHasSearched(true);

      try {
        const response = await getVodList({ wd: query, pg: page });
        if (page === 1) {
          setResults(response.list || []);
        } else {
          setResults(prevList => [...prevList, ...(response.list || [])]);
        }
        setTotalPages(response.pagecount || 1);
        setCurrentPage(page);
      } catch (e) {
        setError('Failed to load search results. Please try again.');
        setResults([]);
      } finally {
        setIsSearching(false);
        setIsLoadingMore(false);
      }
   };
  const onSearchSubmit = () => {
    setCurrentPage(1);
    setTotalPages(1);
    handleSearch(1, searchQuery);
   };
  const handleLoadMore = () => {
    if (!isLoadingMore && !isSearching && currentPage < totalPages && searchQuery.trim()) {
        handleSearch(currentPage + 1, searchQuery, true);
      }
   };
  const renderMovieCard = ({ item }: { item: VodItem }) => ( <MovieCard item={item} onPress={() => navigation.navigate('Detail', { vod_id: item.vod_id })} /> );
  const ListFooterComponent = () => isLoadingMore ? <ActivityIndicator size="small" color="#007bff" style={{ marginVertical: 20 }} /> : null;
  const ListEmptyComponent = () => {
    if (isSearching) return null;
    if (error) return <Text style={styles.messageTextError}>{error}</Text>;
    if (hasSearched && results.length === 0) return <Text style={styles.messageText}>No results found for "{searchQuery}".</Text>;
    if (!hasSearched) return <Text style={styles.messageText}>Enter a keyword to search.</Text>;
    return null;
   };


  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search movies, TV shows..."
          placeholderTextColor="#888" // Placeholder text color for dark input
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={onSearchSubmit}
          returnKeyType="search"
          selectionColor="#007bff" // Cursor/selection color
        />
        <TouchableOpacity style={styles.searchButton} onPress={onSearchSubmit} disabled={isSearching || !searchQuery.trim()}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {isSearching && <ActivityIndicator size="large" color="#007bff" style={styles.fullLoader} />}

      {!isSearching && (
        <FlatList
          data={results} /* ... other FlatList props same as before ... */
          renderItem={renderMovieCard}
          keyExtractor={(item, index) => `search-${item.vod_id}-${index}`}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContentContainer}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={ListFooterComponent}
          ListEmptyComponent={ListEmptyComponent}
          keyboardShouldPersistTaps="handled" // Good for search UX
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' /* Dark Theme */ },
  searchBarContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#1c1c1c', // Darker search bar background
    borderBottomWidth: 1,
    borderBottomColor: '#3f3f3f', // Darker border
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#555', // Darker border for input
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#2c2c2c', // Dark input background
    color: '#f5f5f5', // Light text input color
    fontSize: 16,
  },
  searchButton: {
    marginLeft: 10,
    paddingHorizontal: 15,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007bff',
    borderRadius: 5,
   },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
   },
  fullLoader: { marginTop: 50 },
  listContentContainer: { paddingHorizontal: 4 },
  row: {},
  messageText: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#a0a0a0' },
  messageTextError: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#ff6b6b' },
});

export default SearchScreen;
