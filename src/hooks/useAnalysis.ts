"use client";

import { useState, useCallback, useEffect } from 'react';
import { AnalysisStatus, VideoFile, AnalysisResult } from '@/types';
import { storage, createError } from '@/utils';

interface UseAnalysisReturn {
  status: AnalysisStatus;
  progress: number;
  error: string | null;
  currentVideo: VideoFile | null;
  analysisHistory: AnalysisResult[];
  startAnalysis: (videoFile: File) => Promise<void>;
  resetAnalysis: () => void;
  retryAnalysis: () => Promise<void>;
}

export const useAnalysis = (): UseAnalysisReturn => {
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentVideo, setCurrentVideo] = useState<VideoFile | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);

  // Load analysis history from localStorage on mount
  useEffect(() => {
    const savedHistory = storage.get<AnalysisResult[]>('analysisHistory', []);
    setAnalysisHistory(savedHistory || []);
  }, []);

  // Save analysis history to localStorage when it changes
  useEffect(() => {
    storage.set('analysisHistory', analysisHistory);
  }, [analysisHistory]);

  const startAnalysis = useCallback(async (videoFile: File) => {
    try {
      setError(null);
      setStatus('uploading');
      setProgress(10);

      // Create video object
      const video: VideoFile = {
        id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: videoFile.name,
        size: videoFile.size,
        type: videoFile.type,
        uploadedAt: new Date()
      };

      setCurrentVideo(video);

      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStatus('processing');
      setProgress(30);

      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStatus('analyzing');
      setProgress(70);

      // Simulate analysis
      await new Promise(resolve => setTimeout(resolve, 5000));
      setStatus('completed');
      setProgress(100);

      // Create analysis result
      const result: AnalysisResult = {
        id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        videoId: video.id,
        status: 'completed',
        progress: 100,
        createdAt: new Date(),
        completedAt: new Date(),
        data: {
          jointAngles: [
            { time: "0s", knee: 45, hip: 30, ankle: 15 },
            { time: "1s", knee: 60, hip: 45, ankle: 25 },
            { time: "2s", knee: 75, hip: 60, ankle: 35 },
            { time: "3s", knee: 90, hip: 75, ankle: 45 },
            { time: "4s", knee: 85, hip: 70, ankle: 40 },
            { time: "5s", knee: 70, hip: 55, ankle: 30 },
            { time: "6s", knee: 55, hip: 40, ankle: 20 },
            { time: "7s", knee: 40, hip: 25, ankle: 10 }
          ],
          symmetry: [
            { joint: "Knee", left: 85, right: 82, difference: 3 },
            { joint: "Hip", left: 78, right: 75, difference: 3 },
            { joint: "Ankle", left: 92, right: 89, difference: 3 },
            { joint: "Shoulder", left: 88, right: 85, difference: 3 }
          ],
          movementQuality: {
            excellent: 35,
            good: 45,
            fair: 15,
            poor: 5
          },
          summary: {
            totalFrames: 240,
            processingTime: 8.2,
            accuracy: 94.2,
            recommendations: [
              "Focus on knee alignment during squat movements",
              "Improve hip mobility for better range of motion",
              "Maintain consistent ankle stability throughout movement"
            ]
          }
        }
      };

      // Add to history
      setAnalysisHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 analyses

    } catch (err) {
      const error = createError('ANALYSIS_FAILED', 'Analysis failed to complete', err);
      setError(error.message);
      setStatus('error');
      setProgress(0);
    }
  }, []);

  const resetAnalysis = useCallback(() => {
    setStatus('idle');
    setProgress(0);
    setError(null);
    setCurrentVideo(null);
  }, []);

  const retryAnalysis = useCallback(async () => {
    if (currentVideo) {
      // Create a mock file from the current video
      const mockFile = new File([''], currentVideo.name, { type: currentVideo.type });
      await startAnalysis(mockFile);
    }
  }, [currentVideo, startAnalysis]);

  return {
    status,
    progress,
    error,
    currentVideo,
    analysisHistory,
    startAnalysis,
    resetAnalysis,
    retryAnalysis
  };
};
