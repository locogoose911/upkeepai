import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  ScrollView, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { X, Calendar, Clock } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useVehicleStore } from '@/hooks/useVehicleStore';
import { MaintenanceTask } from '@/types/maintenance';

export default function AddMaintenanceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ vehicleId?: string }>();
  const { vehicles, addMaintenanceTask } = useVehicleStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>(params.vehicleId);
  const [intervalMonths, setIntervalMonths] = useState('');
  const [intervalHours, setIntervalHours] = useState('');
  const [intervalMiles, setIntervalMiles] = useState('');
  const [timeIntervalType, setTimeIntervalType] = useState<'months' | 'hours'>('months');
  const [errors, setErrors] = useState({
    title: '',
    vehicle: '',
    interval: '',
  });
  
  useEffect(() => {
    if (params.vehicleId) {
      setSelectedVehicleId(params.vehicleId);
    }
  }, [params.vehicleId]);
  
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      title: '',
      vehicle: '',
      interval: '',
    };
    
    if (!title.trim()) {
      newErrors.title = 'Task name is required';
      isValid = false;
    }
    
    if (!selectedVehicleId) {
      newErrors.vehicle = 'Please select a vehicle';
      isValid = false;
    }
    
    if (!intervalMonths && !intervalHours && !intervalMiles) {
      newErrors.interval = 'Please specify at least one interval (time or mileage)';
      isValid = false;
    }
    
    if (intervalMonths && isNaN(parseInt(intervalMonths, 10))) {
      newErrors.interval = 'Months must be a valid number';
      isValid = false;
    }
    
    if (intervalHours && isNaN(parseInt(intervalHours, 10))) {
      newErrors.interval = 'Hours must be a valid number';
      isValid = false;
    }
    
    if (intervalMiles && isNaN(parseInt(intervalMiles.replace(/,/g, ''), 10))) {
      newErrors.interval = 'Miles must be a valid number';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSave = async () => {
    if (!validateForm()) return;
    
    const vehicle = vehicles.find(v => v.id === selectedVehicleId);
    if (!vehicle) {
      Alert.alert('Error', 'Selected vehicle not found');
      return;
    }
    
    // Calculate next due date based on interval
    const nextDueDate = new Date();
    if (intervalMonths) {
      nextDueDate.setMonth(nextDueDate.getMonth() + parseInt(intervalMonths, 10));
    }
    
    // Calculate next due mileage and hours based on interval
    const nextDueMileage = intervalMiles 
      ? (vehicle.mileage || 0) + parseInt(intervalMiles.replace(/,/g, ''), 10)
      : undefined;
      
    const nextDueHours = intervalHours 
      ? (vehicle.hoursUsed || 0) + parseInt(intervalHours, 10)
      : undefined;
    
    const newTask: MaintenanceTask = {
      id: Date.now().toString(),
      vehicleId: selectedVehicleId!,
      vehicleName: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      title: title.trim(),
      description: description.trim(),
      intervalMonths: intervalMonths ? parseInt(intervalMonths, 10) : undefined,
      intervalHours: intervalHours ? parseInt(intervalHours, 10) : undefined,
      intervalMiles: intervalMiles ? parseInt(intervalMiles.replace(/,/g, ''), 10) : undefined,
      nextDueDate: nextDueDate.toISOString(),
      nextDueMileage,
      nextDueHours,
      status: 'upcoming',
    };
    
    try {
      await addMaintenanceTask(newTask);
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save maintenance task. Please try again.');
    }
  };
  
  const formatMileage = (value: string) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Format with commas
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  
  const handleMileageChange = (value: string) => {
    setIntervalMiles(formatMileage(value));
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <Stack.Screen 
        options={{
          headerLeft: () => (
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => router.back()}
            >
              <X size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Maintenance Task</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Oil Change"
              placeholderTextColor={Colors.text.muted}
            />
            {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add details about this maintenance task"
              placeholderTextColor={Colors.text.muted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Vehicle</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.vehicleList}
            >
              {vehicles.map(vehicle => (
                <TouchableOpacity
                  key={vehicle.id}
                  style={[
                    styles.vehicleCard,
                    selectedVehicleId === vehicle.id && styles.vehicleCardSelected
                  ]}
                  onPress={() => setSelectedVehicleId(vehicle.id)}
                >
                  <Text style={styles.vehicleCardText}>
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {errors.vehicle ? <Text style={styles.errorText}>{errors.vehicle}</Text> : null}
          </View>
          
          <Card style={styles.intervalCard}>
            <Text style={styles.cardTitle}>Maintenance Interval</Text>
            
            <View style={styles.intervalRow}>
              <View style={styles.intervalItem}>
                <View style={styles.intervalHeader}>
                  <Calendar size={16} color={Colors.text.muted} />
                  <Text style={styles.intervalLabel}>Time-Based</Text>
                </View>
                
                {/* Time interval type selector */}
                <View style={styles.timeTypeSelector}>
                  <TouchableOpacity
                    style={[
                      styles.timeTypeButton,
                      timeIntervalType === 'months' && styles.timeTypeButtonActive
                    ]}
                    onPress={() => {
                      setTimeIntervalType('months');
                      setIntervalHours('');
                    }}
                  >
                    <Text style={[
                      styles.timeTypeButtonText,
                      timeIntervalType === 'months' && styles.timeTypeButtonTextActive
                    ]}>Months</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.timeTypeButton,
                      timeIntervalType === 'hours' && styles.timeTypeButtonActive
                    ]}
                    onPress={() => {
                      setTimeIntervalType('hours');
                      setIntervalMonths('');
                    }}
                  >
                    <Text style={[
                      styles.timeTypeButtonText,
                      timeIntervalType === 'hours' && styles.timeTypeButtonTextActive
                    ]}>Hours</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.intervalInputContainer}>
                  {timeIntervalType === 'months' ? (
                    <>
                      <TextInput
                        style={styles.intervalInput}
                        value={intervalMonths}
                        onChangeText={setIntervalMonths}
                        placeholder="3"
                        placeholderTextColor={Colors.text.muted}
                        keyboardType="numeric"
                      />
                      <Text style={styles.intervalUnit}>months</Text>
                    </>
                  ) : (
                    <>
                      <TextInput
                        style={styles.intervalInput}
                        value={intervalHours}
                        onChangeText={setIntervalHours}
                        placeholder="15"
                        placeholderTextColor={Colors.text.muted}
                        keyboardType="numeric"
                      />
                      <Text style={styles.intervalUnit}>hours</Text>
                    </>
                  )}
                </View>
              </View>
              
              <View style={styles.intervalDivider} />
              
              <View style={styles.intervalItem}>
                <View style={styles.intervalHeader}>
                  <Clock size={16} color={Colors.text.muted} />
                  <Text style={styles.intervalLabel}>Mileage-Based</Text>
                </View>
                <View style={styles.intervalInputContainer}>
                  <TextInput
                    style={styles.intervalInput}
                    value={intervalMiles}
                    onChangeText={handleMileageChange}
                    placeholder="5,000"
                    placeholderTextColor={Colors.text.muted}
                    keyboardType="numeric"
                  />
                  <Text style={styles.intervalUnit}>miles</Text>
                </View>
              </View>
            </View>
            
            {errors.interval ? <Text style={styles.errorText}>{errors.interval}</Text> : null}
            
            <Text style={styles.intervalHelp}>
              Specify at least one interval. The app will remind you when maintenance is due based on time, hours of operation, mileage, or whichever comes first.
            </Text>
          </Card>
        </View>
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Cancel" 
          onPress={() => router.back()} 
          variant="outline"
          style={styles.cancelButton}
        />
        <Button 
          title="Save Task" 
          onPress={handleSave} 
          style={styles.saveButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.dark,
  },
  closeButton: {
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  formContainer: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text.primary,
  },
  textArea: {
    height: 100,
    paddingTop: 16,
  },
  errorText: {
    color: Colors.status.error,
    fontSize: 12,
    marginTop: 4,
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
  intervalCard: {
    marginTop: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  intervalRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  intervalItem: {
    flex: 1,
  },
  intervalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  intervalLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 6,
  },
  intervalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  intervalInput: {
    backgroundColor: Colors.background.main,
    borderRadius: 8,
    padding: 12,
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
  },
  intervalUnit: {
    fontSize: 14,
    color: Colors.text.muted,
    marginLeft: 8,
    width: 50,
  },
  intervalDivider: {
    width: 1,
    backgroundColor: Colors.background.main,
    marginHorizontal: 16,
  },
  intervalHelp: {
    fontSize: 12,
    color: Colors.text.muted,
    lineHeight: 18,
  },
  timeTypeSelector: {
    flexDirection: 'row',
    marginBottom: 8,
    backgroundColor: Colors.background.main,
    borderRadius: 8,
    padding: 2,
  },
  timeTypeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  timeTypeButtonActive: {
    backgroundColor: Colors.primary.main,
  },
  timeTypeButtonText: {
    fontSize: 12,
    color: Colors.text.muted,
    fontWeight: '500',
  },
  timeTypeButtonTextActive: {
    color: Colors.text.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.background.dark,
    borderTopWidth: 1,
    borderTopColor: Colors.background.light,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
});