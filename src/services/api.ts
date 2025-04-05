import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, User, Patient, Prescription, LabReport, Medicine, UserRole } from '../types';

// Create axios instance with base URL and default headers
const api: AxiosInstance = axios.create({
  baseURL: (window as any).__env__?.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    // Handle unauthorized errors (token expired)
    if (response && response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (username: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> => {
    try {
      const response: AxiosResponse = await api.post('/auth/login', { username, password });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to login',
      };
    }
  },
  
  logout: async (): Promise<ApiResponse<null>> => {
    try {
      const response: AxiosResponse = await api.post('/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to logout',
      };
    }
  },
  
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    try {
      const response: AxiosResponse = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get current user',
      };
    }
  },
};

// Patient API
export const patientApi = {
  getPatients: async (page = 1, limit = 10, search = ''): Promise<ApiResponse<Patient[]>> => {
    try {
      const response: AxiosResponse = await api.get('/patients', {
        params: { page, limit, search },
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get patients',
      };
    }
  },
  
  getPatientById: async (id: string): Promise<ApiResponse<Patient>> => {
    try {
      const response: AxiosResponse = await api.get(`/patients/${id}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get patient',
      };
    }
  },
  
  createPatient: async (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Patient>> => {
    try {
      const response: AxiosResponse = await api.post('/patients', patientData);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create patient',
      };
    }
  },
  
  getPatientMedicalHistory: async (id: string): Promise<ApiResponse<Prescription[]>> => {
    try {
      const response: AxiosResponse = await api.get(`/patients/${id}/history`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get patient history',
      };
    }
  },
};

// Prescription API
export const prescriptionApi = {
  getPrescriptions: async (page = 1, limit = 10): Promise<ApiResponse<Prescription[]>> => {
    try {
      const response: AxiosResponse = await api.get('/prescriptions', {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get prescriptions',
      };
    }
  },
  
  getPrescriptionById: async (id: string): Promise<ApiResponse<Prescription>> => {
    try {
      const response: AxiosResponse = await api.get(`/prescriptions/${id}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get prescription',
      };
    }
  },
  
  createPrescription: async (prescriptionData: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Prescription>> => {
    try {
      const response: AxiosResponse = await api.post('/prescriptions', prescriptionData);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create prescription',
      };
    }
  },
  
  updatePrescriptionStatus: async (id: string, status: string): Promise<ApiResponse<Prescription>> => {
    try {
      const response: AxiosResponse = await api.patch(`/prescriptions/${id}/status`, { status });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update prescription status',
      };
    }
  },
};

// Lab Report API
export const labReportApi = {
  uploadLabReport: async (prescriptionId: string, reportId: string, file: File, notes: string): Promise<ApiResponse<LabReport>> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('notes', notes);
      
      const response: AxiosResponse = await api.post(
        `/prescriptions/${prescriptionId}/lab-reports/${reportId}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload lab report',
      };
    }
  },
  
  updateLabReportStatus: async (prescriptionId: string, reportId: string, status: string): Promise<ApiResponse<LabReport>> => {
    try {
      const response: AxiosResponse = await api.patch(
        `/prescriptions/${prescriptionId}/lab-reports/${reportId}/status`,
        { status }
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update lab report status',
      };
    }
  },
};

// Pharmacy API
export const pharmacyApi = {
  updateMedicineStatus: async (prescriptionId: string, medicineId: string, status: string): Promise<ApiResponse<Medicine>> => {
    try {
      const response: AxiosResponse = await api.patch(
        `/prescriptions/${prescriptionId}/medicines/${medicineId}/status`,
        { status }
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update medicine status',
      };
    }
  },
};

// Admin API
export const adminApi = {
  getUsers: async (page = 1, limit = 10): Promise<ApiResponse<User[]>> => {
    try {
      const response: AxiosResponse = await api.get('/admin/users', {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get users',
      };
    }
  },
  
  createUser: async (userData: { 
    username: string; 
    password: string; 
    name: string; 
    email: string; 
    role: UserRole; 
  }): Promise<ApiResponse<User>> => {
    try {
      const response: AxiosResponse = await api.post('/admin/users', userData);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create user',
      };
    }
  },
  
  updateUser: async (id: string, userData: Partial<User>): Promise<ApiResponse<User>> => {
    try {
      const response: AxiosResponse = await api.put(`/admin/users/${id}`, userData);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user',
      };
    }
  },
  
  deleteUser: async (id: string): Promise<ApiResponse<null>> => {
    try {
      const response: AxiosResponse = await api.delete(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete user',
      };
    }
  },
};

export default api; 