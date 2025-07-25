import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  ScrollView, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { X, Camera, Upload, Search, CheckCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { useVehicleStore } from '@/hooks/useVehicleStore';
import { useMaintenanceSearch } from '@/hooks/useMaintenanceSearch';
import { Vehicle } from '@/types/vehicle';

export default function AddVehicleScreen() {
  const router = useRouter();
  const { addVehicleWithTasks } = useVehicleStore();
  const { isSearching, searchMaintenanceTasks } = useMaintenanceSearch();
  
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [mileage, setMileage] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [searchComplete, setSearchComplete] = useState(false);
  const [tasksFound, setTasksFound] = useState(0);
  const [errors, setErrors] = useState({
    make: '',
    model: '',
    year: '',
    mileage: '',
  });
  
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      make: '',
      model: '',
      year: '',
      mileage: '',
    };
    
    if (!make.trim()) {
      newErrors.make = 'Make is required';
      isValid = false;
    }
    
    if (!model.trim()) {
      newErrors.model = 'Model is required';
      isValid = false;
    }
    
    if (!year.trim()) {
      newErrors.year = 'Year is required';
      isValid = false;
    } else {
      const yearNum = parseInt(year, 10);
      const currentYear = new Date().getFullYear();
      if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 1) {
        newErrors.year = `Year must be between 1900 and ${currentYear + 1}`;
        isValid = false;
      }
    }
    
    if (!mileage.trim()) {
      newErrors.mileage = 'Mileage is required';
      isValid = false;
    } else {
      const mileageNum = parseInt(mileage.replace(/,/g, ''), 10);
      if (isNaN(mileageNum) || mileageNum < 0) {
        newErrors.mileage = 'Mileage must be a positive number';
        isValid = false;
      }
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSave = async () => {
    if (!validateForm()) return;
    
    const newVehicle: Vehicle = {
      id: Date.now().toString(),
      make: make.trim(),
      model: model.trim(),
      year: parseInt(year, 10),
      mileage: parseInt(mileage.replace(/,/g, ''), 10),
      image: image || undefined,
      pendingTasks: 0,
      lastUpdated: new Date().toISOString(),
    };
    
    try {
      // Search for maintenance tasks
      const searchResult = await searchMaintenanceTasks(newVehicle);
      
      if (searchResult.success) {
        setTasksFound(searchResult.tasks.length);
        setSearchComplete(true);
        
        // Add vehicle with tasks
        await addVehicleWithTasks(newVehicle, searchResult.tasks);
        
        // Show success message
        setTimeout(() => {
          router.replace('/');
        }, 2000);
      } else {
        // If search fails, still add the vehicle but show warning
        Alert.alert(
          'Search Failed',
          `Could not automatically find maintenance tasks: ${searchResult.error}. Vehicle will be added without tasks.`,
          [
            {
              text: 'Add Anyway',
              onPress: async () => {
                await addVehicleWithTasks(newVehicle, []);
                router.replace('/');
              }
            },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save vehicle. Please try again.');
    }
  };
  
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };
  
  const formatMileage = (value: string) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Format with commas
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  
  const handleMileageChange = (value: string) => {
    setMileage(formatMileage(value));
  };

  // Show search progress
  if (isSearching) {
    return (
      <View style={styles.searchingContainer}>
        <Stack.Screen 
          options={{
            headerLeft: () => null,
            title: "Adding Vehicle",
          }} 
        />
        
        <View style={styles.searchingContent}>
          <ActivityIndicator size="large" color={Colors.secondary.main} />
          <Text style={styles.searchingTitle}>Searching for Maintenance Tasks</Text>
          <Text style={styles.searchingText}>
            Finding recommended maintenance schedules for your {year} {make} {model}...
          </Text>
          <View style={styles.searchingSteps}>
            <View style={styles.searchStep}>
              <Search size={16} color={Colors.secondary.main} />
              <Text style={styles.searchStepText}>Analyzing vehicle specifications</Text>
            </View>
            <View style={styles.searchStep}>
              <Search size={16} color={Colors.secondary.main} />
              <Text style={styles.searchStepText}>Finding maintenance intervals</Text>
            </View>
            <View style={styles.searchStep}>
              <Search size={16} color={Colors.secondary.main} />
              <Text style={styles.searchStepText}>Creating maintenance schedule</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Show search complete
  if (searchComplete) {
    return (
      <View style={styles.searchingContainer}>
        <Stack.Screen 
          options={{
            headerLeft: () => null,
            title: "Vehicle Added",
          }} 
        />
        
        <View style={styles.searchingContent}>
          <CheckCircle size={64} color={Colors.status.success} />
          <Text style={styles.searchingTitle}>Vehicle Added Successfully!</Text>
          <Text style={styles.searchingText}>
            Found {tasksFound} maintenance tasks for your {year} {make} {model}
          </Text>
          <Text style={styles.searchingSubtext}>
            You'll be redirected to your dashboard shortly...
          </Text>
        </View>
      </View>
    );
  }
  
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
        <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.vehicleImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Camera size={32} color={Colors.text.muted} />
              <Text style={styles.imagePlaceholderText}>Add Vehicle Photo</Text>
              <Upload size={20} color={Colors.text.muted} />
            </View>
          )}
        </TouchableOpacity>
        
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Make</Text>
            <TextInput
              style={styles.input}
              value={make}
              onChangeText={setMake}
              placeholder="e.g. Toyota"
              placeholderTextColor={Colors.text.muted}
            />
            {errors.make ? <Text style={styles.errorText}>{errors.make}</Text> : null}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Model</Text>
            <TextInput
              style={styles.input}
              value={model}
              onChangeText={setModel}
              placeholder="e.g. Camry"
              placeholderTextColor={Colors.text.muted}
            />
            {errors.model ? <Text style={styles.errorText}>{errors.model}</Text> : null}
          </View>
          
          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, styles.inputHalf]}>
              <Text style={styles.inputLabel}>Year</Text>
              <TextInput
                style={styles.input}
                value={year}
                onChangeText={setYear}
                placeholder="e.g. 2022"
                placeholderTextColor={Colors.text.muted}
                keyboardType="numeric"
                maxLength={4}
              />
              {errors.year ? <Text style={styles.errorText}>{errors.year}</Text> : null}
            </View>
            
            <View style={[styles.inputGroup, styles.inputHalf]}>
              <Text style={styles.inputLabel}>Current Mileage</Text>
              <TextInput
                style={styles.input}
                value={mileage}
                onChangeText={handleMileageChange}
                placeholder="e.g. 25,000"
                placeholderTextColor={Colors.text.muted}
                keyboardType="numeric"
              />
              {errors.mileage ? <Text style={styles.errorText}>{errors.mileage}</Text> : null}
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Search size={24} color={Colors.secondary.main} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Automatic Maintenance Search</Text>
            <Text style={styles.infoText}>
              We'll automatically search for recommended maintenance tasks and schedules specific to your vehicle.
            </Text>
          </View>
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
          title="Add Vehicle & Search Tasks" 
          onPress={handleSave} 
          style={styles.saveButton}
          icon={<Search size={20} color={Colors.text.primary} />}
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
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.background.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: Colors.text.muted,
    marginVertical: 8,
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
  errorText: {
    color: Colors.status.error,
    fontSize: 12,
    marginTop: 4,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputHalf: {
    width: '48%',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.background.light,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
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
  searchingContainer: {
    flex: 1,
    backgroundColor: Colors.background.dark,
  },
  searchingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  searchingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  searchingText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  searchingSubtext: {
    fontSize: 14,
    color: Colors.text.muted,
    textAlign: 'center',
    marginTop: 16,
  },
  searchingSteps: {
    alignItems: 'flex-start',
  },
  searchStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchStepText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 12,
  },
});