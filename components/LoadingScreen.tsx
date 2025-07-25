import React from 'react';
import { View, Text, StyleSheet, ImageBackground, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/colors';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <ImageBackground 
      source={{ uri: 'https://r2-pub.rork.com/attachments/p2x2ak8mm74e3limttt4d' }}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={Colors.secondary.main} />
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  message: {
    color: Colors.text.primary,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});