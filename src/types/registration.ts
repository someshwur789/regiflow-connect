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

export const EVENTS: EventName[] = [
  'Paper Quest',
  'Hack\'n\'Hammer',
  'Byte Fest',
  'Cinephile',
  'e-sports'
];