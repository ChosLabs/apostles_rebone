export interface User {
  uid: string;
  email: string;
  name: string;
  group?: number;
  role: 'user' | 'admin';
  createdAt: any; // ServerTimestamp
  team?: string;
  phone?: string;
  birthYear?: string;
  room?: string;
  attendanceType?: string;
}

export type TeamType = "초신자팀" | "기신자팀" | "1팀" | "2팀" | "3팀" | "4팀" | "5팀" | "6팀" | "웰컴팀" | "임원단" | "사역자";
export type AttendanceType = "A형" | "B-1형" | "B-2형" | "C형" | "D형";

export interface Participant {
  id: string; // Firestore document ID
  name: string;
  team: TeamType;
  phone: string;
  group?: number;
  isLeader: boolean;
  room?: string;
  attendanceType: AttendanceType;
  birthYear?: string; // e.g. "01"
  createdAt: any;
  updatedAt: any;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  type: '일반' | '시간' | '긴급';
  createdAt: any;
  author: string;
}

export interface PrayerRequest {
  id: string;
  userId: string;
  userName: string;
  group: string;
  content: string;
  type: 'all' | 'group';
  likes: string[]; // Array of UIDs
  createdAt: any;
}

export interface TimetableItem {
  id: string;
  day: number; // 1, 2, 3...
  time: string; // "09:00"
  title: string;
  location?: string;
  description?: string;
}

export interface Group {
  id: string; // The group number as string or doc ID
  groupNumber: number;
  leaderId?: string;
  memberIds: string[];
}

export interface Room {
  id: string; // Room name or doc ID
  name: string;
  memberIds: string[];
}
