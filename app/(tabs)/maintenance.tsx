import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { PlusCircle, Filter } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { MaintenanceTaskCard } from '@/components/MaintenanceTaskCard';
import { useVehicleStore } from '@/hooks/useVehicleStore';
import { MaintenanceTask, MaintenanceStatus } from '@/types/maintenance';

type FilterOption = 'all' | MaintenanceStatus | 'vehicle';

export default function MaintenanceScreen() {
  const router = useRouter();
  const { maintenanceTasks, vehicles, isLoading } = useVehicleStore();
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  
  const handleTaskPress = (task: MaintenanceTask) => {
    router.push(`/maintenance/${task.id}`);
  };
  
  const filteredTasks = maintenanceTasks.filter(task => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'vehicle') return task.vehicleId === selectedVehicleId;
    return task.status === activeFilter;
  });
  
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // Sort by status priority (overdue > upcoming > scheduled > completed)
    const statusPriority = {
      overdue: 0,
      upcoming: 1,
      scheduled: 2,
      completed: 3,
    };
    
    const aPriority = statusPriority[a.status];
    const bPriority = statusPriority[b.status];
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    // Then sort by date
    return new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime();
  });
  
  const FilterButton = ({ title, filter }: { title: string; filter: FilterOption }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        activeFilter === filter && styles.filterButtonActive,
      ]}
      onPress={() => {
        setActiveFilter(filter);
        if (filter !== 'vehicle') setSelectedVehicleId(null);
      }}
    >
      <Text
        style={[
          styles.filterButtonText,
          activeFilter === filter && styles.filterButtonTextActive,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
  
  const VehicleFilterButton = ({ vehicleId, name }: { vehicleId: string; name: string }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        activeFilter === 'vehicle' && selectedVehicleId === vehicleId && styles.filterButtonActive,
      ]}
      onPress={() => {
        setActiveFilter('vehicle');
        setSelectedVehicleId(vehicleId);
      }}
    >
      <Text
        style={[
          styles.filterButtonText,
          activeFilter === 'vehicle' && selectedVehicleId === vehicleId && styles.filterButtonTextActive,
        ]}
      >
        {name}
      </Text>
    </TouchableOpacity>
  );
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text style={styles.loadingText}>Loading maintenance tasks...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerRight: () => (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => router.push('/maintenance/add')}
            >
              <PlusCircle size={24} color={Colors.secondary.main} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          <FilterButton title="All" filter="all" />
          <FilterButton title="Overdue" filter="overdue" />
          <FilterButton title="Upcoming" filter="upcoming" />
          <FilterButton title="Completed" filter="completed" />
        </View>
        
        {vehicles.length > 0 && (
          <View style={styles.vehicleFiltersContainer}>
            <View style={styles.filterLabelContainer}>
              <Filter size={16} color={Colors.text.muted} />
              <Text style={styles.filterLabel}>Filter by Vehicle:</Text>
            </View>
            <FlatList
              data={vehicles}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <VehicleFilterButton 
                  vehicleId={item.id} 
                  name={`${item.year} ${item.make} ${item.model}`} 
                />
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.vehicleFiltersList}
            />
          </View>
        )}
      </View>
      
      {sortedTasks.length > 0 ? (
        <FlatList
          data={sortedTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MaintenanceTaskCard task={item} onPress={handleTaskPress} />
          )}
          contentContainerStyle={styles.taskList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Maintenance Tasks</Text>
          <Text style={styles.emptyText}>
            {activeFilter !== 'all' 
              ? 'Try changing your filters or add a new maintenance task.'
              : 'Add your first maintenance task to start tracking.'}
          </Text>
          <Button 
            title="Add Maintenance Task" 
            onPress={() => router.push('/maintenance/add')}
            icon={<PlusCircle size={20} color={Colors.text.primary} />}
            style={styles.emptyAddButton}
          />
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
  addButton: {
    marginRight: 16,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.background.light,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary.main,
  },
  filterButtonText: {
    color: Colors.text.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: Colors.text.primary,
  },
  vehicleFiltersContainer: {
    marginTop: 8,
  },
  filterLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    color: Colors.text.muted,
    marginLeft: 6,
  },
  vehicleFiltersList: {
    paddingRight: 16,
  },
  taskList: {
    paddingBottom: 16,
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
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyAddButton: {
    width: '100%',
  },
});