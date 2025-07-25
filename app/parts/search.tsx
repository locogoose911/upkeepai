import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Search, Filter, Star } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { PartOption } from '@/components/PartOption';
import { useVehicleStore } from '@/hooks/useVehicleStore';
import { usePartsSearch } from '@/hooks/usePartsSearch';
import { Part, PartTier } from '@/types/parts';

export default function PartsSearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ vehicleId?: string; partType?: string }>();
  const { vehicles } = useVehicleStore();
  const { isLoading, results, searchParts } = usePartsSearch();
  
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>(params.vehicleId);
  const [partType, setPartType] = useState(params.partType || '');
  const [selectedTier, setSelectedTier] = useState<PartTier | 'all'>('all');
  
  const vehicle = selectedVehicleId 
    ? vehicles.find(v => v.id === selectedVehicleId) 
    : undefined;
  
  useEffect(() => {
    if (vehicle && partType) {
      handleSearch();
    }
  }, []);
  
  const handleSearch = () => {
    if (!vehicle) {
      Alert.alert('Error', 'Please select a vehicle');
      return;
    }
    
    if (!partType.trim()) {
      Alert.alert('Error', 'Please enter a part type');
      return;
    }
    
    searchParts(vehicle.make, vehicle.model, vehicle.year, partType);
  };
  
  const handlePartPress = (part: Part) => {
    // In a real app, this would open the part details or external link
    Alert.alert(
      'View Part',
      `Would open ${part.source} to view ${part.name}`,
      [{ text: 'OK' }]
    );
  };
  
  const filteredResults = selectedTier === 'all' 
    ? results 
    : results.filter(part => part.tier === selectedTier);
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Find Parts",
        }} 
      />
      
      <View style={styles.searchContainer}>
        <View style={styles.vehicleSelector}>
          <Text style={styles.sectionLabel}>Select Vehicle</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.vehicleList}
          >
            {vehicles.map(v => (
              <TouchableOpacity
                key={v.id}
                style={[
                  styles.vehicleCard,
                  selectedVehicleId === v.id && styles.vehicleCardSelected
                ]}
                onPress={() => setSelectedVehicleId(v.id)}
              >
                <Text 
                  style={[
                    styles.vehicleCardText,
                    selectedVehicleId === v.id && styles.vehicleCardTextSelected
                  ]}
                >
                  {v.year} {v.make} {v.model}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.partTypeContainer}>
          <Text style={styles.sectionLabel}>Part Type</Text>
          <View style={styles.searchInputContainer}>
            <TextInput
              style={styles.searchInput}
              value={partType}
              onChangeText={setPartType}
              placeholder="e.g. Oil Filter, Brake Pads"
              placeholderTextColor={Colors.text.muted}
            />
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={handleSearch}
            >
              <Search size={20} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
          <Text style={styles.loadingText}>Searching for parts...</Text>
        </View>
      ) : results.length > 0 ? (
        <>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>
              {filteredResults.length} {filteredResults.length === 1 ? 'Result' : 'Results'}
            </Text>
            
            <View style={styles.filterContainer}>
              <Filter size={16} color={Colors.text.muted} />
              <Text style={styles.filterLabel}>Filter by Quality:</Text>
              
              <TouchableOpacity 
                style={[
                  styles.tierFilter,
                  selectedTier === 'all' && styles.tierFilterSelected
                ]}
                onPress={() => setSelectedTier('all')}
              >
                <Text 
                  style={[
                    styles.tierFilterText,
                    selectedTier === 'all' && styles.tierFilterTextSelected
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.tierFilter,
                  selectedTier === 'low' && styles.tierFilterSelected
                ]}
                onPress={() => setSelectedTier('low')}
              >
                <Star size={12} color={selectedTier === 'low' ? Colors.secondary.main : Colors.text.muted} />
                <Text 
                  style={[
                    styles.tierFilterText,
                    selectedTier === 'low' && styles.tierFilterTextSelected
                  ]}
                >
                  Economy
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.tierFilter,
                  selectedTier === 'mid' && styles.tierFilterSelected
                ]}
                onPress={() => setSelectedTier('mid')}
              >
                <View style={styles.starsContainer}>
                  <Star size={12} color={selectedTier === 'mid' ? Colors.secondary.main : Colors.text.muted} />
                  <Star size={12} color={selectedTier === 'mid' ? Colors.secondary.main : Colors.text.muted} />
                </View>
                <Text 
                  style={[
                    styles.tierFilterText,
                    selectedTier === 'mid' && styles.tierFilterTextSelected
                  ]}
                >
                  OEM
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.tierFilter,
                  selectedTier === 'high' && styles.tierFilterSelected
                ]}
                onPress={() => setSelectedTier('high')}
              >
                <View style={styles.starsContainer}>
                  <Star size={12} color={selectedTier === 'high' ? Colors.secondary.main : Colors.text.muted} />
                  <Star size={12} color={selectedTier === 'high' ? Colors.secondary.main : Colors.text.muted} />
                  <Star size={12} color={selectedTier === 'high' ? Colors.secondary.main : Colors.text.muted} />
                </View>
                <Text 
                  style={[
                    styles.tierFilterText,
                    selectedTier === 'high' && styles.tierFilterTextSelected
                  ]}
                >
                  Premium
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <ScrollView style={styles.resultsList} contentContainerStyle={styles.resultsContent}>
            {filteredResults.map(part => (
              <PartOption key={part.id} part={part} onPress={handlePartPress} />
            ))}
          </ScrollView>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Parts Found</Text>
          <Text style={styles.emptyText}>
            {vehicle && partType 
              ? `We couldn't find parts matching "${partType}" for your ${vehicle.year} ${vehicle.make} ${vehicle.model}.`
              : 'Select a vehicle and enter a part type to search for parts.'}
          </Text>
          <Button 
            title="Search Again" 
            onPress={handleSearch}
            icon={<Search size={20} color={Colors.text.primary} />}
            style={styles.searchAgainButton}
            disabled={!vehicle || !partType.trim()}
          />
        </View>
      )}
    </View>
  );
}

// Add TextInput component
import { TextInput } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: Colors.background.main,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.light,
  },
  vehicleSelector: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  vehicleList: {
    paddingRight: 16,
  },
  vehicleCard: {
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    padding: 12,
    marginRight: 8,
    minWidth: 150,
  },
  vehicleCardSelected: {
    backgroundColor: Colors.primary.main,
  },
  vehicleCardText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  vehicleCardTextSelected: {
    color: Colors.text.primary,
  },
  partTypeContainer: {
    marginBottom: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text.primary,
  },
  searchButton: {
    backgroundColor: Colors.secondary.main,
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: 16,
  },
  resultsHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.light,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  filterLabel: {
    fontSize: 14,
    color: Colors.text.muted,
    marginLeft: 6,
    marginRight: 8,
  },
  tierFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.light,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 8,
    marginTop: 8,
  },
  tierFilterSelected: {
    backgroundColor: Colors.primary.main,
  },
  tierFilterText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  tierFilterTextSelected: {
    color: Colors.text.primary,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  resultsList: {
    flex: 1,
  },
  resultsContent: {
    padding: 16,
    paddingBottom: 32,
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
  searchAgainButton: {
    width: '100%',
    maxWidth: 250,
  },
});