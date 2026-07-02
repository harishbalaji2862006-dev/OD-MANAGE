export interface UserProfile {
  id: string;
  name: string;
  email: string;
  register_number?: string;
  department?: string;
  semester?: number;
  section?: string;
  created_at?: string;
}

export interface AttendanceRecord {
  id: string;
  user_id: string;
  subject: string;
  attended_classes: number;
  total_classes: number;
  attendance_percentage: number;
  last_updated?: string;
}

export interface OdRecord {
  id: string;
  user_id: string;
  date: string;
  subject: string;
  reason: string;
  faculty: string;
  event: string;
  proof_url?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at?: string;
}

export interface SyncLog {
  id: string;
  user_id: string;
  sync_time: string;
  status: 'Success' | 'Failure';
  message: string;
  created_at?: string;
}
