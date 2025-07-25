import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';
import { Stack } from 'expo-router';
import { 
  User, 
  Settings, 
  HelpCircle, 
  Bell, 
  Shield, 
  ExternalLink, 
  LogOut,
  ChevronRight
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Card } from '@/components/Card';

export default function ProfileScreen() {
  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Stack.Screen 
        options={{
          title: "Profile",
        }} 
      />
      
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          <User size={40} color={Colors.text.primary} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>UpkeepAI User</Text>
          <Text style={styles.profileEmail}>user@example.com</Text>
        </View>
      </View>
      
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <Card>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemIcon}>
              <User size={20} color={Colors.primary.light} />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Personal Information</Text>
            </View>
            <ChevronRight size={20} color={Colors.text.muted} />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemIcon}>
              <Bell size={20} color={Colors.primary.light} />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Notification Settings</Text>
            </View>
            <ChevronRight size={20} color={Colors.text.muted} />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemIcon}>
              <Shield size={20} color={Colors.primary.light} />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Privacy & Security</Text>
            </View>
            <ChevronRight size={20} color={Colors.text.muted} />
          </TouchableOpacity>
        </Card>
      </View>
      
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>App</Text>
        
        <Card>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemIcon}>
              <Settings size={20} color={Colors.primary.light} />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Preferences</Text>
            </View>
            <ChevronRight size={20} color={Colors.text.muted} />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleOpenLink('https://example.com/help')}
          >
            <View style={styles.menuItemIcon}>
              <HelpCircle size={20} color={Colors.primary.light} />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Help & Support</Text>
            </View>
            <ExternalLink size={20} color={Colors.text.muted} />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleOpenLink('https://example.com/about')}
          >
            <View style={styles.menuItemIcon}>
              <ExternalLink size={20} color={Colors.primary.light} />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>About UpkeepAI</Text>
              <Text style={styles.menuItemDescription}>Version 1.0.0</Text>
            </View>
            <ChevronRight size={20} color={Colors.text.muted} />
          </TouchableOpacity>
        </Card>
      </View>
      
      <TouchableOpacity style={styles.logoutButton}>
        <LogOut size={20} color={Colors.status.error} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
      
      <Text style={styles.footerText}>
        © 2025 UpkeepAI. All rights reserved.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: Colors.background.light,
    borderRadius: 16,
  },
  profileImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 12,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  menuItemDescription: {
    fontSize: 12,
    color: Colors.text.muted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.background.main,
    marginVertical: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.status.error,
    marginLeft: 8,
  },
  footerText: {
    fontSize: 12,
    color: Colors.text.muted,
    textAlign: 'center',
  },
});