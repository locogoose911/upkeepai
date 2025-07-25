import { useState } from 'react';
import { MaintenanceTask } from '@/types/maintenance';
import { Vehicle } from '@/types/vehicle';

interface MaintenanceSearchResult {
  tasks: MaintenanceTask[];
  success: boolean;
  error?: string;
}

export const useMaintenanceSearch = () => {
  const [isSearching, setIsSearching] = useState(false);
  
  const searchMaintenanceTasks = async (vehicle: Vehicle): Promise<MaintenanceSearchResult> => {
    if (vehicle.type === 'home') {
      return searchHomeMaintenanceTasks(vehicle);
    }
    return searchVehicleMaintenanceTasks(vehicle);
  };
  
  const searchVehicleMaintenanceTasks = async (vehicle: Vehicle): Promise<MaintenanceSearchResult> => {
    setIsSearching(true);
    
    try {
      const prompt = `You are a vehicle maintenance expert. For a ${vehicle.year} ${vehicle.make} ${vehicle.model}, provide a comprehensive list of maintenance tasks with intervals.

Return ONLY a JSON array of maintenance tasks with this exact structure:
[
  {
    "title": "Oil Change",
    "description": "Replace engine oil and filter",
    "intervalMonths": 6,
    "intervalMiles": 5000
  },
  {
    "title": "Tire Rotation",
    "description": "Rotate tires to ensure even wear",
    "intervalMonths": 6,
    "intervalMiles": 7500
  }
]

Include these common maintenance tasks with appropriate intervals for this specific vehicle:
- Oil changes
- Tire rotation
- Air filter replacement
- Cabin air filter replacement
- Brake inspection
- Transmission fluid change
- Coolant flush
- Spark plug replacement
- Brake fluid change
- Power steering fluid change
- Differential service
- Timing belt replacement (if applicable)
- Fuel filter replacement

Provide realistic intervals based on manufacturer recommendations for this specific year, make, and model. Include both time-based (months) and mileage-based intervals where appropriate.`;

      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a vehicle maintenance expert. Always respond with valid JSON only, no additional text or formatting.'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to search maintenance tasks');
      }

      const data = await response.json();
      
      // Parse the AI response
      let maintenanceTasks;
      try {
        // Clean the response to ensure it's valid JSON
        const cleanedResponse = data.completion.replace(/```json\n?|\n?```/g, '').trim();
        maintenanceTasks = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error('Failed to parse AI response:', data.completion);
        throw new Error('Invalid response format from AI');
      }

      if (!Array.isArray(maintenanceTasks)) {
        throw new Error('AI response is not an array');
      }

      // Convert to MaintenanceTask objects
      const tasks: MaintenanceTask[] = maintenanceTasks.map((task: any, index: number) => {
        // Calculate next due date
        const nextDueDate = new Date();
        if (task.intervalMonths) {
          nextDueDate.setMonth(nextDueDate.getMonth() + task.intervalMonths);
        }

        // Calculate next due mileage
        const nextDueMileage = task.intervalMiles 
          ? (vehicle.mileage || 0) + task.intervalMiles 
          : undefined;

        return {
          id: `${vehicle.id}-task-${Date.now()}-${index}`,
          vehicleId: vehicle.id,
          vehicleName: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
          title: task.title || 'Maintenance Task',
          description: task.description || '',
          intervalMonths: task.intervalMonths || undefined,
          intervalMiles: task.intervalMiles || undefined,
          nextDueDate: nextDueDate.toISOString(),
          nextDueMileage,
          status: 'upcoming' as const,
        };
      });

      setIsSearching(false);
      return { tasks, success: true };
    } catch (error) {
      console.error('Error searching maintenance tasks:', error);
      setIsSearching(false);
      return { 
        tasks: [], 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  };

  const searchHomeMaintenanceTasks = async (homeItem: Vehicle): Promise<MaintenanceSearchResult> => {
    setIsSearching(true);
    
    try {
      const categoryContext = getCategoryContext(homeItem.category || 'other');
      
      const prompt = `You are a home maintenance expert with access to major home improvement retailers. For a ${homeItem.year} ${homeItem.make} ${homeItem.model} (${categoryContext}), provide a comprehensive list of maintenance tasks with intervals.

Return ONLY a JSON array of maintenance tasks with this exact structure:
[
  {
    "title": "Filter Replacement",
    "description": "Replace air filter for optimal performance. Compatible parts available at Lowe's, Home Depot, Tractor Supply, and Amazon.",
    "intervalMonths": 3,
    "intervalHours": 50
  },
  {
    "title": "Oil Change",
    "description": "Change engine oil and filter. Oil and filters can be found at Home Depot, Lowe's, Tractor Supply, and Amazon.",
    "intervalMonths": 12,
    "intervalHours": 25
  }
]

For home items, focus on:
- Time-based intervals (months) for seasonal maintenance
- Hour-based intervals for equipment that tracks usage hours
- Include both where appropriate (some tasks are time-based, others are usage-based)
- Reference availability at major home improvement retailers

Provide realistic maintenance intervals based on manufacturer recommendations and industry standards for this specific type of ${categoryContext}. Include common maintenance tasks like:
- Filter replacements (mention Lowe's, Home Depot, and Tractor Supply carry compatible filters)
- Oil/fluid changes (note these retailers stock oils and fluids)
- Belt/blade replacements (reference parts availability at home improvement stores)
- Cleaning and inspection tasks
- Seasonal preparation tasks
- Safety checks

When describing maintenance tasks, mention that replacement parts, oils, filters, and maintenance supplies are readily available at Lowe's, Home Depot, Tractor Supply, and Amazon. Prioritize mentioning Lowe's, Home Depot, and Tractor Supply as the primary sources for home equipment parts and supplies, with Amazon as an additional option.

Consider the specific category and provide relevant maintenance tasks with home improvement retailer sourcing context.`;

      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a home maintenance expert. Always respond with valid JSON only, no additional text or formatting.'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to search maintenance tasks');
      }

      const data = await response.json();
      
      // Parse the AI response
      let maintenanceTasks;
      try {
        // Clean the response to ensure it's valid JSON
        const cleanedResponse = data.completion.replace(/```json\n?|\n?```/g, '').trim();
        maintenanceTasks = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error('Failed to parse AI response:', data.completion);
        throw new Error('Invalid response format from AI');
      }

      if (!Array.isArray(maintenanceTasks)) {
        throw new Error('AI response is not an array');
      }

      // Convert to MaintenanceTask objects
      const tasks: MaintenanceTask[] = maintenanceTasks.map((task: any, index: number) => {
        // Calculate next due date
        const nextDueDate = new Date();
        if (task.intervalMonths) {
          nextDueDate.setMonth(nextDueDate.getMonth() + task.intervalMonths);
        }

        // Calculate next due hours
        const nextDueHours = task.intervalHours 
          ? (homeItem.hoursUsed || 0) + task.intervalHours 
          : undefined;

        return {
          id: `${homeItem.id}-task-${Date.now()}-${index}`,
          vehicleId: homeItem.id,
          vehicleName: `${homeItem.year} ${homeItem.make} ${homeItem.model}`,
          title: task.title || 'Maintenance Task',
          description: task.description || '',
          intervalMonths: task.intervalMonths || undefined,
          intervalHours: task.intervalHours || undefined,
          nextDueDate: nextDueDate.toISOString(),
          nextDueHours,
          status: 'upcoming' as const,
        };
      });

      setIsSearching(false);
      return { tasks, success: true };
    } catch (error) {
      console.error('Error searching home maintenance tasks:', error);
      setIsSearching(false);
      return { 
        tasks: [], 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  };
  
  const getCategoryContext = (category: string): string => {
    const categoryMap: Record<string, string> = {
      'hvac': 'HVAC system (heating, ventilation, air conditioning)',
      'lawn': 'lawn and garden equipment',
      'appliance': 'home appliance',
      'plumbing': 'plumbing equipment',
      'electrical': 'electrical equipment',
      'pool': 'pool and spa equipment',
      'generator': 'generator or power equipment',
      'security': 'security and safety equipment',
      'other': 'home equipment'
    };
    return categoryMap[category] || 'home equipment';
  };

  return {
    isSearching,
    searchMaintenanceTasks
  };
};