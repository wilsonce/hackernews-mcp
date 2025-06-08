// src/components/MovieCard.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { VodItem } from '../types';

interface MovieCardProps {
  item: VodItem;
  onPress: () => void;
}

const { width } = Dimensions.get('window');
const cardMargin = 8;
const numColumns = 2;
const cardWidth = (width / numColumns) - (cardMargin * (numColumns + 1) / numColumns);

const MovieCard: React.FC<MovieCardProps> = ({ item, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Image
        source={{ uri: item.vod_pic }}
        style={styles.poster}
        resizeMode="cover"
      />
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {item.vod_name}
        </Text>
        {item.vod_remarks && (
          <Text style={styles.remarks} numberOfLines={1}>
            {item.vod_remarks}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    marginBottom: cardMargin * 2,
    marginHorizontal: cardMargin / numColumns, // Distributes margin more evenly
    backgroundColor: '#2c2c2c', // Darker card background
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 3, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  poster: {
    width: '100%',
    height: cardWidth * 1.5, // Aspect ratio 2:3
    backgroundColor: '#3f3f3f', // Darker placeholder
  },
  infoContainer: {
    padding: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f5f5f5', // Light text for dark background
    marginBottom: 4,
    minHeight: 34, // Ensure space for two lines
  },
  remarks: {
    fontSize: 12,
    color: '#a0a0a0', // Lighter gray for remarks
  },
});

export default MovieCard;
