/**
 * Professional Knee Graph Generator
 * Creates knee angle visualizations with support for multiple gait modes
 */

import { GaitMode, getGaitModeConfig } from '@/config/gaitModePresets';

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
   * Creates clean, single gait cycle with proper asymmetry
   */
  generateKneeData(durationSeconds: number = 10): KneeDataPoint[] {
    const frameRate = this.config.analysisSettings.frameRate;
    const cycleDuration = this.config.analysisSettings.cycleDuration;
    const frames = Math.floor(durationSeconds * frameRate);
    const dataPoints: KneeDataPoint[] = [];

    // Generate individual asymmetry factors for realistic differences
    const leftAsymmetryFactor = 0.95 + (Math.random() * 0.1); // 0.95-1.05
    const rightAsymmetryFactor = 0.95 + (Math.random() * 0.1); // 0.95-1.05

    for (let i = 0; i < frames; i++) {
      const time = i / frameRate;
      
      // Calculate cycle positions for each leg (offset by half cycle)
      const leftCyclePosition = (time % cycleDuration) / cycleDuration;
      const rightCyclePosition = ((time + cycleDuration / 2) % cycleDuration) / cycleDuration;
      
      // Generate realistic knee angles with asymmetry
      const baseLeftKnee = this.generateKneeAngle(leftCyclePosition);
      const baseRightKnee = this.generateKneeAngle(rightCyclePosition);
      
      // Apply asymmetry and smoothing
      const leftKnee = this.applySmoothingAndAsymmetry(baseLeftKnee, leftAsymmetryFactor, i, frames);
      const rightKnee = this.applySmoothingAndAsymmetry(baseRightKnee, rightAsymmetryFactor, i, frames);
      
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

    return this.generateAveragedSingleCycle(dataPoints);
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
   * Generate walking knee angle pattern - realistic and smooth
   */
  private generateWalkingKneeAngle(cyclePosition: number): number {
    let angle = 0;
    
    // Professional walking knee pattern based on biomechanics research
    if (cyclePosition < 0.12) {
      // Initial Contact to Loading Response (0-12%)
      // Small flexion wave during weight acceptance
      angle = 12 * Math.sin(cyclePosition * Math.PI / 0.12);
    } else if (cyclePosition < 0.31) {
      // Loading Response to Mid Stance (12-31%)
      // Extension to neutral
      const localPos = (cyclePosition - 0.12) / (0.31 - 0.12);
      angle = 12 * (1 - localPos) + 2 * Math.sin(localPos * Math.PI);
    } else if (cyclePosition < 0.50) {
      // Mid Stance to Terminal Stance (31-50%)
      // Slight extension, approaching toe-off
      const localPos = (cyclePosition - 0.31) / (0.50 - 0.31);
      angle = 2 * (1 - localPos);
    } else if (cyclePosition < 0.62) {
      // Terminal Stance to Pre-Swing (50-62%)
      // Beginning of swing flexion
      const localPos = (cyclePosition - 0.50) / (0.62 - 0.50);
      angle = 15 * localPos;
    } else if (cyclePosition < 0.75) {
      // Pre-Swing to Initial Swing (62-75%)
      // Peak swing flexion
      const localPos = (cyclePosition - 0.62) / (0.75 - 0.62);
      angle = 15 + 50 * Math.sin(localPos * Math.PI);
    } else if (cyclePosition < 0.87) {
      // Initial Swing to Mid Swing (75-87%)
      // Maintaining swing flexion
      const localPos = (cyclePosition - 0.75) / (0.87 - 0.75);
      angle = 65 - 25 * localPos;
    } else {
      // Mid Swing to Terminal Swing (87-100%)
      // Extension preparing for next IC
      const localPos = (cyclePosition - 0.87) / (1.0 - 0.87);
      angle = 40 * (1 - localPos) + 5 * Math.sin(localPos * 2 * Math.PI);
    }
    
    return Math.max(-5, Math.min(75, angle));
  }

  /**
   * Apply smoothing and asymmetry to knee angle data
   */
  private applySmoothingAndAsymmetry(baseAngle: number, asymmetryFactor: number, frameIndex: number, totalFrames: number): number {
    // Apply asymmetry factor
    let angle = baseAngle * asymmetryFactor;
    
    // Add small amount of realistic noise (±1°)
    const noise = (Math.random() - 0.5) * 2;
    angle += noise;
    
    // Apply simple moving average for smoothing (3-point window)
    // This is a simplified version - in real implementation would use proper filtering
    const smoothingFactor = 0.1;
    angle = angle * (1 - smoothingFactor) + baseAngle * smoothingFactor;
    
    return Math.round(angle * 10) / 10;
  }

  /**
   * Generate averaged single gait cycle from multiple cycles
   */
  private generateAveragedSingleCycle(dataPoints: KneeDataPoint[]): KneeDataPoint[] {
    // Extract cycles and average them for clean output
    const cycleDuration = this.config.analysisSettings.cycleDuration;
    const frameRate = this.config.analysisSettings.frameRate;
    const framesPerCycle = Math.floor(cycleDuration * frameRate);
    
    // Group data by cycle percentage for averaging
    const averagedData: { [key: number]: { left: number[], right: number[], phase: string } } = {};
    
    dataPoints.forEach(point => {
      const percent = Math.round(point.gaitCyclePercent);
      // Safety check for valid data
      if (percent >= 0 && percent <= 100 && !isNaN(point.kneeLeft) && !isNaN(point.kneeRight)) {
        if (!averagedData[percent]) {
          averagedData[percent] = { left: [], right: [], phase: point.phase };
        }
        averagedData[percent].left.push(point.kneeLeft);
        averagedData[percent].right.push(point.kneeRight);
      }
    });
    
    // Create single averaged cycle
    const singleCycle: KneeDataPoint[] = [];
    for (let percent = 0; percent <= 100; percent++) {
      if (averagedData[percent] && averagedData[percent].left.length > 0 && averagedData[percent].right.length > 0) {
        const avgLeft = averagedData[percent].left.reduce((sum, val) => sum + val, 0) / averagedData[percent].left.length;
        const avgRight = averagedData[percent].right.reduce((sum, val) => sum + val, 0) / averagedData[percent].right.length;
        
        singleCycle.push({
          gaitCyclePercent: percent,
          phase: averagedData[percent].phase,
          kneeLeft: Math.round(avgLeft * 10) / 10,
          kneeRight: Math.round(avgRight * 10) / 10,
          time: percent / 100 * cycleDuration
        });
      }
    }
    
    return singleCycle.length > 0 ? singleCycle : dataPoints.slice(0, framesPerCycle);
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
    
    if (asymmetry >= 15) {
      recommendations.push("High knee asymmetry detected. Focus on bilateral training.");
    } else if (asymmetry >= 5) {
      recommendations.push("Moderate knee asymmetry detected. Include unilateral exercises.");
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
