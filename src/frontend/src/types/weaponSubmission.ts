import { WeaponFormData } from './weapon';

export type SubmissionType = 'CREATE' | 'UPDATE';
export type SubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface WeaponSubmission extends WeaponFormData {
  id: string;
  type: SubmissionType;
  status: SubmissionStatus;
  submittedByUsername: string;
  targetWeaponId: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WeaponSubmissionRequest extends WeaponFormData {
  targetWeaponId?: string | null;
}

export interface AdminDashboard {
  totalUsers: number;
  totalAdmins: number;
  totalWeapons: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
}
