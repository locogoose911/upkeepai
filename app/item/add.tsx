import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Car, Home, ArrowRight, X } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

const itemTypes = [
  {
    id: 'vehicle',
    title: 'Vehicle',
    description: 'Cars, trucks, motorcycles, boats, etc.',
    icon: Car,
    examples: ['Car', 'Truck', 'Motorcycle', 'Boat', 'RV']
  },
  {
    id: 'home',
    title: 'Home Item',
    description: 'Appliances, HVAC, lawn equipment, etc.',
    icon: Home,
    examples: ['Air Conditioner', 'Lawn Mower', 'Water Heater', 'Generator', 'Pool Equipment']
  }
];

export default function AddItemTypeScreen() {
  const router = useRouter();
  
  const handleTypeSelect = (type: string) => {
    router.push(`/item/add-${type}`);
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Add Item",
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
        <View style={styles.header}>
          <Text style={styles.title}>What would you like to add?</Text>
          <Text style={styles.subtitle}>
            Choose the type of item you want to track maintenance for.
          </Text>
        </View>
        
        <View style={styles.optionsContainer}>
          {itemTypes.map((itemType) => {
            const IconComponent = itemType.icon;
            return (
              <TouchableOpacity
                key={itemType.id}
                style={styles.optionCard}
                onPress={() => handleTypeSelect(itemType.id)}
                activeOpacity={0.7}
              >
                <View style={styles.optionHeader}>
                  <View style={styles.iconContainer}>
                    <IconComponent size={32} color={Colors.secondary.main} />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>{itemType.title}</Text>
                    <Text style={styles.optionDescription}>{itemType.description}</Text>
                  </View>
                  <ArrowRight size={20} color={Colors.text.muted} />
                </View>
                
                <View style={styles.examplesContainer}>
                  <Text style={styles.examplesLabel}>Examples:</Text>
                  <View style={styles.exampleTags}>
                    {itemType.examples.map((example, index) => (
                      <View key={index} style={styles.exampleTag}>
                        <Text style={styles.exampleText}>{example}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
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
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    backgroundColor: Colors.background.light,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  examplesContainer: {
    marginTop: 4,
  },
  examplesLabel: {
    fontSize: 12,
    color: Colors.text.muted,
    marginBottom: 8,
    fontWeight: '500',
  },
  exampleTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  exampleTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  exampleText: {
    fontSize: 11,
    color: Colors.text.muted,
  },
});