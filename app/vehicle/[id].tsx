import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { 
  Calendar, 
  Clock, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  CheckCircle,
  PlusCircle,
  Wrench,
  Gauge,
  Search
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { MaintenanceTaskCard } from '@/components/MaintenanceTaskCard';
import { MileageUpdateModal } from '@/components/MileageUpdateModal';
import { useVehicleStore } from '@/hooks/useVehicleStore';
import { MaintenanceTask } from '@/types/maintenance';

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { 
    vehicles, 
    maintenanceTasks, 
    deleteVehicle, 
    updateVehicleMileage,
    isLoading 
  } = useVehicleStore();
  
  const [mileageModalVisible, setMileageModalVisible] = useState(false);
  
  const vehicle = vehicles.find(v => v.id === id);
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
      </View>
    );
  }
  
  if (!vehicle) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Vehicle not found</Text>
        <Button 
          title="Go Back" 
          onPress={() => router.back()} 
          style={styles.notFoundButton}
        />
      </View>
    );
  }
  
  const vehicleTasks = maintenanceTasks.filter(
    task => task.vehicleId === id && task.status !== 'completed'
  ).sort((a, b) => {
    // Sort by status priority (overdue > upcoming > scheduled)
    const statusPriority = {
      overdue: 0,
      upcoming: 1,
      scheduled: 2,
    };
    
    const aPriority = statusPriority[a.status as keyof typeof statusPriority];
    const bPriority = statusPriority[b.status as keyof typeof statusPriority];
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    // Then sort by date
    return new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime();
  });
  
  const completedTasks = maintenanceTasks.filter(
    task => task.vehicleId === id && task.status === 'completed'
  ).sort((a, b) => {
    // Sort by completion date (newest first)
    if (a.lastCompletedDate && b.lastCompletedDate) {
      return new Date(b.lastCompletedDate).getTime() - new Date(a.lastCompletedDate).getTime();
    }
    return 0;
  }).slice(0, 5); // Show only the 5 most recent completed tasks
  
  const handleDeleteVehicle = () => {
    Alert.alert(
      'Delete Vehicle',
      `Are you sure you want to delete ${vehicle.year} ${vehicle.make} ${vehicle.model}? This will also delete all maintenance records.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            await deleteVehicle(id);
            router.replace('/');
          }
        },
      ]
    );
  };
  
  const handleTaskPress = (task: MaintenanceTask) => {
    router.push(`/maintenance/${task.id}`);
  };
  
  const handleUpdateMileage = async (mileage: number) => {
    await updateVehicleMileage(id, mileage);
    setMileageModalVisible(false);
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Stack.Screen 
        options={{
          title: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => router.push(`/vehicle/edit/${id}`)}
              >
                <Edit size={20} color={Colors.secondary.main} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={handleDeleteVehicle}
              >
                <Trash2 size={20} color={Colors.status.error} />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />
      
      <View style={styles.vehicleCard}>
        {vehicle.image ? (
          <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} />
        ) : (
          <View style={styles.vehicleImagePlaceholder}>
            <Text style={styles.vehicleImagePlaceholderText}>
              {vehicle.make.charAt(0)}{vehicle.model.charAt(0)}
            </Text>
          </View>
        )}
        
        <View style={styles.vehicleDetails}>
          <Text style={styles.vehicleTitle}>
            {vehicle.year} {vehicle.make} {vehicle.model}
          </Text>
          
          <View style={styles.vehicleInfoRow}>
            {vehicle.type === 'vehicle' && vehicle.mileage !== undefined ? (
              <View style={styles.vehicleInfoItem}>
                <Gauge size={16} color={Colors.text.muted} />
                <Text style={styles.vehicleInfoLabel}>Current Mileage</Text>
                <Text style={styles.vehicleInfoValue}>{vehicle.mileage.toLocaleString()} mi</Text>
              </View>
            ) : vehicle.type === 'home' && vehicle.hoursUsed !== undefined ? (
              <View style={styles.vehicleInfoItem}>
                <Clock size={16} color={Colors.text.muted} />
                <Text style={styles.vehicleInfoLabel}>Hours Used</Text>
                <Text style={styles.vehicleInfoValue}>{vehicle.hoursUsed.toLocaleString()} hrs</Text>
              </View>
            ) : (
              <View style={styles.vehicleInfoItem}>
                <Text style={styles.vehicleInfoLabel}>Category</Text>
                <Text style={styles.vehicleInfoValue}>{vehicle.category || 'Other'}</Text>
              </View>
            )}
            
            <View style={styles.vehicleInfoItem}>
              <Calendar size={16} color={Colors.text.muted} />
              <Text style={styles.vehicleInfoLabel}>Last Updated</Text>
              <Text style={styles.vehicleInfoValue}>{formatDate(vehicle.lastUpdated)}</Text>
            </View>
          </View>
          
          <View style={styles.actionButtons}>
            {vehicle.type === 'vehicle' ? (
              <>
                <Button 
                  title="Update Mileage" 
                  onPress={() => setMileageModalVisible(true)}
                  variant="secondary"
                  style={styles.actionButton}
                />
                <Button 
                  title="Check Recalls" 
                  onPress={() => router.push({
                    pathname: '/(tabs)/recalls',
                    params: { vehicleId: id }
                  })}
                  variant="outline"
                  style={styles.actionButton}
                  icon={<Search size={16} color={Colors.secondary.main} />}
                />
              </>
            ) : (
              <Button 
                title="Update Hours" 
                onPress={() => setMileageModalVisible(true)}
                variant="secondary"
                style={styles.actionButton}
              />
            )}
          </View>
        </View>
      </View>
      
      <View style={styles.maintenanceSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Maintenance Tasks</Text>
          <TouchableOpacity 
            style={styles.addTaskButton}
            onPress={() => router.push({
              pathname: '/maintenance/add',
              params: { vehicleId: id }
            })}
          >
            <PlusCircle size={20} color={Colors.secondary.main} />
            <Text style={styles.addTaskText}>Add Task</Text>
          </TouchableOpacity>
        </View>
        
        {vehicleTasks.length > 0 ? (
          vehicleTasks.map(task => (
            <MaintenanceTaskCard 
              key={task.id} 
              task={task} 
              onPress={handleTaskPress} 
            />
          ))
        ) : (
          <View style={styles.emptyTasksContainer}>
            <Wrench size={32} color={Colors.text.muted} />
            <Text style={styles.emptyTasksText}>
              No maintenance tasks. Add your first task to start tracking.
            </Text>
          </View>
        )}
      </View>
      
      {completedTasks.length > 0 && (
        <View style={styles.maintenanceSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Maintenance History</Text>
          </View>
          
          {completedTasks.map(task => (
            <MaintenanceTaskCard 
              key={task.id} 
              task={task} 
              onPress={handleTaskPress} 
            />
          ))}
          
          {maintenanceTasks.filter(
            task => task.vehicleId === id && task.status === 'completed'
          ).length > 5 && (
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All History</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      <MileageUpdateModal
        visible={mileageModalVisible}
        currentMileage={vehicle.type === 'vehicle' ? vehicle.mileage : vehicle.hoursUsed}
        vehicleName={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
        onClose={() => setMileageModalVisible(false)}
        onSave={handleUpdateMileage}
        isHomeItem={vehicle.type === 'home'}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notFoundText: {
    fontSize: 18,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  notFoundButton: {
    width: 200,
  },
  headerButtons: {
    flexDirection: 'row',
    marginRight: 16,
  },
  headerButton: {
    marginLeft: 16,
  },
  vehicleCard: {
    backgroundColor: Colors.background.light,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  vehicleImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  vehicleImagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleImagePlaceholderText: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  vehicleDetails: {
    padding: 16,
  },
  vehicleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  vehicleInfoRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  vehicleInfoItem: {
    flex: 1,
    alignItems: 'flex-start',
  },
  vehicleInfoLabel: {
    fontSize: 12,
    color: Colors.text.muted,
    marginTop: 4,
    marginBottom: 2,
  },
  vehicleInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  maintenanceSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addTaskText: {
    fontSize: 14,
    color: Colors.secondary.main,
    marginLeft: 4,
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
    marginTop: 12,
  },
  viewAllButton: {
    padding: 12,
    alignItems: 'center',
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary.light,
    fontWeight: '500',
  },
});