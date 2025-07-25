export type ItemType = 'vehicle' | 'home';

export interface Vehicle {
  id: string;
  type: ItemType;
  make: string;
  model: string;
  year: number;
  mileage?: number; // Optional for home items
  hoursUsed?: number; // For home items that track hours instead of mileage
  image?: string;
  pendingTasks?: number;
  lastUpdated?: string;
  category?: string; // For home items: 'hvac', 'lawn', 'appliance', etc.
}