import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { trpc } from '@/lib/trpc';

export default function TrpcTest() {
  const [name, setName] = useState<string>('World');
  
  const hiMutation = trpc.example.hi.useMutation();

  const handleTest = () => {
    hiMutation.mutate({ name });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>tRPC Test</Text>
      
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter name"
        placeholderTextColor="#666"
      />
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleTest}
        disabled={hiMutation.isPending}
      >
        <Text style={styles.buttonText}>
          {hiMutation.isPending ? 'Loading...' : 'Test tRPC'}
        </Text>
      </TouchableOpacity>
      
      {hiMutation.data && (
        <View style={styles.result}>
          <Text style={styles.resultText}>
            Response: {hiMutation.data.hello}
          </Text>
          <Text style={styles.resultText}>
            Date: {hiMutation.data.date.toLocaleString()}
          </Text>
        </View>
      )}
      
      {hiMutation.error && (
        <Text style={styles.error}>
          Error: {hiMutation.error.message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    margin: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  result: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  resultText: {
    fontSize: 14,
    marginBottom: 5,
  },
  error: {
    color: 'red',
    fontSize: 14,
  },
});