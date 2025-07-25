import React from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Image } from 'react-native';
import { Link, Stack, useRouter } from 'expo-router';
import { PlusCircle } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { VehicleCard } from '@/components/VehicleCard';
import { MaintenanceTaskCard } from '@/components/MaintenanceTaskCard';
import { useVehicleStore } from '@/hooks/useVehicleStore';
import { Vehicle } from '@/types/vehicle';
import { MaintenanceTask } from '@/types/maintenance';

export default function DashboardScreen() {
  const router = useRouter();
  const { vehicles, maintenanceTasks, isLoading } = useVehicleStore();
  
  // Get upcoming and overdue tasks
  const priorityTasks = maintenanceTasks
    .filter(task => task.status === 'upcoming' || task.status === 'overdue')
    .sort((a, b) => {
      // Sort overdue first, then by date
      if (a.status === 'overdue' && b.status !== 'overdue') return -1;
      if (a.status !== 'overdue' && b.status === 'overdue') return 1;
      return new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime();
    })
    .slice(0, 3);
  
  const handleVehiclePress = (vehicle: Vehicle) => {
    router.push(`/vehicle/${vehicle.id}`);
  };
  
  const handleTaskPress = (task: MaintenanceTask) => {
    router.push(`/maintenance/${task.id}`);
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text style={styles.loadingText}>Loading your items...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: "UpkeepAI",
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 22,
            color: Colors.secondary.main,
          },
          headerStyle: {
            backgroundColor: 'transparent',
          },
        }} 
      />
      
      {vehicles.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Image 
            source={{ uri: 'https://r2-pub.rork.com/attachments/cm23h7oifm7c8cpu4c4wj' }}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.emptyStateTitle}>No Items Added</Text>
          <Text style={styles.emptyStateText}>
            Add your first vehicle or home item to start tracking maintenance and get reminders.
          </Text>
          <Button 
            title="Add Item" 
            onPress={() => router.push('/item/add')}
            icon={<PlusCircle size={20} color={Colors.text.primary} />}
            size="large"
            style={styles.addButton}
          />
        </View>
      ) : (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Items</Text>
            <Link href="/item/add" asChild>
              <Button 
                title="Add" 
                onPress={() => {}}
                variant="secondary" 
                size="small"
                icon={<PlusCircle size={16} color={Colors.text.primary} />}
              />
            </Link>
          </View>
          
          <FlatList
            data={vehicles}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <VehicleCard vehicle={item} onPress={handleVehiclePress} />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.vehicleList}
            style={styles.vehicleListContainer}
          />
          
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Maintenance</Text>
            <Link href="/maintenance" asChild>
              <Text style={styles.viewAllLink}>View All</Text>
            </Link>
          </View>
          
          {priorityTasks.length > 0 ? (
            <FlatList
              data={priorityTasks}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <MaintenanceTaskCard task={item} onPress={handleTaskPress} />
              )}
              style={styles.taskList}
              contentContainerStyle={styles.taskListContent}
            />
          ) : (
            <View style={styles.emptyTasksContainer}>
              <Text style={styles.emptyTasksText}>
                No upcoming maintenance tasks. Add tasks to your items to see them here.
              </Text>
            </View>
          )}
        </>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  viewAllLink: {
    fontSize: 14,
    color: Colors.secondary.main,
  },
  vehicleListContainer: {
    marginBottom: 8,
  },
  vehicleList: {
    paddingRight: 16,
  },
  taskList: {
    flex: 1,
  },
  taskListContent: {
    paddingBottom: 16,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoImage: {
    width: 400,
    height: 200,
    marginBottom: 32,
  },

  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  addButton: {
    width: '100%',
  },
  emptyTasksContainer: {
    padding: 24,
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyTasksText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});