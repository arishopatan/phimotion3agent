import { AnalysisData, ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class MotionAnalysisService {
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP error! status: ${response.status}`,
          response.status,
          errorData.code
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error occurred',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  static async analyzeMotion(videoData: any, analysisType: string = 'full'): Promise<AnalysisData> {
    const response = await this.makeRequest<ApiResponse<AnalysisData>>('/api/analysis', {
      method: 'POST',
      body: JSON.stringify({
        videoData,
        analysisType
      })
    });

    if (!response.success || !response.data) {
      throw new ApiError(
        response.error || 'Analysis failed',
        400,
        'ANALYSIS_FAILED'
      );
    }

    return response.data;
  }

  static async getAnalysisStatus(analysisId: string): Promise<{ status: string; progress: number }> {
    const response = await this.makeRequest<ApiResponse<{ status: string; progress: number }>>(
      `/api/analysis/status/${analysisId}`
    );

    if (!response.success || !response.data) {
      throw new ApiError(
        response.error || 'Failed to get analysis status',
        400,
        'STATUS_FAILED'
      );
    }

    return response.data;
  }

  static async getAnalysisHistory(): Promise<AnalysisData[]> {
    const response = await this.makeRequest<ApiResponse<AnalysisData[]>>('/api/analysis/history');
    
    if (!response.success || !response.data) {
      throw new ApiError(
        response.error || 'Failed to get analysis history',
        400,
        'HISTORY_FAILED'
      );
    }

    return response.data;
  }
}

// Export convenience functions
export const analyzeMotion = MotionAnalysisService.analyzeMotion;
export const getAnalysisStatus = MotionAnalysisService.getAnalysisStatus;
export const getAnalysisHistory = MotionAnalysisService.getAnalysisHistory;
