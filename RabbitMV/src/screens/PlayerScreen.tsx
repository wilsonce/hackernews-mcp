// src/screens/PlayerScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Dimensions, Platform } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus, Audio } from 'expo-av';
import { PlayerScreenProps } from '../navigation/AppNavigator'; // For route prop types
// import * as ScreenOrientation from 'expo-screen-orientation'; // For managing screen orientation

const PlayerScreen: React.FC<PlayerScreenProps> = ({ route, navigation }) => {
  const { videoUrl, title } = route.params;
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [orientation, setOrientation] = useState<ScreenOrientation.OrientationLock>(ScreenOrientation.OrientationLock.DEFAULT);

  useEffect(() => {
    // Set audio mode to allow background playback and mix with others (optional)
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true, // Keep playing when app is backgrounded
      interruptionModeIOS: Audio.InterruptionModeIOS.DoNotMix, //1 = Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.InterruptionModeAndroid.DoNotMix, //1 = Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX
      playThroughEarpieceAndroid: false,
    }).catch(err => console.log("Error setting audio mode", err));

    // Optional: Lock to landscape when player mounts, and unlock on unmount
    // const lockOrientation = async () => {
    //   await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
    //   setOrientation(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
    // };
    // lockOrientation();

    // return () => {
    //   ScreenOrientation.unlockAsync();
    // };
  }, []);

  // Effect to update navigation title if needed, though header is hidden
  useEffect(() => {
    if (title) {
      navigation.setOptions({ title: title });
    }
  }, [title, navigation]);


  const handlePlaybackStatusUpdate = (playbackStatus: AVPlaybackStatus) => {
    setStatus(playbackStatus); // Store the full status
    if (!playbackStatus.isLoaded) {
      if (playbackStatus.error) {
        setError(`Error loading video: ${playbackStatus.error}`);
        setIsLoading(false);
      } else {
        // Still loading or not yet started
        // setIsLoading(true); // This might flicker if it becomes false then true again
      }
    } else {
      setIsLoading(false); // Video is loaded (or was loaded)
      setError(null); // Clear previous errors once loaded

      // if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
      //   // Video finished playing
      //   // navigation.goBack(); // Optionally go back when video finishes
      // }
    }
  };

  // Get screen dimensions for video player size
  const { width, height } = Dimensions.get('window');
  // Simple check for landscape (more robust check might be needed if supporting orientation changes dynamically)
  const isLandscape = width > height;


  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        style={isLandscape ? styles.videoFullscreen : styles.video}
        source={{ uri: videoUrl }}
        useNativeControls // Provides play/pause, slider, fullscreen, etc.
        resizeMode={ResizeMode.CONTAIN} // Or STRETCH, COVER
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        onError={(e) => { // This onError is more for component level errors
            console.error("Video component error:", e);
            setError("Video player encountered an error.");
            setIsLoading(false);
        }}
        onLoadStart={() => setIsLoading(true)} // Explicitly set loading true on load start
        onLoad={() => setIsLoading(false)} // Explicitly set loading false when media is loaded
        // onFullscreenUpdate={onFullscreenUpdate} // For custom fullscreen logic
        // shouldPlay // Auto-play, or manage with state
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.loadingText}>Loading video...</Text>
        </View>
      )}
      {error && !isLoading && ( // Show error only if not also loading
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Black background for video player
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width * (9 / 16), // Assuming 16:9 aspect ratio for portrait
    // Or flex: 1 if you want it to try and fill (might need adjustment with resizeMode)
  },
  videoFullscreen: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  }
});

export default PlayerScreen;
