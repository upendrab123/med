// User and Auth Types
export enum UserRole {
  DOCTOR = 'DOCTOR',
  LAB_STAFF = 'LAB_STAFF',
  PHARMACY_STAFF = 'PHARMACY_STAFF',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  email: string;
  password?: string;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Patient Types
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: Gender;
  createdAt: string;
  updatedAt: string;
}

// Medical Records Types
export enum PrescriptionStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export enum LabReportStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED'
}

export enum MedicineStatus {
  PENDING = 'PENDING',
  DISPENSED = 'DISPENSED'
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  status: MedicineStatus;
  notes?: string;
}

export interface LabReport {
  id: string;
  name: string;
  status: LabReportStatus;
  notes?: string;
  reportUrl?: string;
  uploadedBy?: string;
  uploadedAt?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  symptoms: string[];
  medicines: Medicine[];
  labReports: LabReport[];
  status: PrescriptionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalHistory {
  patient: Patient;
  prescriptions: Prescription[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 