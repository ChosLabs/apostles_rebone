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

export type TeamType = "초신자팀" | "기신자팀" | "1팀" | "2팀" | "3팀" | "4팀" | "5팀" | "6팀" | "웰컴팀" | "임원단" | "사역자" | "부장단";
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
  userTeam?: string;
  userBirthYear?: string;
  group: string;
  content: string;
  type: 'all' | 'group';
  likes: string[]; // Array of UIDs
  createdAt: any;
}

export type TimetableType = "worship" | "group" | "meal" | "move" | "select" | "calling" | "special" | "setup" | "pray" | "etc";

export interface TimetableItem {
  id: string;
  day: number; // 1, 2, 3...
  time: string; // "09:00"
  endTime?: string; // "10:00"
  title: string;
  location?: string;
  description?: string;
  type?: TimetableType;
}

export interface Group {
  id: string; // The group number as string or doc ID
  groupNumber: number;
  leaderId?: string;
  memberIds: string[];
  nickname?: string;
  slogan?: string;
}

export interface Room {
  id: string; // Room name or doc ID
  name: string;
  memberIds: string[];
}

export interface DispatchedChurch {
  id: string;
  name: string;
  address: string;
  worshipTime: string;
  activities: string;
  assignedGroups: number[]; // Array of group numbers (조 번호)
}

export interface LuckyDraw {
  id: string;
  title: string;
  targetTeams: string[];
  targetGroups: number[];
  winnerCount: number;
  status: 'pending' | 'drawing' | 'completed';
  winners: LuckyDrawWinner[];
  createdAt: any;
}

export interface LuckyDrawWinner {
  userId: string;
  userName: string;
  userTeam: string;
  userGroup: number;
}

export interface Poll {
  id: string;
  question: string;
  description?: string;
  options: Array<{ id: string; label: string }>;
  votes: Record<string, string>; // { [userId]: optionId }
  isActive: boolean;
  createdAt: any;
}

export type LectureType = "실천형" | "나눔형" | "이론형" | "상담형";

export interface Lecture {
  id: string;
  title: string;
  lecturer: string;
  location: string; // Calling Zone (e.g. "ZONE B")
  lectureType?: LectureType;
  description: string;
  capacity: number;
  applicantIds: string[]; // participant UIDs who applied
  createdAt: any;
}

export interface GalleryLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface CallingZoneConfig {
  booths: {
    [boothId: string]: { code: string };
  };
}

export interface CallingStamp {
  userId: string;
  userName: string;
  userTeam?: string;
  stamps: string[];
  completedAt?: any;
  updatedAt: any;
}

export interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  description?: string;
  order: number;
}

export interface DailyPrayer {
  id: string; // Format: YYYY-MM-DD
  date: string; // Format: YYYY-MM-DD
  dDay: number; // Days remaining until D-Day
  title: string;
  content: string;
  updatedAt: any;
}
