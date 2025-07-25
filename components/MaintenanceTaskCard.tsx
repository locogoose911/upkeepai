import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Clock, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { MaintenanceTask } from '@/types/maintenance';

interface MaintenanceTaskCardProps {
  task: MaintenanceTask;
  onPress: (task: MaintenanceTask) => void;
}

export const MaintenanceTaskCard: React.FC<MaintenanceTaskCardProps> = ({ task, onPress }) => {
  const getStatusColor = () => {
    if (task.status === 'overdue') return Colors.status.error;
    if (task.status === 'upcoming') return Colors.status.warning;
    if (task.status === 'completed') return Colors.status.success;
    return Colors.text.muted;
  };

  const getStatusIcon = () => {
    if (task.status === 'overdue') return <AlertTriangle size={20} color={Colors.status.error} />;
    if (task.status === 'upcoming') return <Clock size={20} color={Colors.status.warning} />;
    if (task.status === 'completed') return <CheckCircle size={20} color={Colors.status.success} />;
    return <Clock size={20} color={Colors.text.muted} />;
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(task)}
      activeOpacity={0.8}
    >
      <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <View style={styles.statusIconContainer}>
            {getStatusIcon()}
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{task.title}</Text>
            <Text style={styles.vehicleName}>{task.vehicleName}</Text>
          </View>
        </View>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Due</Text>
            <Text style={styles.detailValue}>
              {new Date(task.nextDueDate).toLocaleDateString()}
            </Text>
          </View>
          {task.nextDueMileage && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Mileage</Text>
              <Text style={styles.detailValue}>{task.nextDueMileage.toLocaleString()}</Text>
            </View>
          )}
          {task.nextDueHours && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Hours</Text>
              <Text style={styles.detailValue}>{task.nextDueHours.toLocaleString()}</Text>
            </View>
          )}
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Interval</Text>
            <Text style={styles.detailValue}>
              {task.intervalMonths ? `${task.intervalMonths} mo` : ''}
              {task.intervalHours ? `${task.intervalHours} hr` : ''}
              {(task.intervalMonths || task.intervalHours) && task.intervalMiles ? ' / ' : ''}
              {task.intervalMiles ? `${task.intervalMiles.toLocaleString()} mi` : ''}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.chevronContainer}>
        <ChevronRight size={20} color={Colors.text.muted} />
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
  statusIndicator: {
    width: 6,
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIconContainer: {
    marginRight: 8,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  vehicleName: {
    fontSize: 12,
    color: Colors.text.muted,
    marginTop: 2,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    marginRight: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.text.muted,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  chevronContainer: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});