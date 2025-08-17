/**
 * Professional Range of Motion (ROM) Calculation Service
 * Implements anatomical zero, peak detection, and percentile fallback methods
 */

export interface ROMResult {
  anatomicalZero: number;
  maxFlexion: number;
  maxExtension: number;
  totalROM: number;
  method: 'peak_detection' | 'percentile_fallback';
  confidence: number; // 0-1, how confident we are in the calculation
}

export interface PeakPoint {
  index: number;
  value: number;
  type: 'flexion' | 'extension';
  confidence: number;
}

export interface ROMAnalysis {
  left: ROMResult;
  right: ROMResult;
  asymmetry: number; // Difference between left and right ROM
  averageROM: number;
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

export class ROMCalculator {
  /**
   * Calculate anatomical zero as mean of first 10-20 frames
   */
  static calculateAnatomicalZero(angles: number[], frameCount: number = 15): number {
    const initialFrames = angles.slice(0, Math.min(frameCount, angles.length));
    if (initialFrames.length === 0) return 0;
    
    const sum = initialFrames.reduce((acc, angle) => acc + angle, 0);
    return Math.round((sum / initialFrames.length) * 10) / 10;
  }

  /**
   * Find peaks in the angle data using local maxima/minima detection
   */
  static findPeaks(angles: number[], anatomicalZero: number): PeakPoint[] {
    const peaks: PeakPoint[] = [];
    const windowSize = 3; // Minimum distance between peaks
    
    for (let i = windowSize; i < angles.length - windowSize; i++) {
      const current = angles[i];
      const isFlexionPeak = current > anatomicalZero && 
        angles.slice(i - windowSize, i).every(val => val <= current) &&
        angles.slice(i + 1, i + windowSize + 1).every(val => val <= current);
      
      const isExtensionPeak = current < anatomicalZero &&
        angles.slice(i - windowSize, i).every(val => val >= current) &&
        angles.slice(i + 1, i + windowSize + 1).every(val => val >= current);
      
      if (isFlexionPeak) {
        peaks.push({
          index: i,
          value: current,
          type: 'flexion',
          confidence: this.calculatePeakConfidence(angles, i, windowSize)
        });
      } else if (isExtensionPeak) {
        peaks.push({
          index: i,
          value: current,
          type: 'extension',
          confidence: this.calculatePeakConfidence(angles, i, windowSize)
        });
      }
    }
    
    return peaks;
  }

  /**
   * Calculate confidence in peak detection based on surrounding data
   */
  private static calculatePeakConfidence(angles: number[], peakIndex: number, windowSize: number): number {
    const peak = angles[peakIndex];
    const before = angles.slice(peakIndex - windowSize, peakIndex);
    const after = angles.slice(peakIndex + 1, peakIndex + windowSize + 1);
    
    // Calculate how much the peak stands out from surrounding values
    const beforeDiff = Math.abs(peak - Math.max(...before));
    const afterDiff = Math.abs(peak - Math.max(...after));
    const avgDiff = (beforeDiff + afterDiff) / 2;
    
    // Normalize confidence (0-1)
    return Math.min(avgDiff / 10, 1); // Assuming 10° is a strong peak
  }

  /**
   * Calculate ROM using percentile method (95th/5th percentiles)
   */
  static calculatePercentileROM(angles: number[], anatomicalZero: number): ROMResult {
    const sorted = [...angles].sort((a, b) => a - b);
    const percentile95 = sorted[Math.floor(sorted.length * 0.95)];
    const percentile5 = sorted[Math.floor(sorted.length * 0.05)];
    
    return {
      anatomicalZero,
      maxFlexion: Math.round(percentile95 * 10) / 10,
      maxExtension: Math.round(percentile5 * 10) / 10,
      totalROM: Math.round((percentile95 - percentile5) * 10) / 10,
      method: 'percentile_fallback',
      confidence: 0.7 // Lower confidence for percentile method
    };
  }

  /**
   * Calculate ROM using peak detection with percentile fallback
   */
  static calculatePeakROM(angles: number[], anatomicalZero: number): ROMResult {
    const peaks = this.findPeaks(angles, anatomicalZero);
    
    // Separate flexion and extension peaks
    const flexionPeaks = peaks.filter(p => p.type === 'flexion');
    const extensionPeaks = peaks.filter(p => p.type === 'extension');
    
    // Calculate average confidence
    const avgConfidence = peaks.length > 0 
      ? peaks.reduce((sum, p) => sum + p.confidence, 0) / peaks.length 
      : 0;
    
    // Use peak detection if we have enough reliable peaks
    if (flexionPeaks.length >= 1 && extensionPeaks.length >= 1 && avgConfidence > 0.3) {
      const maxFlexion = Math.max(...flexionPeaks.map(p => p.value));
      const maxExtension = Math.min(...extensionPeaks.map(p => p.value));
      
      return {
        anatomicalZero,
        maxFlexion: Math.round(maxFlexion * 10) / 10,
        maxExtension: Math.round(maxExtension * 10) / 10,
        totalROM: Math.round((maxFlexion - maxExtension) * 10) / 10,
        method: 'peak_detection',
        confidence: Math.min(avgConfidence, 0.95)
      };
    }
    
    // Fallback to percentile method
    return this.calculatePercentileROM(angles, anatomicalZero);
  }

  /**
   * Calculate ROM for a single leg
   */
  static calculateLegROM(angles: number[]): ROMResult {
    if (angles.length === 0) {
      return {
        anatomicalZero: 0,
        maxFlexion: 0,
        maxExtension: 0,
        totalROM: 0,
        method: 'percentile_fallback',
        confidence: 0
      };
    }
    
    const anatomicalZero = this.calculateAnatomicalZero(angles);
    return this.calculatePeakROM(angles, anatomicalZero);
  }

  /**
   * Calculate bilateral ROM analysis
   */
  static calculateBilateralROM(leftAngles: number[], rightAngles: number[]): ROMAnalysis {
    const leftROM = this.calculateLegROM(leftAngles);
    const rightROM = this.calculateLegROM(rightAngles);
    
    const asymmetry = Math.abs(leftROM.totalROM - rightROM.totalROM);
    const averageROM = (leftROM.totalROM + rightROM.totalROM) / 2;
    
    // Determine data quality based on confidence and asymmetry
    const avgConfidence = (leftROM.confidence + rightROM.confidence) / 2;
    let dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
    
    if (avgConfidence > 0.8 && asymmetry < 5) {
      dataQuality = 'excellent';
    } else if (avgConfidence > 0.6 && asymmetry < 10) {
      dataQuality = 'good';
    } else if (avgConfidence > 0.4 && asymmetry < 15) {
      dataQuality = 'fair';
    } else {
      dataQuality = 'poor';
    }
    
    return {
      left: leftROM,
      right: rightROM,
      asymmetry: Math.round(asymmetry * 10) / 10,
      averageROM: Math.round(averageROM * 10) / 10,
      dataQuality
    };
  }

  /**
   * Generate ROM data for CSV export
   */
  static generateROMCSVData(
    leftAngles: number[], 
    rightAngles: number[], 
    timePoints: number[]
  ): Array<{
    frame: number;
    time: number;
    leftAngle: number;
    rightAngle: number;
    leftROM: number;
    rightROM: number;
    leftFlexion: number;
    rightFlexion: number;
    leftExtension: number;
    rightExtension: number;
  }> {
    const leftROM = this.calculateLegROM(leftAngles);
    const rightROM = this.calculateLegROM(rightAngles);
    
    return timePoints.map((time, index) => {
      const leftAngle = leftAngles[index] || 0;
      const rightAngle = rightAngles[index] || 0;
      
      // Calculate current ROM as percentage of total ROM
      const leftCurrentROM = leftROM.totalROM > 0 
        ? ((leftAngle - leftROM.maxExtension) / leftROM.totalROM) * 100 
        : 0;
      const rightCurrentROM = rightROM.totalROM > 0 
        ? ((rightAngle - rightROM.maxExtension) / rightROM.totalROM) * 100 
        : 0;
      
      return {
        frame: index,
        time: Math.round(time * 100) / 100,
        leftAngle: Math.round(leftAngle * 10) / 10,
        rightAngle: Math.round(rightAngle * 10) / 10,
        leftROM: Math.round(leftCurrentROM * 10) / 10,
        rightROM: Math.round(rightCurrentROM * 10) / 10,
        leftFlexion: leftAngle > leftROM.anatomicalZero ? leftAngle - leftROM.anatomicalZero : 0,
        rightFlexion: rightAngle > rightROM.anatomicalZero ? rightAngle - rightROM.anatomicalZero : 0,
        leftExtension: leftAngle < leftROM.anatomicalZero ? leftROM.anatomicalZero - leftAngle : 0,
        rightExtension: rightAngle < rightROM.anatomicalZero ? rightROM.anatomicalZero - rightAngle : 0
      };
    });
  }

  /**
   * Generate ROM summary for JSON export
   */
  static generateROMSummary(leftAngles: number[], rightAngles: number[]): {
    analysis: ROMAnalysis;
    details: {
      left: ROMResult & { peaks: PeakPoint[] };
      right: ROMResult & { peaks: PeakPoint[] };
    };
    recommendations: string[];
  } {
    const analysis = this.calculateBilateralROM(leftAngles, rightAngles);
    
    const leftPeaks = this.findPeaks(leftAngles, analysis.left.anatomicalZero);
    const rightPeaks = this.findPeaks(rightAngles, analysis.right.anatomicalZero);
    
    const recommendations = this.generateRecommendations(analysis);
    
    return {
      analysis,
      details: {
        left: { ...analysis.left, peaks: leftPeaks },
        right: { ...analysis.right, peaks: rightPeaks }
      },
      recommendations
    };
  }

  /**
   * Generate recommendations based on ROM analysis
   */
  private static generateRecommendations(analysis: ROMAnalysis): string[] {
    const recommendations: string[] = [];
    
    // ROM range recommendations
    if (analysis.averageROM < 20) {
      recommendations.push("Hip ROM is below normal range. Consider mobility exercises.");
    } else if (analysis.averageROM > 50) {
      recommendations.push("Hip ROM is above normal range. Monitor for hypermobility.");
    }
    
    // Asymmetry recommendations
    if (analysis.asymmetry > 10) {
      recommendations.push("Significant asymmetry detected. Focus on bilateral training.");
    } else if (analysis.asymmetry > 5) {
      recommendations.push("Moderate asymmetry present. Include unilateral exercises.");
    }
    
    // Data quality recommendations
    if (analysis.dataQuality === 'poor') {
      recommendations.push("Data quality is poor. Consider re-recording with better conditions.");
    }
    
    return recommendations;
  }
}
