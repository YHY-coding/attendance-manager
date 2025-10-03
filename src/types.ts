export interface Class {
  id: string;
  name: string;
  day: number; // 0: 月曜日, 1: 火曜日, ..., 5: 土曜日
  period: number; // 1-6限
  attendanceRecords: AttendanceRecord[];
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD形式
  status: 'present' | 'absent';
}

export interface TimetableCell {
  day: number;
  period: number;
  class?: Class;
}
