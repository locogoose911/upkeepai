import { Tabs } from "expo-router";
import { Home, Wrench, Bell, User, AlertTriangle } from "lucide-react-native";
import React from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.secondary.main,
        tabBarInactiveTintColor: Colors.text.muted,
        tabBarStyle: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          height: Platform.OS === 'android' ? 75 + Math.max(insets.bottom, 15) : 75,
          paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 15) + 10 : 15,
          paddingTop: 10,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        sceneStyle: {
          backgroundColor: 'transparent',
        },
        headerStyle: {
          backgroundColor: 'transparent',
        },
        headerTintColor: Colors.text.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 4,
        },
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ color }) => <Home size={34} color={color} />,
        }}
      />
      <Tabs.Screen
        name="maintenance"
        options={{
          title: "Maintenance",
          tabBarLabel: "Maintenance",
          tabBarIcon: ({ color }) => <Wrench size={34} color={color} />,
        }}
      />
      <Tabs.Screen
        name="recalls"
        options={{
          title: "Recalls",
          tabBarLabel: "Recalls",
          tabBarIcon: ({ color }) => <AlertTriangle size={34} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarLabel: "Alerts",
          tabBarIcon: ({ color }) => <Bell size={34} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => <User size={34} color={color} />,
        }}
      />
    </Tabs>
  );
}