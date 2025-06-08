// src/screens/TVShowListScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, StatusBar } from 'react-native';
import { getVodList } from '../api/api';
import { VodItem } from '../types';
import MovieCard from '../components/MovieCard';
import { TVShowListScreenProps } from '../navigation/AppNavigator';

const TVShowListScreen: React.FC<TVShowListScreenProps> = ({ route, navigation }) => {
  // ... (logic is identical to MovieListScreen, just props and default typeId differ)
  const { typeId, title } = route.params;
  const [vodList, setVodList] = useState<VodItem[]>([]);
  // ... (all other states and functions like fetchVodData, handleRefresh, handleLoadMore, etc. are structurally identical to MovieListScreen)
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const fetchVodData = async (page: number, refreshing = false, loadingMore = false) => {
    if (page > totalPages && page !== 1 && !refreshing) { setIsLoadingMore(false); return; }
    if (refreshing) setIsRefreshing(true); else if (loadingMore) setIsLoadingMore(true); else setIsLoading(true);
    setError(null);
    try {
      const currentTypeId = typeId !== undefined ? typeId : 2; // Default TV type
      const response = await getVodList({ t: currentTypeId, pg: page });
      if (page === 1 || refreshing) setVodList(response.list || []);
      else setVodList(prevList => [...prevList, ...(response.list || [])]);
      setTotalPages(response.pagecount || 1); setCurrentPage(page);
    } catch (e) { setError('Failed to load items.'); }
    finally { setIsLoading(false); setIsRefreshing(false); setIsLoadingMore(false); }
  };

  useEffect(() => {
    navigation.setOptions({
      title: title || 'TV Shows',
      headerStyle: { backgroundColor: '#1c1c1c' },
      headerTintColor: '#fff',
      headerBackTitleVisible: false,
    });
    fetchVodData(1);
  }, [typeId, title, navigation]);

  // ... (renderMovieCard, ListFooter, ListEmpty, ListHeader are the same)
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
  const ListEmptyComponent = () => (isLoading || isRefreshing) ? null : (error ? <Text style={styles.errorText}>{error}</Text> : <Text style={styles.emptyText}>No TV shows found.</Text>);
  const ListHeaderComponent = () => ( <View style={styles.filterPlaceholderContainer}><Text style={styles.filterPlaceholderText}>Filters - UI Placeholder</Text></View> );

  if (isLoading && currentPage === 1 && vodList.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{color: '#f5f5f5', marginTop: 10}}>Loading TV shows...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={vodList} /* ... other FlatList props same as MovieListScreen ... */
        renderItem={renderMovieCard}
        keyExtractor={(item, index) => `tv-${item.vod_id}-${index}`}
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

// Use same styles as MovieListScreen for dark theme
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  listContentContainer: { paddingHorizontal: 4 },
  row: {},
  errorText: { color: '#ff6b6b', textAlign: 'center', marginTop: 20, paddingHorizontal: 16 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#a0a0a0', paddingHorizontal: 16 },
  filterPlaceholderContainer: { padding: 15, backgroundColor: '#2c2c2c', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#3f3f3f' },
  filterPlaceholderText: { fontSize: 16, color: '#e0e0e0' },
});

export default TVShowListScreen;
