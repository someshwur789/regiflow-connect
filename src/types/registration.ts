export interface Registration {
  id?: string;
  email: string;
  student_name: string;
  college_name: string;
  department: string;
  year: number;
  phone?: string;
  team_member1: string;
  team_member2?: string;
  team_member3?: string;
  event_name: string;
  uploaded_file_path?: string;
  created_at?: string;
}

export type EventName = 'Paper Quest' | 'Hack\'n\'Hammer' | 'Byte Fest' | 'Cinephile' | 'e-sports';

export type EventCategory = 'Technical' | 'Non-Technical';

export interface EventConfig {
  name: EventName;
  category: EventCategory;
  maxTeamMembers: number;
  requiresFile: boolean;
}

export const EVENT_CONFIGS: EventConfig[] = [
  {
    name: 'Paper Quest',
    category: 'Technical',
    maxTeamMembers: 3,
    requiresFile: true
  },
  {
    name: 'Hack\'n\'Hammer',
    category: 'Technical',
    maxTeamMembers: 3,
    requiresFile: false
  },
  {
    name: 'Byte Fest',
    category: 'Technical',
    maxTeamMembers: 2,
    requiresFile: false
  },
  {
    name: 'Cinephile',
    category: 'Non-Technical',
    maxTeamMembers: 2,
    requiresFile: false
  },
  {
    name: 'e-sports',
    category: 'Non-Technical',
    maxTeamMembers: 2,
    requiresFile: false
  }
];

export const EVENTS: EventName[] = EVENT_CONFIGS.map(config => config.name);

export const getEventConfig = (eventName: EventName): EventConfig => {
  return EVENT_CONFIGS.find(config => config.name === eventName)!;
};

export const getTechnicalEvents = (): EventName[] => {
  return EVENT_CONFIGS.filter(config => config.category === 'Technical').map(config => config.name);
};

export const getNonTechnicalEvents = (): EventName[] => {
  return EVENT_CONFIGS.filter(config => config.category === 'Non-Technical').map(config => config.name);
};