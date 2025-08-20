/**
 * Professional Ankle ROM Calculator
 * Calculates dorsiflexion/plantarflexion ROM with proper biomechanical analysis
 * Based on anatomical zero and dynamic gait phase detection
 */

export interface AnkleDataPoint {
  gaitCyclePercent: number;
  phase: string;
  ankleLeft: number;
  ankleRight: number;
  time: number;
}

export interface AnkleROMAnalysis {
  left: {
    maxDorsiflexion: number;
    maxPlantarflexion: number;
    totalROM: number;
    anatomicalZero: number;
  };
  right: {
    maxDorsiflexion: number;
    maxPlantarflexion: number;
    totalROM: number;
    anatomicalZero: number;
  };
  asymmetry: number;
  averageROM: number;
}

export interface AnkleQualityMetrics {
  confidence: number;
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
  recommendations: string[];
}

export interface AnkleAnalysisResult {
  romAnalysis: AnkleROMAnalysis;
  qualityMetrics: AnkleQualityMetrics;
  dataPoints: AnkleDataPoint[];
}

export class AnkleROMCalculator {
  /**
   * Calculate comprehensive ankle ROM analysis
   * ROM = abs(max_dorsiflexion) + abs(max_plantarflexion)
   */
  static calculateBilateralROM(leftAngles: number[], rightAngles: number[]): AnkleROMAnalysis {
    // Calculate anatomical zero from initial stance frames (first 10-20 frames)
    const leftAnatomicalZero = this.calculateAnatomicalZero(leftAngles);
    const rightAnatomicalZero = this.calculateAnatomicalZero(rightAngles);

    // Find peaks for dorsiflexion and plantarflexion
    const leftPeaks = this.findAnklePeaks(leftAngles, leftAnatomicalZero);
    const rightPeaks = this.findAnklePeaks(rightAngles, rightAnatomicalZero);

    // Calculate ROM for each side
    const leftROM = this.calculateAnkleROM(leftPeaks, leftAnatomicalZero);
    const rightROM = this.calculateAnkleROM(rightPeaks, rightAnatomicalZero);

    // Calculate asymmetry and average
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
   * Calculate anatomical zero from initial stance frames
   * Uses mean of first 10-20 frames as neutral standing reference
   */
  private static calculateAnatomicalZero(angles: number[]): number {
    const initialFrames = Math.min(20, Math.floor(angles.length * 0.1));
    const stanceFrames = angles.slice(0, initialFrames);
    const mean = stanceFrames.reduce((sum, angle) => sum + angle, 0) / stanceFrames.length;
    return Math.round(mean * 10) / 10;
  }

  /**
   * Find peaks for dorsiflexion (positive) and plantarflexion (negative)
   * Uses peak detection with percentile fallback for noisy data
   */
  private static findAnklePeaks(angles: number[], anatomicalZero: number): Array<{ value: number; type: 'dorsiflexion' | 'plantarflexion' }> {
    const peaks: Array<{ value: number; type: 'dorsiflexion' | 'plantarflexion' }> = [];
    
    // Find local maxima for dorsiflexion (positive peaks)
    for (let i = 1; i < angles.length - 1; i++) {
      if (angles[i] > angles[i - 1] && angles[i] > angles[i + 1] && angles[i] > anatomicalZero) {
        peaks.push({ value: angles[i], type: 'dorsiflexion' });
      }
    }

    // Find local minima for plantarflexion (negative peaks)
    for (let i = 1; i < angles.length - 1; i++) {
      if (angles[i] < angles[i - 1] && angles[i] < angles[i + 1] && angles[i] < anatomicalZero) {
        peaks.push({ value: angles[i], type: 'plantarflexion' });
      }
    }

    // If peak detection fails, use percentile method as fallback
    if (peaks.length === 0) {
      const sortedAngles = [...angles].sort((a, b) => a - b);
      const dorsiflexion95th = sortedAngles[Math.floor(sortedAngles.length * 0.95)];
      const plantarflexion5th = sortedAngles[Math.floor(sortedAngles.length * 0.05)];
      
      peaks.push(
        { value: dorsiflexion95th, type: 'dorsiflexion' },
        { value: plantarflexion5th, type: 'plantarflexion' }
      );
    }

    return peaks;
  }

  /**
   * Calculate ankle ROM: abs(max_dorsiflexion) + abs(max_plantarflexion)
   */
  private static calculateAnkleROM(peaks: Array<{ value: number; type: 'dorsiflexion' | 'plantarflexion' }>, anatomicalZero: number) {
    const dorsiflexionPeaks = peaks.filter(p => p.type === 'dorsiflexion');
    const plantarflexionPeaks = peaks.filter(p => p.type === 'plantarflexion');

    const maxDorsiflexion = dorsiflexionPeaks.length > 0 
      ? Math.max(...dorsiflexionPeaks.map(p => p.value))
      : anatomicalZero;
    
    const maxPlantarflexion = plantarflexionPeaks.length > 0 
      ? Math.min(...plantarflexionPeaks.map(p => p.value))
      : anatomicalZero;

    // ROM = abs(max_dorsiflexion) + abs(max_plantarflexion)
    const totalROM = Math.abs(maxDorsiflexion - anatomicalZero) + Math.abs(maxPlantarflexion - anatomicalZero);

    return {
      maxDorsiflexion: Math.round(maxDorsiflexion * 10) / 10,
      maxPlantarflexion: Math.round(maxPlantarflexion * 10) / 10,
      totalROM: Math.round(totalROM * 10) / 10
    };
  }

  /**
   * Calculate quality metrics for ankle analysis
   */
  static calculateQualityMetrics(romAnalysis: AnkleROMAnalysis): AnkleQualityMetrics {
    const { left, right, asymmetry } = romAnalysis;
    
    // Calculate confidence based on data consistency
    const leftConsistency = Math.abs(left.maxDorsiflexion - left.maxPlantarflexion) / left.totalROM;
    const rightConsistency = Math.abs(right.maxDorsiflexion - right.maxPlantarflexion) / right.totalROM;
    const confidence = (leftConsistency + rightConsistency) / 2;

    // Determine data quality
    let dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
    if (confidence > 0.8 && asymmetry < 5) {
      dataQuality = 'excellent';
    } else if (confidence > 0.6 && asymmetry < 10) {
      dataQuality = 'good';
    } else if (confidence > 0.4 && asymmetry < 15) {
      dataQuality = 'fair';
    } else {
      dataQuality = 'poor';
    }

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (romAnalysis.averageROM < 20) {
      recommendations.push("Ankle ROM is below normal range. Consider mobility exercises.");
    }
    
    if (asymmetry >= 10) {
      recommendations.push("Significant ankle asymmetry detected. Focus on bilateral training.");
    } else if (asymmetry >= 5) {
      recommendations.push("Moderate ankle asymmetry detected. Include unilateral exercises.");
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
   * Generate CSV data for ankle analysis
   */
  static generateAnkleCSVData(dataPoints: AnkleDataPoint[], romAnalysis: AnkleROMAnalysis): string {
    const headers = [
      'GaitCyclePercent',
      'Phase', 
      'AnkleLeft',
      'AnkleRight',
      'Time'
    ];

    const romHeaders = [
      'LeftMaxDorsiflexion',
      'LeftMaxPlantarflexion', 
      'LeftTotalROM',
      'RightMaxDorsiflexion',
      'RightMaxPlantarflexion',
      'RightTotalROM',
      'Asymmetry',
      'AverageROM'
    ];

    const csvRows = [
      headers.join(','),
      ...dataPoints.map(point => [
        point.gaitCyclePercent,
        point.phase,
        point.ankleLeft,
        point.ankleRight,
        point.time
      ].join(','))
    ];

    // Add ROM summary row
    const romRow = [
      romAnalysis.left.maxDorsiflexion,
      romAnalysis.left.maxPlantarflexion,
      romAnalysis.left.totalROM,
      romAnalysis.right.maxDorsiflexion,
      romAnalysis.right.maxPlantarflexion,
      romAnalysis.right.totalROM,
      romAnalysis.asymmetry,
      romAnalysis.averageROM
    ].join(',');

    return [romHeaders.join(','), romRow, '', ...csvRows].join('\n');
  }
}
