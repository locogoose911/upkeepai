import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { Car, Settings, Home, Clock, Gauge } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Vehicle } from '@/types/vehicle';

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress: (vehicle: Vehicle) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(vehicle)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {vehicle.image ? (
          <Image source={{ uri: vehicle.image }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            {vehicle.type === 'vehicle' ? (
              <Car size={40} color={Colors.text.muted} />
            ) : (
              <Home size={40} color={Colors.text.muted} />
            )}
          </View>
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{vehicle.year} {vehicle.make} {vehicle.model}</Text>
        <View style={styles.detailsRow}>
          {vehicle.type === 'vehicle' && vehicle.mileage !== undefined ? (
            <View style={styles.detailItem}>
              <View style={styles.detailLabelRow}>
                <Gauge size={12} color={Colors.text.muted} />
                <Text style={styles.detailLabel}>Mileage</Text>
              </View>
              <Text style={styles.detailValue}>{vehicle.mileage.toLocaleString()} mi</Text>
            </View>
          ) : vehicle.type === 'home' && vehicle.hoursUsed !== undefined ? (
            <View style={styles.detailItem}>
              <View style={styles.detailLabelRow}>
                <Clock size={12} color={Colors.text.muted} />
                <Text style={styles.detailLabel}>Hours</Text>
              </View>
              <Text style={styles.detailValue}>{vehicle.hoursUsed.toLocaleString()} hrs</Text>
            </View>
          ) : (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>{vehicle.category || 'Other'}</Text>
            </View>
          )}
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Tasks</Text>
            <Text style={styles.detailValue}>{vehicle.pendingTasks || 0}</Text>
          </View>
        </View>
      </View>
      <View style={styles.iconContainer}>
        <Settings size={20} color={Colors.text.muted} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.light,
    borderRadius: 16,
    marginVertical: 8,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: 100,
    height: 100,
    backgroundColor: Colors.background.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.dark,
  },
  infoContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    marginRight: 16,
  },
  detailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.text.muted,
    marginLeft: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  iconContainer: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});