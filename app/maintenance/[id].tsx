import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
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
  CheckCircle,
  Car,
  Book,
  ExternalLink
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { PartOption } from '@/components/PartOption';
import { MileageUpdateModal } from '@/components/MileageUpdateModal';
import { useVehicleStore } from '@/hooks/useVehicleStore';
import { Part } from '@/types/parts';

export default function MaintenanceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { 
    maintenanceTasks, 
    vehicles, 
    deleteMaintenanceTask, 
    completeMaintenanceTask,
    isLoading 
  } = useVehicleStore();
  
  const [mileageModalVisible, setMileageModalVisible] = useState(false);
  
  const task = maintenanceTasks.find(t => t.id === id);
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
      </View>
    );
  }
  
  if (!task) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Maintenance task not found</Text>
        <Button 
          title="Go Back" 
          onPress={() => router.back()} 
          style={styles.notFoundButton}
        />
      </View>
    );
  }
  
  const vehicle = vehicles.find(v => v.id === task.vehicleId);
  
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
  
  const handleDeleteTask = () => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            await deleteMaintenanceTask(id);
            router.back();
          }
        },
      ]
    );
  };
  
  const handleCompleteTask = async (mileage: number) => {
    await completeMaintenanceTask(id, mileage);
    setMileageModalVisible(false);
    router.back();
  };
  
  const handlePartPress = (part: Part) => {
    // In a real app, this would open the part details or external link
    Alert.alert(
      'View Part',
      `Would open ${part.source} to view ${part.name}`,
      [{ text: 'OK' }]
    );
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
  
  const getStatusColor = () => {
    if (task.status === 'overdue') return Colors.status.error;
    if (task.status === 'upcoming') return Colors.status.warning;
    if (task.status === 'completed') return Colors.status.success;
    return Colors.text.muted;
  };
  
  const getStatusText = () => {
    if (task.status === 'overdue') return 'Overdue';
    if (task.status === 'upcoming') return 'Upcoming';
    if (task.status === 'completed') return 'Completed';
    return 'Scheduled';
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Stack.Screen 
        options={{
          title: task.title,
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => router.push(`/maintenance/edit/${id}`)}
              >
                <Edit size={20} color={Colors.secondary.main} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={handleDeleteTask}
              >
                <Trash2 size={20} color={Colors.status.error} />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />
      
      <Card style={styles.taskCard}>
        <View style={styles.taskHeader}>
          <View style={styles.taskTitleContainer}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
              <Text style={styles.statusText}>{getStatusText()}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.vehicleLink}
            onPress={() => router.push(`/vehicle/${vehicle.id}`)}
          >
            <Car size={16} color={Colors.primary.light} />
            <Text style={styles.vehicleLinkText}>
              {vehicle.year} {vehicle.make} {vehicle.model}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.taskDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Calendar size={16} color={Colors.text.muted} />
              <Text style={styles.detailLabel}>Due Date</Text>
              <Text style={styles.detailValue}>{formatDate(task.nextDueDate)}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Clock size={16} color={Colors.text.muted} />
              <Text style={styles.detailLabel}>Interval</Text>
              <Text style={styles.detailValue}>
                {task.intervalMonths ? `${task.intervalMonths} months` : ''}
                {task.intervalMonths && task.intervalMiles ? ' / ' : ''}
                {task.intervalMiles ? `${task.intervalMiles.toLocaleString()} miles` : ''}
              </Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <CheckCircle size={16} color={Colors.text.muted} />
              <Text style={styles.detailLabel}>Last Completed</Text>
              <Text style={styles.detailValue}>{formatDate(task.lastCompletedDate)}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Car size={16} color={Colors.text.muted} />
              <Text style={styles.detailLabel}>At Mileage</Text>
              <Text style={styles.detailValue}>
                {task.lastCompletedMileage 
                  ? `${task.lastCompletedMileage.toLocaleString()} miles` 
                  : 'N/A'}
              </Text>
            </View>
          </View>
        </View>
        
        {task.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>Description</Text>
            <Text style={styles.descriptionText}>{task.description}</Text>
          </View>
        )}
        
        {task.status !== 'completed' && (
          <Button 
            title="Mark as Completed" 
            onPress={() => setMileageModalVisible(true)}
            icon={<CheckCircle size={20} color={Colors.text.primary} />}
            style={styles.completeButton}
          />
        )}
      </Card>
      
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recommended Parts</Text>
        <TouchableOpacity 
          style={styles.findPartsButton}
          onPress={() => router.push({
            pathname: '/parts/search',
            params: { 
              vehicleId: vehicle.id,
              partType: task.title
            }
          })}
        >
          <Book size={16} color={Colors.secondary.main} />
          <Text style={styles.findPartsText}>Find Parts</Text>
        </TouchableOpacity>
      </View>
      
      {task.parts && task.parts.length > 0 ? (
        task.parts.map(part => (
          <PartOption key={part.id} part={part} onPress={handlePartPress} />
        ))
      ) : (
        <Card style={styles.emptyPartsCard}>
          <Text style={styles.emptyPartsText}>
            No parts have been added for this maintenance task.
          </Text>
          <TouchableOpacity 
            style={styles.searchPartsButton}
            onPress={() => router.push({
              pathname: '/parts/search',
              params: { 
                vehicleId: vehicle.id,
                partType: task.title
              }
            })}
          >
            <ExternalLink size={16} color={Colors.primary.light} />
            <Text style={styles.searchPartsText}>Search for Parts</Text>
          </TouchableOpacity>
        </Card>
      )}
      
      <MileageUpdateModal
        visible={mileageModalVisible}
        currentMileage={vehicle.mileage}
        vehicleName={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
        onClose={() => setMileageModalVisible(false)}
        onSave={handleCompleteTask}
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
  taskCard: {
    marginBottom: 24,
  },
  taskHeader: {
    marginBottom: 16,
  },
  taskTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  vehicleLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleLinkText: {
    fontSize: 14,
    color: Colors.primary.light,
    marginLeft: 6,
  },
  taskDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.text.muted,
    marginTop: 4,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  completeButton: {
    width: '100%',
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
  findPartsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  findPartsText: {
    fontSize: 14,
    color: Colors.secondary.main,
    marginLeft: 4,
  },
  emptyPartsCard: {
    alignItems: 'center',
    padding: 24,
  },
  emptyPartsText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  searchPartsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  searchPartsText: {
    fontSize: 14,
    color: Colors.primary.light,
    marginLeft: 6,
  },
});