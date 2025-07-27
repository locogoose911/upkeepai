// Import polyfills first
import '@/lib/react-polyfill';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { Platform, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SystemUI from "expo-system-ui";
import { Colors } from "@/constants/colors";
import { useVehicleStore } from "@/hooks/useVehicleStore";
import { trpc, trpcClient } from "@/lib/trpc";
import { ErrorBoundary } from "@/components/ErrorBoundary";




// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const loadData = useVehicleStore(state => state.loadData);

  useEffect(() => {
    const initializeData = async () => {
      try {
        await loadData();
        
        // Configure system UI for Android 15 edge-to-edge
        if (Platform.OS === 'android') {
          await SystemUI.setBackgroundColorAsync('transparent');
          // Edge-to-edge is enabled by default in Expo SDK 53 for Android 15+
        }
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };
    
    initializeData();
  }, [loadData]);

  return (
    <Stack 
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary.dark,
        },
        headerTintColor: Colors.text.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: 'transparent',
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="vehicle/[id]" 
        options={{ 
          title: "Vehicle Details",
          presentation: "card",
        }} 
      />
      <Stack.Screen 
        name="vehicle/add" 
        options={{ 
          title: "Add Vehicle",
          presentation: "modal",
        }} 
      />
      <Stack.Screen 
        name="maintenance/[id]" 
        options={{ 
          title: "Maintenance Details",
          presentation: "card",
        }} 
      />
      <Stack.Screen 
        name="maintenance/add" 
        options={{ 
          title: "Add Maintenance Task",
          presentation: "modal",
        }} 
      />
      <Stack.Screen 
        name="parts/search" 
        options={{ 
          title: "Find Parts",
          presentation: "card",
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing app...');
        await SplashScreen.hideAsync();
        
        // Configure system UI for edge-to-edge on Android 15
        if (Platform.OS === 'android') {
          await SystemUI.setBackgroundColorAsync('transparent');
          // Edge-to-edge is enabled by default in Expo SDK 53 for Android 15+
        }
        console.log('App initialized successfully');
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };
    
    initializeApp();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <SafeAreaProvider>
            <GestureHandlerRootView>
              <View style={{ flex: 1, backgroundColor: Colors.primary.dark }}>
                <StatusBar 
                  style="light" 
                  translucent={Platform.OS === 'android'}
                  backgroundColor="transparent"
                />
                <RootLayoutNav />
              </View>
            </GestureHandlerRootView>
          </SafeAreaProvider>
        </trpc.Provider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}