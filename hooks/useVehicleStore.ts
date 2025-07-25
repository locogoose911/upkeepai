import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vehicle } from '@/types/vehicle';
import { MaintenanceTask } from '@/types/maintenance';
import { Part } from '@/types/parts';
import { Recall } from '@/types/recall';

interface VehicleState {
  vehicles: Vehicle[];
  maintenanceTasks: MaintenanceTask[];
  recalls: Recall[];
  isLoading: boolean;
  
  // Vehicle actions
  addVehicle: (vehicle: Vehicle) => Promise<void>;
  addVehicleWithTasks: (vehicle: Vehicle, tasks: MaintenanceTask[]) => Promise<void>;
  updateVehicle: (vehicle: Vehicle) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  updateVehicleMileage: (id: string, value: number) => Promise<void>;
  
  // Maintenance actions
  addMaintenanceTask: (task: MaintenanceTask) => Promise<void>;
  addMaintenanceTasks: (tasks: MaintenanceTask[]) => Promise<void>;
  updateMaintenanceTask: (task: MaintenanceTask) => Promise<void>;
  completeMaintenanceTask: (taskId: string, mileage: number) => Promise<void>;
  deleteMaintenanceTask: (id: string) => Promise<void>;
  
  // Recall actions
  addRecalls: (recalls: Recall[]) => Promise<void>;
  clearRecalls: () => Promise<void>;
  getRecallsForVehicle: (vehicleId: string) => Recall[];
  
  // Data loading
  loadData: () => Promise<void>;
}

export const useVehicleStore = create<VehicleState>((set, get) => ({
  vehicles: [],
  maintenanceTasks: [],
  recalls: [],
  isLoading: false,
  
  addVehicle: async (vehicle: Vehicle) => {
    const { vehicles } = get();
    const updatedVehicles = [...vehicles, vehicle];
    set({ vehicles: updatedVehicles });
    await AsyncStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
  },

  addVehicleWithTasks: async (vehicle: Vehicle, tasks: MaintenanceTask[]) => {
    const { vehicles, maintenanceTasks } = get();
    
    // Calculate pending tasks count
    const vehicleWithTasks = {
      ...vehicle,
      pendingTasks: tasks.filter(t => t.status !== 'completed').length
    };
    
    const updatedVehicles = [...vehicles, vehicleWithTasks];
    const updatedTasks = [...maintenanceTasks, ...tasks];
    
    set({ 
      vehicles: updatedVehicles,
      maintenanceTasks: updatedTasks
    });
    
    await AsyncStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
    await AsyncStorage.setItem('maintenanceTasks', JSON.stringify(updatedTasks));
  },
  
  updateVehicle: async (vehicle: Vehicle) => {
    const { vehicles } = get();
    const updatedVehicles = vehicles.map(v => 
      v.id === vehicle.id ? vehicle : v
    );
    set({ vehicles: updatedVehicles });
    await AsyncStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
  },
  
  deleteVehicle: async (id: string) => {
    const { vehicles, maintenanceTasks } = get();
    const updatedVehicles = vehicles.filter(v => v.id !== id);
    const updatedTasks = maintenanceTasks.filter(t => t.vehicleId !== id);
    
    set({ 
      vehicles: updatedVehicles,
      maintenanceTasks: updatedTasks
    });
    
    await AsyncStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
    await AsyncStorage.setItem('maintenanceTasks', JSON.stringify(updatedTasks));
  },
  
  updateVehicleMileage: async (id: string, value: number) => {
    const { vehicles, maintenanceTasks } = get();
    
    const vehicle = vehicles.find(v => v.id === id);
    if (!vehicle) return;
    
    // Update vehicle mileage or hours based on type
    const updatedVehicles = vehicles.map(v => {
      if (v.id === id) {
        if (v.type === 'vehicle') {
          return { ...v, mileage: value, lastUpdated: new Date().toISOString() };
        } else {
          return { ...v, hoursUsed: value, lastUpdated: new Date().toISOString() };
        }
      }
      return v;
    });
    
    // Update maintenance tasks based on new mileage/hours
    const updatedTasks = maintenanceTasks.map(task => {
      if (task.vehicleId !== id) return task;
      
      // Calculate new status based on mileage or hours
      let status = task.status;
      if (vehicle.type === 'vehicle' && task.nextDueMileage && value >= task.nextDueMileage) {
        status = 'overdue';
      } else if (vehicle.type === 'home' && task.nextDueHours && value >= task.nextDueHours) {
        status = 'overdue';
      }
      
      return { ...task, status };
    });
    
    set({ 
      vehicles: updatedVehicles,
      maintenanceTasks: updatedTasks
    });
    
    await AsyncStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
    await AsyncStorage.setItem('maintenanceTasks', JSON.stringify(updatedTasks));
  },
  
  addMaintenanceTask: async (task: MaintenanceTask) => {
    const { maintenanceTasks, vehicles } = get();
    const updatedTasks = [...maintenanceTasks, task];
    
    // Update vehicle pending tasks count
    const updatedVehicles = vehicles.map(v => {
      if (v.id === task.vehicleId) {
        const pendingTasks = updatedTasks.filter(
          t => t.vehicleId === v.id && t.status !== 'completed'
        ).length;
        return { ...v, pendingTasks };
      }
      return v;
    });
    
    set({ 
      maintenanceTasks: updatedTasks,
      vehicles: updatedVehicles
    });
    
    await AsyncStorage.setItem('maintenanceTasks', JSON.stringify(updatedTasks));
    await AsyncStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
  },

  addMaintenanceTasks: async (tasks: MaintenanceTask[]) => {
    const { maintenanceTasks, vehicles } = get();
    const updatedTasks = [...maintenanceTasks, ...tasks];
    
    // Update vehicle pending tasks counts
    const updatedVehicles = vehicles.map(v => {
      const vehicleTasks = tasks.filter(t => t.vehicleId === v.id);
      if (vehicleTasks.length > 0) {
        const pendingTasks = updatedTasks.filter(
          t => t.vehicleId === v.id && t.status !== 'completed'
        ).length;
        return { ...v, pendingTasks };
      }
      return v;
    });
    
    set({ 
      maintenanceTasks: updatedTasks,
      vehicles: updatedVehicles
    });
    
    await AsyncStorage.setItem('maintenanceTasks', JSON.stringify(updatedTasks));
    await AsyncStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
  },
  
  updateMaintenanceTask: async (task: MaintenanceTask) => {
    const { maintenanceTasks, vehicles } = get();
    const updatedTasks = maintenanceTasks.map(t => 
      t.id === task.id ? task : t
    );
    
    // Update vehicle pending tasks count
    const updatedVehicles = vehicles.map(v => {
      if (v.id === task.vehicleId) {
        const pendingTasks = updatedTasks.filter(
          t => t.vehicleId === v.id && t.status !== 'completed'
        ).length;
        return { ...v, pendingTasks };
      }
      return v;
    });
    
    set({ 
      maintenanceTasks: updatedTasks,
      vehicles: updatedVehicles
    });
    
    await AsyncStorage.setItem('maintenanceTasks', JSON.stringify(updatedTasks));
    await AsyncStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
  },
  
  completeMaintenanceTask: async (taskId: string, mileageOrHours: number) => {
    const { maintenanceTasks, vehicles } = get();
    const task = maintenanceTasks.find(t => t.id === taskId);
    
    if (!task) return;
    
    const completedDate = new Date();
    const vehicle = vehicles.find(v => v.id === task.vehicleId);
    
    if (!vehicle) return;
    
    // Calculate next due date and mileage/hours
    let nextDueDate = new Date(completedDate);
    if (task.intervalMonths) {
      nextDueDate.setMonth(nextDueDate.getMonth() + task.intervalMonths);
    }
    
    const nextDueMileage = task.intervalMiles 
      ? mileageOrHours + task.intervalMiles 
      : undefined;
      
    const nextDueHours = task.intervalHours 
      ? mileageOrHours + task.intervalHours 
      : undefined;
    
    // Update the task
    const updatedTask: MaintenanceTask = {
      ...task,
      lastCompletedDate: completedDate.toISOString(),
      lastCompletedMileage: vehicle.type === 'vehicle' ? mileageOrHours : task.lastCompletedMileage,
      lastCompletedHours: vehicle.type === 'home' ? mileageOrHours : task.lastCompletedHours,
      nextDueDate: nextDueDate.toISOString(),
      nextDueMileage,
      nextDueHours,
      status: 'completed'
    };
    
    // Create a new upcoming task for the next interval
    const newTaskId = Date.now().toString();
    const newTask: MaintenanceTask = {
      ...task,
      id: newTaskId,
      lastCompletedDate: completedDate.toISOString(),
      lastCompletedMileage: vehicle.type === 'vehicle' ? mileageOrHours : task.lastCompletedMileage,
      lastCompletedHours: vehicle.type === 'home' ? mileageOrHours : task.lastCompletedHours,
      nextDueDate: nextDueDate.toISOString(),
      nextDueMileage,
      nextDueHours,
      status: 'upcoming'
    };
    
    const updatedTasks = maintenanceTasks
      .filter(t => t.id !== taskId)
      .concat([updatedTask, newTask]);
    
    // Update vehicle pending tasks count and mileage/hours
    const updatedVehicles = vehicles.map(v => {
      if (v.id === task.vehicleId) {
        const pendingTasks = updatedTasks.filter(
          t => t.vehicleId === v.id && t.status !== 'completed'
        ).length;
        
        if (v.type === 'vehicle') {
          return { ...v, pendingTasks, mileage: mileageOrHours };
        } else {
          return { ...v, pendingTasks, hoursUsed: mileageOrHours };
        }
      }
      return v;
    });
    
    set({ 
      maintenanceTasks: updatedTasks,
      vehicles: updatedVehicles
    });
    
    await AsyncStorage.setItem('maintenanceTasks', JSON.stringify(updatedTasks));
    await AsyncStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
  },
  
  deleteMaintenanceTask: async (id: string) => {
    const { maintenanceTasks, vehicles } = get();
    const taskToDelete = maintenanceTasks.find(t => t.id === id);
    
    if (!taskToDelete) return;
    
    const updatedTasks = maintenanceTasks.filter(t => t.id !== id);
    
    // Update vehicle pending tasks count
    const updatedVehicles = vehicles.map(v => {
      if (v.id === taskToDelete.vehicleId) {
        const pendingTasks = updatedTasks.filter(
          t => t.vehicleId === v.id && t.status !== 'completed'
        ).length;
        return { ...v, pendingTasks };
      }
      return v;
    });
    
    set({ 
      maintenanceTasks: updatedTasks,
      vehicles: updatedVehicles
    });
    
    await AsyncStorage.setItem('maintenanceTasks', JSON.stringify(updatedTasks));
    await AsyncStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
  },
  
  addRecalls: async (recalls: Recall[]) => {
    const { recalls: existingRecalls } = get();
    const updatedRecalls = [...existingRecalls, ...recalls];
    set({ recalls: updatedRecalls });
    await AsyncStorage.setItem('recalls', JSON.stringify(updatedRecalls));
  },
  
  clearRecalls: async () => {
    set({ recalls: [] });
    await AsyncStorage.removeItem('recalls');
  },
  
  getRecallsForVehicle: (vehicleId: string) => {
    const { recalls, vehicles } = get();
    const vehicle = vehicles.find(v => v.id === vehicleId);
    
    if (!vehicle) return [];
    
    return recalls.filter(recall => 
      recall.make.toLowerCase() === vehicle.make.toLowerCase() &&
      recall.model.toLowerCase() === vehicle.model.toLowerCase() &&
      recall.year === vehicle.year
    );
  },
  
  loadData: async () => {
    set({ isLoading: true });
    try {
      const vehiclesData = await AsyncStorage.getItem('vehicles');
      const tasksData = await AsyncStorage.getItem('maintenanceTasks');
      const recallsData = await AsyncStorage.getItem('recalls');
      
      let vehicles = vehiclesData ? JSON.parse(vehiclesData) : [];
      const maintenanceTasks = tasksData ? JSON.parse(tasksData) : [];
      const recalls = recallsData ? JSON.parse(recallsData) : [];
      
      // Migrate existing vehicles to include type field
      vehicles = vehicles.map((vehicle: Vehicle) => ({
        ...vehicle,
        type: vehicle.type || 'vehicle' // Default to 'vehicle' for existing items
      }));
      
      set({ vehicles, maintenanceTasks, recalls, isLoading: false });
    } catch (error) {
      console.error('Error loading data:', error);
      set({ isLoading: false });
    }
  }
}));