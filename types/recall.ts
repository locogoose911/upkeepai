export type RecallSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Recall {
  id: string;
  nhtsa_id?: string;
  make: string;
  model: string;
  year: number;
  title: string;
  description: string;
  severity: RecallSeverity;
  date_issued: string;
  affected_components: string[];
  remedy_description?: string;
  manufacturer_contact?: string;
  nhtsa_url?: string;
  affected_vehicles_count?: number;
}

export interface RecallSearchParams {
  make: string;
  model: string;
  year: number;
}

export interface RecallSearchResult {
  recalls: Recall[];
  total_count: number;
  search_params: RecallSearchParams;
}