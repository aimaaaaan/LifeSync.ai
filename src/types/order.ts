/**
 * Order Types - TypeScript interfaces for order management
 */

export interface OrderFormData {
  // Segment 1: Contact & Scheduling
  fullName: string;
  mobileNumber: string;
  completeAddress: string;
  preferredTestDate: string;
  preferredTestTime: string;

  // Segment 2: Test Motivation
  motivations: string[];
  otherMotivation: string;

  // Segment 3: Personal & Lifestyle Data
  age: string;
  gender: string;
  sampleType: string;
  height: string;
  weight: string;
  bloodGroup: string;
  ethnicity: string;
  smoking: string;
  alcohol: string;
  exercise: string;
  medications: string;
  takingMedications: string;
  allergies: string;
  hasAllergies: string;
  sleepQuality: string;
  dietaryPreferences: string;
  stressLevel: string;
  consent: boolean;
}

/**
 * Tracking Stage Types for DNA Testing
 */
export type TrackingStage = 
  | 'pending' 
  | 'out_for_lab' 
  | 'kit_reached_lab' 
  | 'testing_in_progress' 
  | 'processing_result' 
  | 'result_ready'
  | 'cancelled';

/**
 * Tracking Stage Details
 */
export interface TrackingStageDetail {
  stage: TrackingStage;
  label: string;
  description: string;
  completedAt?: string; // ISO string
}

/**
 * Order metadata added by the system
 */
export interface OrderMetadata {
  orderId: string;
  userId: string;
  userEmail: string;
  userName: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  trackingStage: TrackingStage;
  trackingHistory: TrackingStageDetail[];
  notes?: string;
}

/**
 * Complete Order Document (as stored in Firestore)
 */
export interface Order extends OrderFormData {
  // Metadata
  orderId: string;
  userId: string;
  userEmail: string;
  userName: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  trackingStage?: TrackingStage; // Optional for backward compatibility
  trackingHistory?: TrackingStageDetail[]; // Optional for backward compatibility
  notes?: string;
}

/**
 * Order submission response
 */
export interface OrderSubmissionResponse {
  success: boolean;
  orderId?: string;
  message: string;
  error?: string;
  timestamp: string;
}

/**
 * Order query filters
 */
export interface OrderQueryFilters {
  userId?: string;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  startDate?: Date;
  endDate?: Date;
}

/**
 * Paginated orders response
 */
export interface OrdersQueryResponse {
  orders: Order[];
  total: number;
  hasMore: boolean;
  lastKey?: string;
}
