// src/screens/DetailScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, FlatList, Alert, StatusBar, Dimensions } from 'react-native';
import { getVodDetail } from '../api/api';
import { VodDetail, PlayLink } from '../types';
import { DetailScreenProps } from '../navigation/AppNavigator';

const DetailScreen: React.FC<DetailScreenProps> = ({ route, navigation }) => {
  const { vod_id } = route.params;
  const [vodDetail, setVodDetail] = useState<VodDetail | null>(null);
  const [parsedEpisodes, setParsedEpisodes] = useState<PlayLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({
        headerStyle: { backgroundColor: '#1c1c1c' }, // Darker header
        headerTintColor: '#fff', // Light title color
        headerBackTitleVisible: false,
    });
    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const detail = await getVodDetail(vod_id);
        if (detail) {
          setVodDetail(detail);
          navigation.setOptions({ title: detail.vod_name || 'Details' });
          parsePlayUrls(detail.vod_play_url);
        } else {
          setError('Failed to load details for this item. It may not exist.');
        }
      } catch (e) {
        console.error("Failed to fetch VOD detail:", e);
        setError('An error occurred while loading details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [vod_id, navigation]);

  const parsePlayUrls = (playUrlString: string) => {
    if (!playUrlString || typeof playUrlString !== 'string') {
      setParsedEpisodes([]); return;
    }
    const episodes: PlayLink[] = [];
    const parts = playUrlString.split('#');
    parts.forEach(part => {
      const subParts = part.split('$');
      if (subParts.length >= 2) {
        const url = subParts[1];
        if (url && (url.startsWith('http://') || url.startsWith('https://') || url.endsWith('.m3u8'))) {
           episodes.push({ episode: subParts[0], url: url });
        } else {
           episodes.push({ episode: `${subParts[0]} (URL Invalid)`, url: '' });
        }
      }
    });
    setParsedEpisodes(episodes);
  };

  const handlePlayEpisode = (episode: PlayLink) => {
    if (!episode.url) {
        Alert.alert("Playback Error", "This episode's video URL is missing or invalid.");
        return;
    }
    navigation.navigate('Player', { videoUrl: episode.url, title: `${vodDetail?.vod_name} - ${episode.episode}` });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{color: '#f5f5f5', marginTop: 10}}>Loading details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!vodDetail) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Details not found.</Text>
      </View>
    );
  }

  const renderEpisodeItem = ({ item }: { item: PlayLink }) => (
    <TouchableOpacity
        style={[styles.episodeButton, !item.url && styles.episodeButtonDisabled]}
        onPress={() => handlePlayEpisode(item)}
        disabled={!item.url}
    >
      <Text style={styles.episodeButtonText}>{item.episode}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Image source={{ uri: vodDetail.vod_pic }} style={styles.poster} resizeMode="cover" />

      <View style={styles.infoContainer}>
        <Text style={styles.title}>{vodDetail.vod_name}</Text>
        {vodDetail.vod_remarks && <Text style={styles.detailText}><Text style={styles.labelText}>Status:</Text> {vodDetail.vod_remarks}</Text>}
        {vodDetail.vod_year && <Text style={styles.detailText}><Text style={styles.labelText}>Year:</Text> {vodDetail.vod_year}</Text>}
        {vodDetail.vod_area && <Text style={styles.detailText}><Text style={styles.labelText}>Region:</Text> {vodDetail.vod_area}</Text>}
        {vodDetail.type_name && <Text style={styles.detailText}><Text style={styles.labelText}>Category:</Text> {vodDetail.type_name}</Text>}
        {vodDetail.vod_director && <Text style={styles.detailText}><Text style={styles.labelText}>Director(s):</Text> {vodDetail.vod_director}</Text>}
        {vodDetail.vod_actor && <Text style={styles.detailText}><Text style={styles.labelText}>Actor(s):</Text> {vodDetail.vod_actor}</Text>}
        {vodDetail.vod_time && <Text style={styles.detailText}><Text style={styles.labelText}>Updated:</Text> {vodDetail.vod_time}</Text>}

        {vodDetail.vod_content && (
          <>
            <Text style={styles.sectionTitle}>Synopsis</Text>
            <Text style={styles.synopsis}>{vodDetail.vod_content.trim()}</Text>
          </>
        )}
      </View>

      {parsedEpisodes.length > 0 && (
        <View style={styles.episodesContainer}>
          <Text style={styles.sectionTitle}>Episodes</Text>
          <View style={styles.episodeListWrapper}>
            {parsedEpisodes.map((ep, index) => renderEpisodeItem({item: ep}))}
          </View>
        </View>
      )}
       {parsedEpisodes.length === 0 && vodDetail.vod_play_url && (
         <View style={styles.episodesContainer}>
            <Text style={styles.sectionTitle}>Episodes</Text>
            <Text style={styles.detailText}>No playable episodes found or unable to parse episode data.</Text>
         </View>
       )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark theme
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#121212',
   },
  poster: {
    width: '100%',
    height: Dimensions.get('window').height * 0.4, // 40% of screen height
    backgroundColor: '#3f3f3f',
  },
  infoContainer: {
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#f5f5f5',
  },
  labelText: {
    fontWeight: 'bold',
    color: '#b0b0b0', // Slightly lighter label for dark theme
  },
  detailText: {
    fontSize: 15,
    marginBottom: 6,
    lineHeight: 22,
    color: '#e0e0e0', // Light text
  },
  synopsis: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'justify',
    color: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#f5f5f5',
  },
  episodesContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  episodeListWrapper: { // Use a View to wrap buttons for flexbox layout
    flexDirection: 'row',
    flexWrap: 'wrap',
    // justifyContent: 'space-between', // Or 'flex-start'
  },
  episodeButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 12, // Adjust padding
    borderRadius: 20, // More rounded buttons
    marginRight: 8,
    marginBottom: 8,
    minWidth: 70, // Ensure some min width
    alignItems: 'center',
  },
  episodeButtonDisabled: {
    backgroundColor: '#555', // Darker disabled button
  },
  episodeButtonText: {
    color: '#fff',
    fontSize: 13, // Slightly smaller for more text
  },
  errorText: { color: '#ff6b6b', textAlign: 'center', fontSize: 16, },
});

export default DetailScreen;
