// Application configuration
export const APP_CONFIG = {
  name: 'PhiMotion3Agent',
  version: '1.0.0',
  description: 'Professional Motion Analysis Dashboard',
  author: 'PhiMotion3Agent Team',
  website: 'https://phimotion3agent.com',
  support: 'support@phimotion3agent.com'
} as const;

// API configuration
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.phimotion3agent.com',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  endpoints: {
    upload: '/upload',
    analysis: '/analysis',
    results: '/results',
    health: '/health'
  }
} as const;

// File upload configuration
export const UPLOAD_CONFIG = {
  maxFileSize: 100 * 1024 * 1024, // 100MB
  acceptedFormats: ['video/mp4', 'video/mov', 'video/avi', 'video/webm'],
  maxFiles: 1,
  chunkSize: 1024 * 1024, // 1MB chunks
  retryAttempts: 3
} as const;

// Analysis configuration
export const ANALYSIS_CONFIG = {
  maxProcessingTime: 300, // 5 minutes
  supportedResolutions: ['720p', '1080p', '4K'],
  frameRate: 30,
  quality: 'high',
  algorithms: ['pose-estimation', 'joint-tracking', 'symmetry-analysis']
} as const;

// Theme configuration
export const THEME_CONFIG = {
  default: 'slate' as const,
  persist: true,
  autoDetect: true,
  transitionDuration: 300
} as const;

// Dashboard metrics
export const DASHBOARD_METRICS = {
  refreshInterval: 30000, // 30 seconds
  maxHistoryItems: 50,
  chartUpdateInterval: 1000, // 1 second
  realTimeUpdate: true
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  theme: 'phimotion3agent_theme',
  analysisHistory: 'phimotion3agent_analysis_history',
  userPreferences: 'phimotion3agent_user_preferences',
  recentVideos: 'phimotion3agent_recent_videos',
  authToken: 'phimotion3agent_auth_token'
} as const;

// Error codes
export const ERROR_CODES = {
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  ANALYSIS_FAILED: 'ANALYSIS_FAILED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  UNSUPPORTED_FORMAT: 'UNSUPPORTED_FORMAT'
} as const;

// Status messages
export const STATUS_MESSAGES = {
  idle: 'Ready for Analysis',
  uploading: 'Uploading Video',
  processing: 'Processing Video',
  analyzing: 'Analyzing Motion',
  completed: 'Analysis Complete',
  error: 'Analysis Failed'
} as const;

// Chart colors
export const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  accent: '#f59e0b',
  danger: '#ef4444',
  success: '#22c55e',
  warning: '#f97316',
  info: '#06b6d4',
  muted: '#6b7280'
} as const;

// Animation durations
export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 1000
} as const;

// Breakpoints
export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;

// Z-index layers
export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070
} as const;

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  maxBundleSize: 500 * 1024, // 500KB
  maxLoadTime: 3000, // 3 seconds
  maxRenderTime: 16, // 16ms for 60fps
  maxMemoryUsage: 50 * 1024 * 1024 // 50MB
} as const;

// Feature flags
export const FEATURE_FLAGS = {
  realTimeAnalysis: true,
  advancedCharts: true,
  themeCustomization: true,
  dataExport: false,
  collaboration: false,
  aiRecommendations: true
} as const;

// Validation rules
export const VALIDATION_RULES = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/.+/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
} as const;

// Default values
export const DEFAULT_VALUES = {
  pageSize: 10,
  debounceDelay: 300,
  throttleDelay: 100,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  sessionTimeout: 30 * 60 * 1000 // 30 minutes
} as const;
