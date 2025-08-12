import { ImageSourcePropType } from 'react-native';

export interface OnboardingType {
  description: string;
  image: ImageSourcePropType;
  id: string;
}

export enum State {
  failed = 'failed',
  success = 'success',
  loading = 'loading',
  idle = 'idle',
}

export interface UIShowingFile {
  name: string;
  docID: string;
  status: 'New' | 'Old';
  urlLink: string | null;
}

export interface FileTypeUser {
  name: string;
  uri: string;
  type: string;
  size: number;
}

export interface SettingsCardProps {
  title: SettingsCardTitle;
  icon: React.ElementType | React.ReactNode;
  subText: string;
}

export type SettingsCardTitle =
  | 'Languages'
  | 'Client Type'
  | 'Client Status'
  | 'Client Fundings'
  | 'Care Plan Status'
  | 'Appointment Types'
  | 'Incident Types'
  | 'Incident Status'
  | 'Incident Questions'
  | 'Care Giver File Uploads'
  | 'Care Giver Salary';
