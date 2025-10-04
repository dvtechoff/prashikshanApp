export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export type UserRole = 'STUDENT' | 'FACULTY' | 'INDUSTRY' | 'ADMIN';

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  college_id: string | null;
  created_at: string;
}

export interface UserUpdateRequest {
  name?: string | null;
  college_id?: string | null;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  college_id?: string | null;
}

export interface Internship {
  id: string;
  title: string;
  description?: string | null;
  skills?: string[] | null;
  stipend?: number | null;
  location?: string | null;
  remote: boolean;
  start_date?: string | null;
  duration_weeks?: number | null;
  credits?: number | null;
  status: string;
  posted_by: string;
  created_at: string;
}

export interface InternshipCreateRequest {
  title: string;
  description?: string | null;
  skills?: string[] | null;
  stipend?: number | null;
  location?: string | null;
  remote: boolean;
  start_date?: string | null;
  duration_weeks?: number | null;
  credits?: number | null;
  status?: string;
}

export interface InternshipUpdateRequest extends Partial<InternshipCreateRequest> {}

export interface InternshipFilters {
  search?: string;
  skills?: string[];
  remote?: boolean;
  minCredits?: number;
  location?: string;
}

export type ApplicationDecision = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ApplicationSummary {
  id: string;
  internship_id: string;
  student_id: string;
  applied_at: string;
  industry_status: ApplicationDecision;
  faculty_status: ApplicationDecision;
  resume_snapshot_url?: string | null;
}

export interface ApplicationDetail extends ApplicationSummary {
  internship?: Internship | null;
}

export interface ApplicationCreateRequest {
  internship_id: string;
  resume_snapshot_url?: string | null;
}

export interface ApplicationUpdateRequest {
  resume_snapshot_url?: string | null;
  industry_status?: ApplicationDecision;
  faculty_status?: ApplicationDecision;
}

export interface LogbookAttachment {
  name: string;
  url: string;
}

export interface LogbookEntry {
  id: string;
  application_id: string;
  student_id: string;
  entry_date: string;
  hours: number;
  description: string;
  attachments?: LogbookAttachment[] | null;
  faculty_comments?: string | null;
  approved: boolean;
  created_at: string;
}

export interface LogbookEntryCreateRequest {
  application_id: string;
  entry_date: string;
  hours: number;
  description: string;
  attachments?: LogbookAttachment[];
}

export interface LogbookEntryUpdateRequest {
  approved?: boolean;
  faculty_comments?: string;
  entry_date?: string;
  hours?: number;
  description?: string;
  attachments?: LogbookAttachment[];
}

export interface NotificationPayload {
  id: string;
  user_id: string;
  title: string;
  body?: string | null;
  payload?: Record<string, unknown> | null;
  read: boolean;
  created_at: string;
}

export interface AnalyticsSummary {
  internships_open: number;
  applications_submitted: number;
  logbook_entries: number;
  credits_awarded: number;
}

export interface MetricsResponse extends AnalyticsSummary {
  applications_pending_review: number;
  weekly_hours: number;
}
