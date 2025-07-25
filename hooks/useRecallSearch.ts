import { useState, useCallback } from 'react';
import { Recall, RecallSearchParams, RecallSearchResult, RecallSeverity } from '@/types/recall';

const MOCK_RECALLS: Recall[] = [
  {
    id: '1',
    nhtsa_id: 'NHTSA-2023-001',
    make: 'Toyota',
    model: 'Camry',
    year: 2022,
    title: 'Airbag Inflator Defect',
    description: 'The airbag inflator may rupture during deployment, potentially causing injury to vehicle occupants.',
    severity: 'critical',
    date_issued: '2023-03-15',
    affected_components: ['Airbag System', 'Driver Airbag', 'Passenger Airbag'],
    remedy_description: 'Dealers will replace the airbag inflator free of charge.',
    manufacturer_contact: 'Toyota Customer Service: 1-800-331-4331',
    nhtsa_url: 'https://www.nhtsa.gov/recalls',
    affected_vehicles_count: 125000
  },
  {
    id: '2',
    nhtsa_id: 'NHTSA-2023-002',
    make: 'Honda',
    model: 'Civic',
    year: 2021,
    title: 'Brake System Malfunction',
    description: 'The brake pedal may become hard to press, potentially increasing stopping distance.',
    severity: 'high',
    date_issued: '2023-02-20',
    affected_components: ['Brake System', 'Brake Booster'],
    remedy_description: 'Dealers will inspect and replace the brake booster if necessary.',
    manufacturer_contact: 'Honda Customer Service: 1-888-946-6329',
    nhtsa_url: 'https://www.nhtsa.gov/recalls',
    affected_vehicles_count: 85000
  },
  {
    id: '3',
    nhtsa_id: 'NHTSA-2023-003',
    make: 'Ford',
    model: 'F-150',
    year: 2020,
    title: 'Transmission Fluid Leak',
    description: 'Transmission fluid may leak, potentially causing transmission failure.',
    severity: 'medium',
    date_issued: '2023-01-10',
    affected_components: ['Transmission', 'Transmission Seals'],
    remedy_description: 'Dealers will replace transmission seals and refill transmission fluid.',
    manufacturer_contact: 'Ford Customer Service: 1-800-392-3673',
    nhtsa_url: 'https://www.nhtsa.gov/recalls',
    affected_vehicles_count: 45000
  },
  {
    id: '4',
    nhtsa_id: 'NHTSA-2023-004',
    make: 'Chevrolet',
    model: 'Malibu',
    year: 2019,
    title: 'Engine Stalling Issue',
    description: 'Engine may stall unexpectedly while driving, increasing risk of crash.',
    severity: 'high',
    date_issued: '2023-04-05',
    affected_components: ['Engine', 'Fuel System', 'ECU'],
    remedy_description: 'Dealers will update engine software and replace fuel pump if necessary.',
    manufacturer_contact: 'Chevrolet Customer Service: 1-800-222-1020',
    nhtsa_url: 'https://www.nhtsa.gov/recalls',
    affected_vehicles_count: 67000
  },
  {
    id: '5',
    nhtsa_id: 'NHTSA-2023-005',
    make: 'Nissan',
    model: 'Altima',
    year: 2021,
    title: 'Seat Belt Pretensioner Defect',
    description: 'Seat belt pretensioner may not activate properly in a crash.',
    severity: 'medium',
    date_issued: '2023-05-12',
    affected_components: ['Seat Belt System', 'Pretensioner'],
    remedy_description: 'Dealers will replace the seat belt pretensioner assembly.',
    manufacturer_contact: 'Nissan Customer Service: 1-800-647-7261',
    nhtsa_url: 'https://www.nhtsa.gov/recalls',
    affected_vehicles_count: 32000
  }
];

export const useRecallSearch = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<RecallSearchResult | null>(null);

  const searchRecalls = useCallback(async (params: RecallSearchParams): Promise<RecallSearchResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const filteredRecalls = MOCK_RECALLS.filter(recall => 
        recall.make.toLowerCase() === params.make.toLowerCase() &&
        recall.model.toLowerCase() === params.model.toLowerCase() &&
        recall.year === params.year
      );

      const result: RecallSearchResult = {
        recalls: filteredRecalls,
        total_count: filteredRecalls.length,
        search_params: params
      };

      setSearchResults(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search recalls';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchRecallsForVehicle = useCallback(async (make: string, model: string, year: number) => {
    return searchRecalls({ make, model, year });
  }, [searchRecalls]);

  const getSeverityColor = useCallback((severity: RecallSeverity): string => {
    switch (severity) {
      case 'critical':
        return '#DC2626'; // red-600
      case 'high':
        return '#EA580C'; // orange-600
      case 'medium':
        return '#D97706'; // amber-600
      case 'low':
        return '#65A30D'; // lime-600
      default:
        return '#6B7280'; // gray-500
    }
  }, []);

  const getSeverityLabel = useCallback((severity: RecallSeverity): string => {
    switch (severity) {
      case 'critical':
        return 'Critical';
      case 'high':
        return 'High';
      case 'medium':
        return 'Medium';
      case 'low':
        return 'Low';
      default:
        return 'Unknown';
    }
  }, []);

  const clearResults = useCallback(() => {
    setSearchResults(null);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    searchResults,
    searchRecalls,
    searchRecallsForVehicle,
    getSeverityColor,
    getSeverityLabel,
    clearResults
  };
};