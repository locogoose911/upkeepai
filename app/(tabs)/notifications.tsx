import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Switch } from 'react-native';
import { Stack } from 'expo-router';
import { Bell, BellOff, Clock, Calendar, Car } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Card } from '@/components/Card';
import { useVehicleStore } from '@/hooks/useVehicleStore';

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'maintenance' | 'mileage' | 'system';
  vehicleId?: string;
}

export default function NotificationsScreen() {
  const { vehicles, maintenanceTasks } = useVehicleStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  // Generate mock notifications based on maintenance tasks
  const generateNotifications = (): Notification[] => {
    const notifications: Notification[] = [];
    
    // Add notifications for overdue tasks
    maintenanceTasks
      .filter(task => task.status === 'overdue')
      .forEach(task => {
        const vehicle = vehicles.find(v => v.id === task.vehicleId);
        if (!vehicle) return;
        
        notifications.push({
          id: `overdue-${task.id}`,
          title: 'Maintenance Overdue',
          message: `${task.title} for your ${vehicle.year} ${vehicle.make} ${vehicle.model} is overdue.`,
          date: new Date().toISOString(),
          read: false,
          type: 'maintenance',
          vehicleId: vehicle.id,
        });
      });
    
    // Add notifications for upcoming tasks
    maintenanceTasks
      .filter(task => task.status === 'upcoming')
      .filter(task => {
        const dueDate = new Date(task.nextDueDate);
        const now = new Date();
        const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 14; // Only show tasks due within 14 days
      })
      .forEach(task => {
        const vehicle = vehicles.find(v => v.id === task.vehicleId);
        if (!vehicle) return;
        
        const dueDate = new Date(task.nextDueDate);
        const now = new Date();
        const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        notifications.push({
          id: `upcoming-${task.id}`,
          title: 'Upcoming Maintenance',
          message: `${task.title} for your ${vehicle.year} ${vehicle.make} ${vehicle.model} is due in ${diffDays} days.`,
          date: new Date().toISOString(),
          read: diffDays > 7, // Mark as read if due in more than 7 days
          type: 'maintenance',
          vehicleId: vehicle.id,
        });
      });
    
    // Add mileage-based notifications
    vehicles.forEach(vehicle => {
      const mileageTasks = maintenanceTasks.filter(
        task => task.vehicleId === vehicle.id && task.nextDueMileage
      );
      
      mileageTasks.forEach(task => {
        if (!task.nextDueMileage) return;
        
        const mileageDiff = task.nextDueMileage - vehicle.mileage;
        if (mileageDiff <= 500 && mileageDiff > 0) {
          notifications.push({
            id: `mileage-${task.id}`,
            title: 'Mileage Alert',
            message: `${task.title} for your ${vehicle.year} ${vehicle.make} ${vehicle.model} is due in ${mileageDiff} miles.`,
            date: new Date().toISOString(),
            read: mileageDiff > 200, // Mark as read if due in more than 200 miles
            type: 'mileage',
            vehicleId: vehicle.id,
          });
        }
      });
    });
    
    // Add welcome notification for new users
    if (vehicles.length > 0 && notifications.length === 0) {
      notifications.push({
        id: 'welcome',
        title: 'Welcome to UpkeepAI',
        message: 'You\'ll receive notifications here when maintenance is due or overdue.',
        date: new Date().toISOString(),
        read: false,
        type: 'system',
      });
    }
    
    // Sort by date (newest first) and read status
    return notifications.sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  };
  
  const notifications = generateNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'maintenance':
        return <Clock size={24} color={Colors.status.warning} />;
      case 'mileage':
        return <Car size={24} color={Colors.status.info} />;
      default:
        return <Bell size={24} color={Colors.secondary.main} />;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity 
      style={[styles.notificationItem, item.read ? styles.notificationRead : styles.notificationUnread]}
      activeOpacity={0.8}
    >
      <View style={styles.notificationIcon}>
        {getNotificationIcon(item.type)}
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationDate}>{formatDate(item.date)}</Text>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}`,
        }} 
      />
      
      <Card style={styles.settingsCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Push Notifications</Text>
            <Text style={styles.settingDescription}>
              Receive alerts for maintenance and mileage updates
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: Colors.background.light, true: Colors.primary.light }}
            thumbColor={notificationsEnabled ? Colors.secondary.main : Colors.text.muted}
          />
        </View>
      </Card>
      
      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          contentContainerStyle={styles.notificationsList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <BellOff size={64} color={Colors.text.muted} />
          <Text style={styles.emptyTitle}>No Notifications</Text>
          <Text style={styles.emptyText}>
            You'll receive notifications here when maintenance is due or overdue.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'transparent',
  },
  settingsCard: {
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.text.muted,
  },
  notificationsList: {
    paddingBottom: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  notificationUnread: {
    backgroundColor: Colors.background.light,
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary.main,
  },
  notificationRead: {
    backgroundColor: Colors.background.main,
    opacity: 0.8,
  },
  notificationIcon: {
    marginRight: 16,
    alignSelf: 'flex-start',
    padding: 4,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  notificationDate: {
    fontSize: 12,
    color: Colors.text.muted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});