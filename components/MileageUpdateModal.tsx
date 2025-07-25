import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Modal, 
  TouchableOpacity, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { X } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Button } from './Button';

interface MileageUpdateModalProps {
  visible: boolean;
  currentMileage?: number;
  vehicleName: string;
  onClose: () => void;
  onSave: (mileage: number) => void;
  isHomeItem?: boolean;
}

export const MileageUpdateModal: React.FC<MileageUpdateModalProps> = ({
  visible,
  currentMileage = 0,
  vehicleName,
  onClose,
  onSave,
  isHomeItem = false
}) => {
  const [mileage, setMileage] = useState(currentMileage.toString());
  const [error, setError] = useState('');

  const handleSave = () => {
    const newMileage = parseInt(mileage.replace(/,/g, ''), 10);
    
    if (isNaN(newMileage)) {
      setError('Please enter a valid number');
      return;
    }
    
    if (newMileage < currentMileage) {
      setError(isHomeItem 
        ? 'New hours cannot be less than current hours' 
        : 'New mileage cannot be less than current mileage'
      );
      return;
    }
    
    onSave(newMileage);
  };

  const formatMileage = (value: string) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Format with commas
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleMileageChange = (value: string) => {
    setError('');
    setMileage(formatMileage(value));
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.centeredView}
        >
          <View style={styles.modalView}>
            <View style={styles.header}>
              <Text style={styles.title}>
                {isHomeItem ? 'Update Hours' : 'Update Mileage'}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color={Colors.text.muted} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.vehicleName}>{vehicleName}</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {isHomeItem ? 'Current Hours' : 'Current Mileage'}
              </Text>
              <TextInput
                style={styles.input}
                value={mileage}
                onChangeText={handleMileageChange}
                keyboardType="numeric"
                placeholder={isHomeItem ? 'Enter current hours' : 'Enter current mileage'}
                placeholderTextColor={Colors.text.muted}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
            
            <View style={styles.buttonContainer}>
              <Button 
                title="Cancel" 
                onPress={onClose} 
                variant="outline"
                style={styles.cancelButton}
              />
              <Button 
                title="Save" 
                onPress={handleSave} 
                style={styles.saveButton}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '85%',
    backgroundColor: Colors.background.main,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  vehicleName: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
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
    fontSize: 18,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.background.light,
  },
  errorText: {
    color: Colors.status.error,
    fontSize: 14,
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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