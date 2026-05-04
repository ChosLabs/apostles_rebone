export interface User {
  uid: string;
  email: string;
  name: string;
  group: string;
  role: 'user' | 'admin';
  createdAt: any; // ServerTimestamp
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
}
