// Core application types
export type AnalysisStatus = "idle" | "uploading" | "processing" | "analyzing" | "completed" | "error";

export type Theme = "slate" | "light" | "blue" | "purple";

// Video analysis types
export interface VideoFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadedAt: Date;
}

export interface AnalysisResult {
  id: string;
  videoId: string;
  status: AnalysisStatus;
  progress: number;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
  data?: AnalysisData;
}

export interface AnalysisData {
  jointAngles: JointAngleData[];
  symmetry: SymmetryData[];
  movementQuality: MovementQualityData;
  summary: AnalysisSummary;
}

export interface JointAngleData {
  time: string;
  knee: number;
  hip: number;
  ankle: number;
}

export interface SymmetryData {
  joint: string;
  left: number;
  right: number;
  difference: number;
}

export interface MovementQualityData {
  excellent: number;
  good: number;
  fair: number;
  poor: number;
}

export interface AnalysisSummary {
  totalFrames: number;
  processingTime: number;
  accuracy: number;
  recommendations: string[];
}

// Dashboard metrics types
export interface Metric {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

// Theme configuration types
export interface ThemeConfig {
  name: Theme;
  label: string;
  icon: React.ReactNode;
  gradient: string;
  primaryColor: string;
  primaryForeground: string;
}

// Component props types
export interface VideoUploadProps {
  onVideoSelect: (file: File) => void;
  maxFileSize?: number;
  acceptedFormats?: string[];
}

export interface AnalysisStatusProps {
  status: AnalysisStatus;
  progress?: number;
  error?: string;
}

export interface ChartsProps {
  data?: AnalysisData;
  isLoading?: boolean;
}

export interface ThemeSwitcherProps {
  onThemeChange?: (theme: Theme) => void;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UploadResponse {
  videoId: string;
  uploadUrl: string;
  expiresAt: Date;
}

export interface AnalysisResponse {
  analysisId: string;
  status: AnalysisStatus;
  estimatedCompletion?: Date;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// Configuration types
export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
  };
  upload: {
    maxFileSize: number;
    acceptedFormats: string[];
  };
  analysis: {
    maxProcessingTime: number;
    retryAttempts: number;
  };
  theme: {
    default: Theme;
    persist: boolean;
  };
}

// Hook return types
export interface UseAnalysisReturn {
  status: AnalysisStatus;
  progress: number;
  error: string | null;
  startAnalysis: (videoFile: File) => Promise<void>;
  resetAnalysis: () => void;
}

export interface UseThemeReturn {
  currentTheme: Theme;
  setTheme: (theme: Theme) => void;
  themes: ThemeConfig[];
}

// Event types
export interface AnalysisEvent {
  type: 'start' | 'progress' | 'complete' | 'error';
  data: any;
  timestamp: Date;
}

// Local storage types
export interface LocalStorageData {
  theme: Theme;
  recentVideos: VideoFile[];
  userPreferences: {
    autoPlay: boolean;
    notifications: boolean;
    dataRetention: number;
  };
}
