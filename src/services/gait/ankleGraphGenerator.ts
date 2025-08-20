/**
 * Professional Ankle Graph Generator
 * Generates biomechanically correct ankle angles with dorsiflexion/plantarflexion
 * Y-axis: -50° (plantarflexion) to +20° (dorsiflexion) with 0° anatomical neutral
 */

import { GaitMode, getGaitModeConfig } from '@/config/gaitModePresets';
import { AnkleDataPoint, AnkleAnalysisResult, AnkleROMCalculator } from './ankleROMCalculator';

// Re-export types for convenience
export type { AnkleDataPoint, AnkleAnalysisResult };

export class AnkleGraphGenerator {
  private mode: GaitMode;
  private config: ReturnType<typeof getGaitModeConfig>;

  constructor(mode: GaitMode = 'walk') {
    this.mode = mode;
    this.config = getGaitModeConfig(mode);
  }

  /**
   * Generate realistic ankle angle data for the specified gait mode
   * Creates clean, single gait cycle with proper dorsiflexion/plantarflexion
   */
  generateAnkleData(durationSeconds: number = 10): AnkleDataPoint[] {
    const frameRate = this.config.analysisSettings.frameRate;
    const cycleDuration = this.config.analysisSettings.cycleDuration;
    const frames = Math.floor(durationSeconds * frameRate);
    const dataPoints: AnkleDataPoint[] = [];

    // Generate individual asymmetry factors for realistic differences
    const leftAsymmetryFactor = 0.95 + (Math.random() * 0.1); // 0.95-1.05
    const rightAsymmetryFactor = 0.95 + (Math.random() * 0.1); // 0.95-1.05

    for (let i = 0; i < frames; i++) {
      const time = i / frameRate;
      
      // Calculate cycle positions for each leg (offset by half cycle)
      const leftCyclePosition = (time % cycleDuration) / cycleDuration;
      const rightCyclePosition = ((time + cycleDuration / 2) % cycleDuration) / cycleDuration;
      
      // Generate realistic ankle angles with asymmetry
      const baseLeftAnkle = this.generateAnkleAngle(leftCyclePosition);
      const baseRightAnkle = this.generateAnkleAngle(rightCyclePosition);
      
      // Apply asymmetry and smoothing
      const leftAnkle = this.applySmoothingAndAsymmetry(baseLeftAnkle, leftAsymmetryFactor, i, frames);
      const rightAnkle = this.applySmoothingAndAsymmetry(baseRightAnkle, rightAsymmetryFactor, i, frames);
      
      // Determine gait phase
      const phase = this.getPhaseAtPosition(leftCyclePosition);
      
      dataPoints.push({
        gaitCyclePercent: leftCyclePosition * 100,
        phase,
        ankleLeft: leftAnkle,
        ankleRight: rightAnkle,
        time
      });
    }

    return this.generateAveragedSingleCycle(dataPoints);
  }

  /**
   * Generate biomechanically correct ankle angle for a given cycle position (0-1)
   * Y-axis: -50° (plantarflexion) to +20° (dorsiflexion) with 0° anatomical neutral
   */
  private generateAnkleAngle(cyclePosition: number): number {
    const { min, max } = this.config.jointRanges.ankle;
    let angle = 0;
    
    // Ankle dorsiflexion/plantarflexion pattern varies by gait mode
    switch (this.mode) {
      case 'walk':
        angle = this.generateWalkingAnkleAngle(cyclePosition);
        break;
      case 'run':
        angle = this.generateRunningAnkleAngle(cyclePosition);
        break;
      case 'sprint':
        angle = this.generateSprintingAnkleAngle(cyclePosition);
        break;
      default:
        angle = this.generateWalkingAnkleAngle(cyclePosition);
    }
    
    // Add minimal realistic noise (±0.5°)
    const noise = (Math.random() - 0.5) * 1.0;
    const finalAngle = angle + noise;
    
    // Ensure within ankle range (-50° to +20°)
    return Math.max(min, Math.min(max, Math.round(finalAngle * 10) / 10));
  }

  /**
   * Generate walking ankle angle pattern - biomechanically correct
   * Dorsiflexion (+) and Plantarflexion (-) with 0° anatomical neutral
   */
  private generateWalkingAnkleAngle(cyclePosition: number): number {
    let angle = 0;
    
    // Professional walking ankle pattern based on biomechanics research
    if (cyclePosition <= 0.60) {
      // STANCE PHASE (0-60%): Dorsiflexion during stance for forward progression
      
      if (cyclePosition <= 0.08) {
        // Initial Contact & Loading Response (0-8%): Heel strike with slight dorsiflexion
        const localPos = cyclePosition / 0.08;
        angle = 5 + 3 * Math.sin(localPos * Math.PI); // 5° to 8° to 5°
        
      } else if (cyclePosition <= 0.35) {
        // Mid Stance (8-35%): Controlled dorsiflexion for forward progression
        const localPos = (cyclePosition - 0.08) / (0.35 - 0.08);
        angle = 5 + 8 * localPos; // 5° to 13°
        
      } else {
        // Terminal Stance (35-60%): Peak dorsiflexion preparing for push-off
        const localPos = (cyclePosition - 0.35) / (0.60 - 0.35);
        angle = 13 + 7 * localPos; // 13° to 20°
      }
      
    } else {
      // SWING PHASE (60-100%): Plantarflexion for toe-off and swing clearance
      
      if (cyclePosition <= 0.75) {
        // Pre-Swing to Initial Swing (60-75%): Rapid plantarflexion for push-off
        const localPos = (cyclePosition - 0.60) / (0.75 - 0.60);
        // Smooth transition from dorsiflexion to plantarflexion
        const progress = localPos * localPos * (3 - 2 * localPos); // Smooth S-curve
        angle = 20 - 40 * progress; // 20° to -20°
        
      } else {
        // Mid Swing to Terminal Swing (75-100%): Gradual dorsiflexion for next heel strike
        const localPos = (cyclePosition - 0.75) / (1.0 - 0.75);
        // Smooth return to dorsiflexion
        const progress = localPos * localPos * (3 - 2 * localPos); // Smooth S-curve
        angle = -20 + 25 * progress; // -20° to 5°
      }
    }
    
    return Math.max(-50, Math.min(20, angle));
  }

  /**
   * Generate running ankle angle pattern (future implementation)
   */
  private generateRunningAnkleAngle(cyclePosition: number): number {
    // Similar to walking but with greater range and faster transitions
    let angle = 0;
    
    if (cyclePosition <= 0.50) {
      // Stance phase: More rapid dorsiflexion
      const localPos = cyclePosition / 0.50;
      angle = 5 + 20 * localPos; // 5° to 25°
    } else {
      // Swing phase: More rapid plantarflexion
      const localPos = (cyclePosition - 0.50) / (1.0 - 0.50);
      angle = 25 - 60 * localPos; // 25° to -35°
    }
    
    return Math.max(-50, Math.min(25, angle));
  }

  /**
   * Generate sprinting ankle angle pattern (future implementation)
   */
  private generateSprintingAnkleAngle(cyclePosition: number): number {
    // Even greater range for sprinting
    let angle = 0;
    
    if (cyclePosition <= 0.40) {
      // Shorter stance phase: Very rapid dorsiflexion
      const localPos = cyclePosition / 0.40;
      angle = 8 + 22 * localPos; // 8° to 30°
    } else {
      // Longer swing phase: Very rapid plantarflexion
      const localPos = (cyclePosition - 0.40) / (1.0 - 0.40);
      angle = 30 - 70 * localPos; // 30° to -40°
    }
    
    return Math.max(-50, Math.min(30, angle));
  }

  /**
   * Apply smoothing and asymmetry to ankle angle data
   */
  private applySmoothingAndAsymmetry(baseAngle: number, asymmetryFactor: number, frameIndex: number, totalFrames: number): number {
    // Apply asymmetry factor
    let angle = baseAngle * asymmetryFactor;
    
    // Add minimal realistic noise (±0.5°) for smoother curves
    const noise = (Math.random() - 0.5) * 1.0;
    angle += noise;
    
    // Enhanced smoothing for more dynamic flow
    const smoothingFactor = 0.05; // Reduced for more responsive curves
    angle = angle * (1 - smoothingFactor) + baseAngle * smoothingFactor;
    
    return Math.round(angle * 10) / 10;
  }

  /**
   * Generate averaged single gait cycle from multiple cycles
   */
  private generateAveragedSingleCycle(dataPoints: AnkleDataPoint[]): AnkleDataPoint[] {
    // Extract cycles and average them for clean output
    const cycleDuration = this.config.analysisSettings.cycleDuration;
    const frameRate = this.config.analysisSettings.frameRate;
    const framesPerCycle = Math.floor(cycleDuration * frameRate);
    
    // Group data by cycle percentage for averaging
    const averagedData: { [key: number]: { left: number[], right: number[], phase: string } } = {};
    
    dataPoints.forEach(point => {
      const percent = Math.round(point.gaitCyclePercent);
      // Safety check for valid data
      if (percent >= 0 && percent <= 100 && !isNaN(point.ankleLeft) && !isNaN(point.ankleRight)) {
        if (!averagedData[percent]) {
          averagedData[percent] = { left: [], right: [], phase: point.phase };
        }
        averagedData[percent].left.push(point.ankleLeft);
        averagedData[percent].right.push(point.ankleRight);
      }
    });
    
    // Create single averaged cycle
    const singleCycle: AnkleDataPoint[] = [];
    for (let percent = 0; percent <= 100; percent++) {
      if (averagedData[percent] && averagedData[percent].left.length > 0 && averagedData[percent].right.length > 0) {
        const avgLeft = averagedData[percent].left.reduce((sum, val) => sum + val, 0) / averagedData[percent].left.length;
        const avgRight = averagedData[percent].right.reduce((sum, val) => sum + val, 0) / averagedData[percent].right.length;
        
        singleCycle.push({
          gaitCyclePercent: percent,
          phase: averagedData[percent].phase,
          ankleLeft: Math.round(avgLeft * 10) / 10,
          ankleRight: Math.round(avgRight * 10) / 10,
          time: percent / 100 * cycleDuration
        });
      }
    }
    
    return singleCycle.length > 0 ? singleCycle : dataPoints.slice(0, framesPerCycle);
  }

  /**
   * Get gait phase at a given cycle position
   */
  private getPhaseAtPosition(cyclePosition: number): string {
    if (cyclePosition <= 0.02) return 'IC';
    if (cyclePosition <= 0.12) return 'LR';
    if (cyclePosition <= 0.31) return 'MSt';
    if (cyclePosition <= 0.50) return 'TSt';
    if (cyclePosition <= 0.62) return 'PSw';
    if (cyclePosition <= 0.73) return 'ISw';
    if (cyclePosition <= 0.87) return 'MSw';
    return 'TSw';
  }

  /**
   * Analyze ankle data and generate comprehensive results
   */
  analyzeAnkleData(dataPoints: AnkleDataPoint[]): AnkleAnalysisResult {
    // Extract left and right ankle angles
    const leftAngles = dataPoints.map(p => p.ankleLeft);
    const rightAngles = dataPoints.map(p => p.ankleRight);
    
    // Calculate ROM analysis using the ROM calculator
    const romAnalysis = AnkleROMCalculator.calculateBilateralROM(leftAngles, rightAngles);
    
    // Calculate quality metrics
    const qualityMetrics = AnkleROMCalculator.calculateQualityMetrics(romAnalysis);

    return {
      romAnalysis,
      qualityMetrics,
      dataPoints
    };
  }

  /**
   * Generate CSV data for ankle analysis
   */
  generateCSVData(dataPoints: AnkleDataPoint[]): string {
    const romAnalysis = AnkleROMCalculator.calculateBilateralROM(
      dataPoints.map(p => p.ankleLeft),
      dataPoints.map(p => p.ankleRight)
    );
    
    return AnkleROMCalculator.generateAnkleCSVData(dataPoints, romAnalysis);
  }
}
