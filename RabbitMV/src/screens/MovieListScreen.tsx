// src/screens/MovieListScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, StatusBar } from 'react-native';
import { getVodList } from '../api/api';
import { VodItem } from '../types';
import MovieCard from '../components/MovieCard';
import { MovieListScreenProps } from '../navigation/AppNavigator';

const MovieListScreen: React.FC<MovieListScreenProps> = ({ route, navigation }) => {
  const { typeId, title } = route.params;
  const [vodList, setVodList] = useState<VodItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const fetchVodData = async (page: number, refreshing = false, loadingMore = false) => {
    // ... (fetchVodData logic is the same as before)
    if (page > totalPages && page !== 1 && !refreshing) { setIsLoadingMore(false); return; }
    if (refreshing) setIsRefreshing(true);
    else if (loadingMore) setIsLoadingMore(true);
    else setIsLoading(true);
    setError(null);
    try {
      const currentTypeId = typeId !== undefined ? typeId : 1;
      const response = await getVodList({ t: currentTypeId, pg: page });
      if (page === 1 || refreshing) setVodList(response.list || []);
      else setVodList(prevList => [...prevList, ...(response.list || [])]);
      setTotalPages(response.pagecount || 1);
      setCurrentPage(page);
    } catch (e) {
      setError('Failed to load items. Please try again.');
    } finally {
      setIsLoading(false); setIsRefreshing(false); setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    navigation.setOptions({
      title: title || 'Movies',
      headerStyle: { backgroundColor: '#1c1c1c' }, // Dark header
      headerTintColor: '#fff', // Light title
      headerBackTitleVisible: false,
    });
    fetchVodData(1);
  }, [typeId, title, navigation]); // Dependencies

  // ... (handleRefresh, handleLoadMore, renderMovieCard, ListFooter, ListEmpty, ListHeader are the same) ...
  const handleRefresh = () => {
    setCurrentPage(1);
    fetchVodData(1, true);
};
  const handleLoadMore = () => {
    if (!isLoadingMore && !isRefreshing && currentPage < totalPages) {
      fetchVodData(currentPage + 1, false, true);
    }
 };
  const renderMovieCard = ({ item }: { item: VodItem }) => ( <MovieCard item={item} onPress={() => navigation.navigate('Detail', { vod_id: item.vod_id })} /> );
  const ListFooterComponent = () => isLoadingMore ? <ActivityIndicator size="small" color="#007bff" style={{ marginVertical: 20 }} /> : null;
  const ListEmptyComponent = () => (isLoading || isRefreshing) ? null : (error ? <Text style={styles.errorText}>{error}</Text> : <Text style={styles.emptyText}>No items found.</Text>);
  const ListHeaderComponent = () => ( <View style={styles.filterPlaceholderContainer}><Text style={styles.filterPlaceholderText}>Filters - UI Placeholder</Text></View> );
  if (isLoading && currentPage === 1 && vodList.length === 0) {
    return (
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={{color: '#f5f5f5', marginTop: 10}}>Loading items...</Text>
        </View>
      );
   }


  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={vodList}
        renderItem={renderMovieCard}
        keyExtractor={(item, index) => item.vod_id.toString() + `-` + index}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContentContainer}
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={ListEmptyComponent}
        ListHeaderComponent={ListHeaderComponent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' /* Dark Theme */ },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  listContentContainer: { paddingHorizontal: 4 },
  row: {},
  errorText: { color: '#ff6b6b', textAlign: 'center', marginTop: 20, paddingHorizontal: 16 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#a0a0a0', paddingHorizontal: 16 },
  filterPlaceholderContainer: { padding: 15, backgroundColor: '#2c2c2c' /* Darker Placeholder bg */, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#3f3f3f' },
  filterPlaceholderText: { fontSize: 16, color: '#e0e0e0' /* Light text */ },
});

export default MovieListScreen;
