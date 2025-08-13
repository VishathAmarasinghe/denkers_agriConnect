// Shared types & constants for Field Visit feature
export type CategoryKey = 'General Support' | 'Pest Control' | 'Fertilizer Guidance';

export interface Expert {
  id: string;
  name: string;
  role: string;
  category: CategoryKey;
  photo?: any; // local image require
  avatarUrl?: string; // remote image URL
  phone: string;
  officeLocation: string;
  rating: number; // 0-5
  description: string;
  hours: string;
}

export const CATEGORIES: CategoryKey[] = ['General Support', 'Pest Control', 'Fertilizer Guidance'];

export const ISSUE_OPTIONS = [
  'Pest or Disease Issues',
  'Growth / Development Problems',
  'Water Management Issues',
  'Soil Nutrition Concerns',
  'Crop Management',
  'Other',
];

export const URGENCY_OPTIONS = [
  { value: 'emergency', label: 'Emergency (1-2 days)' },
  { value: 'standard', label: 'Standard (Within a week)' },
  { value: 'planning', label: 'Planning (Future guidance)' },
];

// Design tokens
export const COLORS = {
  GREEN: '#52B788',
  GREEN_LIGHT: '#E2F7EF',
  GREEN_LIGHTER: '#CFF0E5',
  TEXT_DARK: '#222',
  TEXT_BODY: '#444',
};
