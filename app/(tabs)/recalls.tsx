import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Search, AlertTriangle, RefreshCw, Car } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useVehicleStore } from '@/hooks/useVehicleStore';
import { useRecallSearch } from '@/hooks/useRecallSearch';
import { RecallCard } from '@/components/RecallCard';
import { Recall } from '@/types/recall';

export default function RecallsScreen() {
  const { vehicleId } = useLocalSearchParams<{ vehicleId?: string }>();
  const { vehicles } = useVehicleStore();
  const { 
    isLoading, 
    error, 
    searchResults, 
    searchRecallsForVehicle, 
    clearResults 
  } = useRecallSearch();

  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(vehicleId || null);
  const [allRecalls, setAllRecalls] = useState<Recall[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    if (vehicleId) {
      setSelectedVehicleId(vehicleId);
    } else if (vehicles.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(vehicles[0].id);
    }
  }, [vehicles, selectedVehicleId, vehicleId]);

  useEffect(() => {
    if (vehicleId && vehicles.length > 0) {
      handleSearchRecalls(vehicleId);
    }
  }, [vehicleId, vehicles]);

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  const handleSearchRecalls = async (vehicleId?: string) => {
    const vehicle = vehicleId 
      ? vehicles.find(v => v.id === vehicleId)
      : selectedVehicle;
    
    if (!vehicle) {
      Alert.alert('Error', 'Please select a vehicle to search for recalls.');
      return;
    }

    try {
      console.log(`Searching recalls for ${vehicle.year} ${vehicle.make} ${vehicle.model}`);
      await searchRecallsForVehicle(vehicle.make, vehicle.model, vehicle.year);
    } catch (err) {
      console.error('Error searching recalls:', err);
      Alert.alert(
        'Search Error',
        'Failed to search for recalls. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleSearchAllVehicles = async () => {
    if (vehicles.length === 0) {
      Alert.alert('No Vehicles', 'Please add vehicles to search for recalls.');
      return;
    }

    setRefreshing(true);
    const recalls: Recall[] = [];

    try {
      for (const vehicle of vehicles) {
        console.log(`Searching recalls for ${vehicle.year} ${vehicle.make} ${vehicle.model}`);
        const result = await searchRecallsForVehicle(vehicle.make, vehicle.model, vehicle.year);
        recalls.push(...result.recalls);
      }

      setAllRecalls(recalls);
      clearResults();
    } catch (err) {
      console.error('Error searching all recalls:', err);
      Alert.alert(
        'Search Error',
        'Failed to search for recalls. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    if (selectedVehicle) {
      await handleSearchRecalls();
    } else {
      await handleSearchAllVehicles();
    }
  };

  const displayRecalls = searchResults?.recalls || allRecalls;
  const hasRecalls = displayRecalls.length > 0;

  const getSeverityStats = () => {
    const stats = { critical: 0, high: 0, medium: 0, low: 0 };
    displayRecalls.forEach(recall => {
      stats[recall.severity]++;
    });
    return stats;
  };

  const severityStats = getSeverityStats();

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Vehicle Recalls',
          headerRight: () => (
            <TouchableOpacity
              onPress={handleRefresh}
              style={styles.headerButton}
              disabled={isLoading}
              testID="refresh-button"
            >
              <RefreshCw 
                size={20} 
                color={Colors.text.primary} 
                style={isLoading ? { opacity: 0.5 } : {}}
              />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.secondary.main}
          />
        }
        testID="recalls-scroll-view"
      >
        {vehicles.length === 0 ? (
          <View style={styles.emptyState}>
            <Car size={64} color={Colors.text.muted} />
            <Text style={styles.emptyTitle}>No Vehicles Added</Text>
            <Text style={styles.emptyDescription}>
              Add vehicles to your garage to search for recalls and safety notices.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.vehicleSelector}>
              <Text style={styles.sectionTitle}>Select Vehicle</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.vehicleList}
              >
                <TouchableOpacity
                  style={[
                    styles.vehicleOption,
                    !selectedVehicleId && styles.vehicleOptionActive
                  ]}
                  onPress={() => {
                    setSelectedVehicleId(null);
                    setAllRecalls([]);
                    clearResults();
                  }}
                  testID="all-vehicles-option"
                >
                  <Text style={[
                    styles.vehicleOptionText,
                    !selectedVehicleId && styles.vehicleOptionTextActive
                  ]}>
                    All Vehicles
                  </Text>
                </TouchableOpacity>
                
                {vehicles.map((vehicle) => (
                  <TouchableOpacity
                    key={vehicle.id}
                    style={[
                      styles.vehicleOption,
                      selectedVehicleId === vehicle.id && styles.vehicleOptionActive
                    ]}
                    onPress={() => {
                      setSelectedVehicleId(vehicle.id);
                      setAllRecalls([]);
                      clearResults();
                    }}
                    testID={`vehicle-option-${vehicle.id}`}
                  >
                    <Text style={[
                      styles.vehicleOptionText,
                      selectedVehicleId === vehicle.id && styles.vehicleOptionTextActive
                    ]}>
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.searchSection}>
              <TouchableOpacity
                style={styles.searchButton}
                onPress={() => selectedVehicleId ? handleSearchRecalls() : handleSearchAllVehicles()}
                disabled={isLoading}
                testID="search-recalls-button"
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={Colors.text.primary} />
                ) : (
                  <Search size={20} color={Colors.text.primary} />
                )}
                <Text style={styles.searchButtonText}>
                  {isLoading 
                    ? 'Searching...' 
                    : selectedVehicleId 
                      ? 'Search Recalls' 
                      : 'Search All Vehicles'
                  }
                </Text>
              </TouchableOpacity>
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <AlertTriangle size={20} color={Colors.status.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {hasRecalls && (
              <View style={styles.statsSection}>
                <Text style={styles.sectionTitle}>
                  Found {displayRecalls.length} Recall{displayRecalls.length !== 1 ? 's' : ''}
                </Text>
                <View style={styles.statsGrid}>
                  {severityStats.critical > 0 && (
                    <View style={[styles.statItem, { backgroundColor: '#DC2626' }]}>
                      <Text style={styles.statNumber}>{severityStats.critical}</Text>
                      <Text style={styles.statLabel}>Critical</Text>
                    </View>
                  )}
                  {severityStats.high > 0 && (
                    <View style={[styles.statItem, { backgroundColor: '#EA580C' }]}>
                      <Text style={styles.statNumber}>{severityStats.high}</Text>
                      <Text style={styles.statLabel}>High</Text>
                    </View>
                  )}
                  {severityStats.medium > 0 && (
                    <View style={[styles.statItem, { backgroundColor: '#D97706' }]}>
                      <Text style={styles.statNumber}>{severityStats.medium}</Text>
                      <Text style={styles.statLabel}>Medium</Text>
                    </View>
                  )}
                  {severityStats.low > 0 && (
                    <View style={[styles.statItem, { backgroundColor: '#65A30D' }]}>
                      <Text style={styles.statNumber}>{severityStats.low}</Text>
                      <Text style={styles.statLabel}>Low</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            <View style={styles.recallsList}>
              {displayRecalls.map((recall, index) => (
                <RecallCard
                  key={recall.id}
                  recall={recall}
                  testId={`recall-card-${index}`}
                />
              ))}
            </View>

            {!isLoading && !hasRecalls && (searchResults || allRecalls.length === 0) && (
              <View style={styles.noRecallsState}>
                <AlertTriangle size={48} color={Colors.status.success} />
                <Text style={styles.noRecallsTitle}>No Recalls Found</Text>
                <Text style={styles.noRecallsDescription}>
                  {selectedVehicle 
                    ? `No active recalls found for your ${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}.`
                    : 'No active recalls found for any of your vehicles.'
                  }
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    padding: 16,
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: Colors.text.muted,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 32,
  },
  vehicleSelector: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  vehicleList: {
    flexDirection: 'row',
  },
  vehicleOption: {
    backgroundColor: Colors.background.light,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.background.light,
  },
  vehicleOptionActive: {
    backgroundColor: Colors.secondary.main,
    borderColor: Colors.secondary.main,
  },
  vehicleOptionText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  vehicleOptionTextActive: {
    color: Colors.background.main,
    fontWeight: '600',
  },
  searchSection: {
    marginBottom: 20,
  },
  searchButton: {
    backgroundColor: Colors.primary.main,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 8,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.status.error + '20',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors.status.error,
    flex: 1,
  },
  statsSection: {
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    minWidth: 60,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.text.primary,
    marginTop: 2,
  },
  recallsList: {
    gap: 12,
  },
  noRecallsState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noRecallsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  noRecallsDescription: {
    fontSize: 14,
    color: Colors.text.muted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
  },
});