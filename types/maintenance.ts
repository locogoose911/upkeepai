import { Part } from './parts';

export type MaintenanceStatus = 'upcoming' | 'overdue' | 'completed' | 'scheduled';

export interface MaintenanceTask {
  id: string;
  vehicleId: string;
  vehicleName: string;
  title: string;
  description: string;
  intervalMiles?: number;
  intervalMonths?: number;
  intervalHours?: number;
  lastCompletedDate?: string;
  lastCompletedMileage?: number;
  lastCompletedHours?: number;
  nextDueDate: string;
  nextDueMileage?: number;
  nextDueHours?: number;
  status: MaintenanceStatus;
  parts?: Part[];
}