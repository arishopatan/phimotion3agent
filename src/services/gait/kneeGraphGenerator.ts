/**
 * Professional Knee Graph Generator
 * Creates knee angle visualizations with support for multiple gait modes
 */

import { GaitMode, getGaitModeConfig, getJointConfig } from '@/config/gaitModePresets';

export interface KneeDataPoint {
  gaitCyclePercent: number;
  phase: string;
  kneeLeft: number;
  kneeRight: number;
  time: number;
}

export interface KneeGraphData {
  dataPoints: KneeDataPoint[];
  config: {
    mode: GaitMode;
    yAxisRange: { min: number; max: number; center: number };
    phaseBoundaries: Record<string, number>;
  };
  statistics: {
    leftROM: number;
    rightROM: number;
    asymmetry: number;
    averageROM: number;
  };
}

export interface KneeAnalysisResult {
  graphData: KneeGraphData;
  romAnalysis: {
    left: {
      maxFlexion: number;
      maxExtension: number;
      totalROM: number;
      anatomicalZero: number;
    };
    right: {
      maxFlexion: number;
      maxExtension: number;
      totalROM: number;
      anatomicalZero: number;
    };
    asymmetry: number;
    averageROM: number;
  };
  qualityMetrics: {
    confidence: number;
    dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
    recommendations: string[];
  };
}

export class KneeGraphGenerator {
  private mode: GaitMode;
  private config: ReturnType<typeof getGaitModeConfig>;

  constructor(mode: GaitMode = 'walk') {
    this.mode = mode;
    this.config = getGaitModeConfig(mode);
  }

  /**
   * Generate realistic knee angle data for the specified gait mode
   */
  generateKneeData(durationSeconds: number = 10): KneeDataPoint[] {
    const frameRate = this.config.analysisSettings.frameRate;
    const cycleDuration = this.config.analysisSettings.cycleDuration;
    const frames = Math.floor(durationSeconds * frameRate);
    const dataPoints: KneeDataPoint[] = [];

    for (let i = 0; i < frames; i++) {
      const time = i / frameRate;
      
      // Calculate cycle positions for each leg (offset by half cycle)
      const leftCyclePosition = (time % cycleDuration) / cycleDuration;
      const rightCyclePosition = ((time + cycleDuration / 2) % cycleDuration) / cycleDuration;
      
      // Generate realistic knee angles based on gait mode
      const leftKnee = this.generateKneeAngle(leftCyclePosition);
      const rightKnee = this.generateKneeAngle(rightCyclePosition);
      
      // Determine gait phase
      const phase = this.getPhaseAtPosition(leftCyclePosition);
      
      dataPoints.push({
        gaitCyclePercent: leftCyclePosition * 100,
        phase,
        kneeLeft: leftKnee,
        kneeRight: rightKnee,
        time
      });
    }

    return dataPoints;
  }

  /**
   * Generate realistic knee angle for a given cycle position (0-1)
   */
  private generateKneeAngle(cyclePosition: number): number {
    const { min, max } = this.config.jointRanges.knee;
    let angle = 0;
    
    // Knee flexion pattern varies by gait mode
    switch (this.mode) {
      case 'walk':
        angle = this.generateWalkingKneeAngle(cyclePosition);
        break;
      case 'run':
        angle = this.generateRunningKneeAngle(cyclePosition);
        break;
      case 'sprint':
        angle = this.generateSprintingKneeAngle(cyclePosition);
        break;
      default:
        angle = this.generateWalkingKneeAngle(cyclePosition);
    }
    
    // Add realistic noise
    const noise = (Math.random() - 0.5) * 2;
    const finalAngle = angle + noise;
    
    // Ensure within range
    return Math.max(min, Math.min(max, Math.round(finalAngle * 10) / 10));
  }

  /**
   * Generate walking knee angle pattern
   */
  private generateWalkingKneeAngle(cyclePosition: number): number {
    let angle = 0;
    
    if (cyclePosition < 0.1) {
      // Loading response flexion
      angle = 15 * Math.sin(cyclePosition * 10 * Math.PI);
    } else if (cyclePosition < 0.6) {
      // Stance phase extension
      angle = 5 * Math.cos((cyclePosition - 0.1) * 2 * Math.PI);
    } else {
      // Swing phase flexion
      angle = 35 * Math.sin((cyclePosition - 0.6) * 2.5 * Math.PI);
    }
    
    return Math.max(0, angle);
  }

  /**
   * Generate running knee angle pattern (future implementation)
   */
  private generateRunningKneeAngle(cyclePosition: number): number {
    // Similar to walking but with greater range
    let angle = 0;
    
    if (cyclePosition < 0.08) {
      angle = 25 * Math.sin(cyclePosition * 12.5 * Math.PI);
    } else if (cyclePosition < 0.55) {
      angle = 8 * Math.cos((cyclePosition - 0.08) * 2.1 * Math.PI);
    } else {
      angle = 45 * Math.sin((cyclePosition - 0.55) * 2.2 * Math.PI);
    }
    
    return Math.max(-5, angle);
  }

  /**
   * Generate sprinting knee angle pattern (future implementation)
   */
  private generateSprintingKneeAngle(cyclePosition: number): number {
    // Even greater range for sprinting
    let angle = 0;
    
    if (cyclePosition < 0.06) {
      angle = 35 * Math.sin(cyclePosition * 16.7 * Math.PI);
    } else if (cyclePosition < 0.50) {
      angle = 12 * Math.cos((cyclePosition - 0.06) * 2.3 * Math.PI);
    } else {
      angle = 55 * Math.sin((cyclePosition - 0.50) * 2.0 * Math.PI);
    }
    
    return Math.max(-10, angle);
  }

  /**
   * Get gait phase at a given cycle position
   */
  private getPhaseAtPosition(cyclePosition: number): string {
    const percent = cyclePosition * 100;
    const boundaries = this.config.phaseBoundaries;
    
    if (percent < boundaries.LR) return 'IC';
    if (percent < boundaries.MSt) return 'LR';
    if (percent < boundaries.TSt) return 'MSt';
    if (percent < boundaries.PSw) return 'TSt';
    if (percent < boundaries.ISw) return 'PSw';
    if (percent < boundaries.MSw) return 'ISw';
    if (percent < boundaries.TSw) return 'MSw';
    return 'TSw';
  }

  /**
   * Analyze knee data and generate comprehensive results
   */
  analyzeKneeData(dataPoints: KneeDataPoint[]): KneeAnalysisResult {
    // Extract left and right knee angles
    const leftAngles = dataPoints.map(p => p.kneeLeft);
    const rightAngles = dataPoints.map(p => p.kneeRight);
    
    // Calculate ROM analysis
    const romAnalysis = this.calculateROMAnalysis(leftAngles, rightAngles);
    
    // Calculate quality metrics
    const qualityMetrics = this.calculateQualityMetrics(romAnalysis);
    
    // Prepare graph data
    const graphData: KneeGraphData = {
      dataPoints,
      config: {
        mode: this.mode,
        yAxisRange: this.config.jointRanges.knee,
        phaseBoundaries: this.config.phaseBoundaries
      },
      statistics: {
        leftROM: romAnalysis.left.totalROM,
        rightROM: romAnalysis.right.totalROM,
        asymmetry: romAnalysis.asymmetry,
        averageROM: romAnalysis.averageROM
      }
    };

    return {
      graphData,
      romAnalysis,
      qualityMetrics
    };
  }

  /**
   * Calculate ROM analysis for knee angles
   */
  private calculateROMAnalysis(leftAngles: number[], rightAngles: number[]) {
    // Calculate anatomical zero (mean of first 15 frames)
    const leftAnatomicalZero = this.calculateAnatomicalZero(leftAngles);
    const rightAnatomicalZero = this.calculateAnatomicalZero(rightAngles);
    
    // Find peaks for ROM calculation
    const leftPeaks = this.findPeaks(leftAngles, leftAnatomicalZero);
    const rightPeaks = this.findPeaks(rightAngles, rightAnatomicalZero);
    
    // Calculate ROM
    const leftROM = this.calculateROM(leftPeaks, leftAnatomicalZero);
    const rightROM = this.calculateROM(rightPeaks, rightAnatomicalZero);
    
    const asymmetry = Math.abs(leftROM.totalROM - rightROM.totalROM);
    const averageROM = (leftROM.totalROM + rightROM.totalROM) / 2;
    
    return {
      left: { ...leftROM, anatomicalZero: leftAnatomicalZero },
      right: { ...rightROM, anatomicalZero: rightAnatomicalZero },
      asymmetry: Math.round(asymmetry * 10) / 10,
      averageROM: Math.round(averageROM * 10) / 10
    };
  }

  /**
   * Calculate anatomical zero
   */
  private calculateAnatomicalZero(angles: number[]): number {
    const initialFrames = angles.slice(0, Math.min(15, angles.length));
    if (initialFrames.length === 0) return 0;
    
    const sum = initialFrames.reduce((acc, angle) => acc + angle, 0);
    return Math.round((sum / initialFrames.length) * 10) / 10;
  }

  /**
   * Find peaks in angle data
   */
  private findPeaks(angles: number[], anatomicalZero: number): Array<{ value: number; type: 'flexion' | 'extension' }> {
    const peaks: Array<{ value: number; type: 'flexion' | 'extension' }> = [];
    const windowSize = 3;
    
    for (let i = windowSize; i < angles.length - windowSize; i++) {
      const current = angles[i];
      const isFlexionPeak = current > anatomicalZero && 
        angles.slice(i - windowSize, i).every(val => val <= current) &&
        angles.slice(i + 1, i + windowSize + 1).every(val => val <= current);
      
      const isExtensionPeak = current < anatomicalZero &&
        angles.slice(i - windowSize, i).every(val => val >= current) &&
        angles.slice(i + 1, i + windowSize + 1).every(val => val >= current);
      
      if (isFlexionPeak) {
        peaks.push({ value: current, type: 'flexion' });
      } else if (isExtensionPeak) {
        peaks.push({ value: current, type: 'extension' });
      }
    }
    
    return peaks;
  }

  /**
   * Calculate ROM from peaks
   */
  private calculateROM(peaks: Array<{ value: number; type: 'flexion' | 'extension' }>, anatomicalZero: number) {
    const flexionPeaks = peaks.filter(p => p.type === 'flexion');
    const extensionPeaks = peaks.filter(p => p.type === 'extension');
    
    if (flexionPeaks.length > 0 && extensionPeaks.length > 0) {
      const maxFlexion = Math.max(...flexionPeaks.map(p => p.value));
      const maxExtension = Math.min(...extensionPeaks.map(p => p.value));
      
      return {
        maxFlexion: Math.round(maxFlexion * 10) / 10,
        maxExtension: Math.round(maxExtension * 10) / 10,
        totalROM: Math.round((maxFlexion - maxExtension) * 10) / 10
      };
    }
    
    // Fallback to percentile method
    const sorted = [...peaks.map(p => p.value)].sort((a, b) => a - b);
    const percentile95 = sorted[Math.floor(sorted.length * 0.95)] || anatomicalZero;
    const percentile5 = sorted[Math.floor(sorted.length * 0.05)] || anatomicalZero;
    
    return {
      maxFlexion: Math.round(percentile95 * 10) / 10,
      maxExtension: Math.round(percentile5 * 10) / 10,
      totalROM: Math.round((percentile95 - percentile5) * 10) / 10
    };
  }

  /**
   * Calculate quality metrics
   */
  private calculateQualityMetrics(romAnalysis: any) {
    const thresholds = this.config.qualityThresholds;
    const asymmetry = romAnalysis.asymmetry;
    
    // Calculate confidence based on data consistency
    const confidence = 0.85; // Simplified for now
    
    let dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
    if (confidence > thresholds.excellent.confidence && asymmetry < thresholds.excellent.asymmetry) {
      dataQuality = 'excellent';
    } else if (confidence > thresholds.good.confidence && asymmetry < thresholds.good.asymmetry) {
      dataQuality = 'good';
    } else if (confidence > thresholds.fair.confidence && asymmetry < thresholds.fair.asymmetry) {
      dataQuality = 'fair';
    } else {
      dataQuality = 'poor';
    }
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (romAnalysis.averageROM < 30) {
      recommendations.push("Knee ROM is below normal range. Consider mobility exercises.");
    }
    
    if (asymmetry > 10) {
      recommendations.push("Significant knee asymmetry detected. Focus on bilateral training.");
    }
    
    if (dataQuality === 'poor') {
      recommendations.push("Data quality is poor. Consider re-recording with better conditions.");
    }
    
    return {
      confidence: Math.round(confidence * 100) / 100,
      dataQuality,
      recommendations
    };
  }

  /**
   * Generate CSV data for export
   */
  generateCSVData(dataPoints: KneeDataPoint[]): string {
    const headers = [
      'GaitCyclePercent',
      'Phase',
      'Time(s)',
      'KneeLeft(deg)',
      'KneeRight(deg)',
      'GaitMode'
    ];
    
    const rows = dataPoints.map(point => [
      Math.round(point.gaitCyclePercent * 10) / 10,
      point.phase,
      Math.round(point.time * 100) / 100,
      point.kneeLeft,
      point.kneeRight,
      this.mode
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    return csvContent;
  }
}
