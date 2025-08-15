import { VideoFile, AnalysisStatus, Theme } from '@/types';

// File utilities
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const validateVideoFile = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 100 * 1024 * 1024; // 100MB
  const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm'];

  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 100MB' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Only MP4, MOV, AVI, and WebM files are supported' };
  }

  return { isValid: true };
};

export const generateVideoId = (): string => {
  return `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Date utilities
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// Theme utilities
export const getThemeConfig = (theme: Theme) => {
  const themes = {
    slate: {
      primaryColor: 'hsl(215, 25%, 27%)',
      primaryForeground: 'hsl(210, 40%, 98%)',
      gradient: 'from-slate-500 to-slate-700'
    },
    light: {
      primaryColor: 'hsl(222.2, 84%, 4.9%)',
      primaryForeground: 'hsl(210, 40%, 98%)',
      gradient: 'from-gray-300 to-gray-500'
    },
    blue: {
      primaryColor: 'hsl(221.2, 83.2%, 53.3%)',
      primaryForeground: 'hsl(210, 40%, 98%)',
      gradient: 'from-blue-500 to-blue-700'
    },
    purple: {
      primaryColor: 'hsl(262.1, 83.3%, 57.8%)',
      primaryForeground: 'hsl(210, 40%, 98%)',
      gradient: 'from-purple-500 to-purple-700'
    }
  };

  return themes[theme];
};

// Local storage utilities
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    if (typeof window === 'undefined') return defaultValue || null;
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue || null;
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }
};

// Analysis utilities
export const calculateProgress = (status: AnalysisStatus): number => {
  const progressMap = {
    idle: 0,
    uploading: 10,
    processing: 30,
    analyzing: 70,
    completed: 100,
    error: 0
  };
  return progressMap[status];
};

export const getStatusColor = (status: AnalysisStatus): string => {
  const colorMap = {
    idle: 'text-muted-foreground',
    uploading: 'text-blue-600',
    processing: 'text-blue-600',
    analyzing: 'text-blue-600',
    completed: 'text-green-600',
    error: 'text-red-600'
  };
  return colorMap[status];
};

// Data processing utilities
export const processJointData = (rawData: any[]): any[] => {
  return rawData.map((point, index) => ({
    time: `${index}s`,
    knee: Math.round(point.knee || 0),
    hip: Math.round(point.hip || 0),
    ankle: Math.round(point.ankle || 0)
  }));
};

export const calculateSymmetry = (leftData: number[], rightData: number[]): number => {
  if (leftData.length !== rightData.length) return 0;
  
  const differences = leftData.map((left, i) => Math.abs(left - rightData[i]));
  const averageDifference = differences.reduce((sum, diff) => sum + diff, 0) / differences.length;
  
  return Math.max(0, 100 - averageDifference);
};

// Error handling utilities
export const createError = (code: string, message: string, details?: any) => {
  return {
    code,
    message,
    details,
    timestamp: new Date()
  };
};

export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Performance utilities
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
