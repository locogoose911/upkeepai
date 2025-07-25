export type PartTier = 'low' | 'mid' | 'high';

export interface Part {
  id: string;
  name: string;
  tier: PartTier;
  price: number;
  partNumber: string;
  source: string;
  url?: string;
}