// Auth Types
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

// Profile Data Types
export interface StudentProfileData {
  phone?: string;
  university?: string;
  college?: string;
  enrollment_no?: string;
  course?: string;
  year?: string;
  skills?: string[];
}

export interface FacultyProfileData {
  phone: string;
  university?: string;
  college?: string;
  designation?: string;
  department?: string;
  faculty_id?: string;
}

export interface IndustryProfileData {
  company_name: string;
  company_website?: string;
  contact_person_name: string;
  contact_number: string;
  designation?: string;
  company_address?: string;
}

// Profile Response Types
export interface ProfileResponse {
  user_id: string;
  college?: string | null;
  enrollment_no?: string | null;
  course?: string | null;
  year?: string | null;
  designation?: string | null;
  department?: string | null;
  faculty_id?: string | null;
  skills?: { skills?: string[] } | null;
  resume_url?: string | null;
  verified: boolean;
}

export interface IndustryProfileResponse {
  user_id: string;
  company_name: string;
  company_website?: string | null;
  contact_person_name: string;
  contact_number: string;
  designation?: string | null;
  company_address?: string | null;
  verified: boolean;
}

// Profile Update Types
export interface ProfileUpdateRequest {
  college?: string | null;
  enrollment_no?: string | null;
  course?: string | null;
  year?: string | null;
  designation?: string | null;
  department?: string | null;
  faculty_id?: string | null;
  skills?: string[] | null;
  resume_url?: string | null;
}

export interface IndustryProfileUpdateRequest {
  company_name?: string | null;
  company_website?: string | null;
  contact_person_name?: string | null;
  contact_number?: string | null;
  designation?: string | null;
  company_address?: string | null;
}

// User Types
export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  university?: string | null;
  college_id: string | null;
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
  profile?: ProfileResponse | null;
  industry_profile?: IndustryProfileResponse | null;
}

export interface UserUpdateRequest {
  name?: string | null;
  phone?: string | null;
  university?: string | null;
  college_id?: string | null;
  profile?: ProfileUpdateRequest | null;
  industry_profile?: IndustryProfileUpdateRequest | null;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  college_id?: string | null;
  phone?: string;
  university?: string;
  student_profile?: StudentProfileData;
  faculty_profile?: FacultyProfileData;
  industry_profile?: IndustryProfileData;
}

// Internship Types
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

// Application Types
export type ApplicationDecision = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ApplicationSummary {
  id: string;
  internship_id: string;
  student_id: string;
  applied_at: string;
  industry_status: ApplicationDecision;
  faculty_status: ApplicationDecision;
  resume_snapshot_url?: string | null;
  // Nested relations
  student?: {
    id: string;
    name: string;
    email: string;
  } | null;
  internship?: {
    id: string;
    title: string;
    description?: string | null;
    location?: string | null;
    remote?: boolean;
    stipend?: number | null;
    duration_weeks?: number | null;
    credits?: number | null;
    start_date?: string | null;
    status?: string;
  } | null;
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

// Logbook Types
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

// Notification Types
export interface NotificationPayload {
  id: string;
  user_id: string;
  title: string;
  body?: string | null;
  payload?: Record<string, unknown> | null;
  read: boolean;
  created_at: string;
}

export interface NotificationCreateRequest {
  user_id: string;
  title: string;
  body?: string;
  payload?: Record<string, unknown>;
}

export interface NotificationBulkCreateRequest {
  title: string;
  body?: string;
  payload?: Record<string, unknown>;
  target_role?: 'STUDENT' | 'FACULTY' | 'INDUSTRY';
  user_ids?: string[];
}

// Analytics Types
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
