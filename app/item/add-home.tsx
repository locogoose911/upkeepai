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
  Alert
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { X, Camera, Upload, ChevronDown } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { useVehicleStore } from '@/hooks/useVehicleStore';
import { useMaintenanceSearch } from '@/hooks/useMaintenanceSearch';
import { Vehicle } from '@/types/vehicle';

const homeCategories = [
  { id: 'hvac', label: 'HVAC & Climate' },
  { id: 'lawn', label: 'Lawn & Garden' },
  { id: 'appliance', label: 'Appliances' },
  { id: 'plumbing', label: 'Plumbing' },
  { id: 'electrical', label: 'Electrical' },
  { id: 'pool', label: 'Pool & Spa' },
  { id: 'generator', label: 'Generator & Power' },
  { id: 'security', label: 'Security & Safety' },
  { id: 'other', label: 'Other' },
];

export default function AddHomeItemScreen() {
  const router = useRouter();
  const { addVehicleWithTasks } = useVehicleStore();
  const { isSearching, searchMaintenanceTasks } = useMaintenanceSearch();
  
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [category, setCategory] = useState('');
  const [hoursUsed, setHoursUsed] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [errors, setErrors] = useState({
    make: '',
    model: '',
    year: '',
    category: '',
    hoursUsed: '',
  });
  
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      make: '',
      model: '',
      year: '',
      category: '',
      hoursUsed: '',
    };
    
    if (!make.trim()) {
      newErrors.make = 'Brand/Make is required';
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
    
    if (!category) {
      newErrors.category = 'Category is required';
      isValid = false;
    }
    
    if (hoursUsed && hoursUsed.trim()) {
      const hoursNum = parseInt(hoursUsed.replace(/,/g, ''), 10);
      if (isNaN(hoursNum) || hoursNum < 0) {
        newErrors.hoursUsed = 'Hours must be a positive number';
        isValid = false;
      }
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSave = async () => {
    if (!validateForm()) return;
    
    const newHomeItem: Vehicle = {
      id: Date.now().toString(),
      type: 'home',
      make: make.trim(),
      model: model.trim(),
      year: parseInt(year, 10),
      category,
      hoursUsed: hoursUsed ? parseInt(hoursUsed.replace(/,/g, ''), 10) : undefined,
      image: image || undefined,
      pendingTasks: 0,
      lastUpdated: new Date().toISOString(),
    };
    
    try {
      console.log('Searching for maintenance tasks for home item:', newHomeItem);
      
      // Search for AI-generated maintenance tasks
      const maintenanceResult = await searchMaintenanceTasks(newHomeItem);
      
      if (maintenanceResult.success) {
        console.log('Found maintenance tasks:', maintenanceResult.tasks.length);
        await addVehicleWithTasks(newHomeItem, maintenanceResult.tasks);
        
        Alert.alert(
          'Home Item Added',
          `Your home item has been added successfully with ${maintenanceResult.tasks.length} maintenance tasks.`,
          [
            {
              text: 'OK',
              onPress: () => router.replace('/')
            }
          ]
        );
      } else {
        console.log('Failed to get maintenance tasks, adding item without tasks');
        await addVehicleWithTasks(newHomeItem, []);
        
        Alert.alert(
          'Home Item Added',
          'Your home item has been added successfully. Maintenance tasks could not be generated automatically - you can add them manually.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error saving home item:', error);
      Alert.alert('Error', 'Failed to save home item. Please try again.');
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
  
  const formatHours = (value: string) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Format with commas
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  
  const handleHoursChange = (value: string) => {
    setHoursUsed(formatHours(value));
  };

  const selectedCategory = homeCategories.find(cat => cat.id === category);
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <Stack.Screen 
        options={{
          title: "Add Home Item",
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
            <Image source={{ uri: image }} style={styles.itemImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Camera size={32} color={Colors.text.muted} />
              <Text style={styles.imagePlaceholderText}>Add Item Photo</Text>
              <Upload size={20} color={Colors.text.muted} />
            </View>
          )}
        </TouchableOpacity>
        
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category</Text>
            <TouchableOpacity 
              style={styles.pickerButton}
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            >
              <Text style={[styles.pickerText, !selectedCategory && styles.placeholderText]}>
                {selectedCategory ? selectedCategory.label : 'Select category'}
              </Text>
              <ChevronDown size={20} color={Colors.text.muted} />
            </TouchableOpacity>
            {errors.category ? <Text style={styles.errorText}>{errors.category}</Text> : null}
            
            {showCategoryPicker && (
              <View style={styles.categoryPicker}>
                {homeCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={styles.categoryOption}
                    onPress={() => {
                      setCategory(cat.id);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Text style={styles.categoryOptionText}>{cat.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Brand/Make</Text>
            <TextInput
              style={styles.input}
              value={make}
              onChangeText={setMake}
              placeholder="e.g. Carrier, Honda, Whirlpool"
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
              placeholder="e.g. HRX217VKA, 24ABC6"
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
              <Text style={styles.inputLabel}>Hours Used (Optional)</Text>
              <TextInput
                style={styles.input}
                value={hoursUsed}
                onChangeText={handleHoursChange}
                placeholder="e.g. 150"
                placeholderTextColor={Colors.text.muted}
                keyboardType="numeric"
              />
              {errors.hoursUsed ? <Text style={styles.errorText}>{errors.hoursUsed}</Text> : null}
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>AI-Powered Maintenance</Text>
            <Text style={styles.infoText}>
              Our AI will automatically generate appropriate maintenance tasks based on your home item category, make, and model. You can customize these tasks after adding the item.
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
          title={isSearching ? "Adding Item..." : "Add Home Item"} 
          onPress={handleSave} 
          style={styles.saveButton}
          disabled={isSearching}
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
  itemImage: {
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
  pickerButton: {
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  placeholderText: {
    color: Colors.text.muted,
  },
  categoryPicker: {
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
  },
  categoryOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryOptionText: {
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
});