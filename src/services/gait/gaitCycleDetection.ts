/**
 * Professional Gait Cycle Detection Service
 * Detects Initial Contact (IC) events and extracts complete gait cycles
 */

export interface GaitEvent {
  frame: number;
  time: number;
  type: 'IC' | 'LR' | 'MSt' | 'TSt' | 'PSw' | 'ISw' | 'MSw' | 'TSw';
  leg: 'left' | 'right';
}

export interface GaitCycle {
  leg: 'left' | 'right';
  startFrame: number;
  endFrame: number;
  startTime: number;
  endTime: number;
  duration: number;
  frames: number[];
  hipAngles: number[];
  kneeAngles: number[];
  ankleAngles: number[];
}

export interface GaitData {
  frame: number;
  time: number;
  leftHip: number;
  rightHip: number;
  leftKnee: number;
  rightKnee: number;
  leftAnkle: number;
  rightAnkle: number;
  leftFootContact: boolean;
  rightFootContact: boolean;
}

export class GaitCycleDetector {
  /**
   * Generate realistic gait data for demonstration
   */
  static generateRealisticGaitData(durationSeconds: number = 10, frameRate: number = 100): GaitData[] {
    const frames = Math.floor(durationSeconds * frameRate);
    const data: GaitData[] = [];
    
    // Typical gait cycle duration: 1.0-1.2 seconds
    const gaitCycleDuration = 1.1; // seconds
    const framesPerCycle = gaitCycleDuration * frameRate;
    
    for (let i = 0; i < frames; i++) {
      const time = i / frameRate;
      
      // Calculate cycle positions for each leg (offset by half cycle)
      const leftCyclePosition = (time % gaitCycleDuration) / gaitCycleDuration;
      const rightCyclePosition = ((time + gaitCycleDuration / 2) % gaitCycleDuration) / gaitCycleDuration;
      
      // Generate realistic hip angles (-20° to +30°)
      const leftHip = this.generateHipAngle(leftCyclePosition);
      const rightHip = this.generateHipAngle(rightCyclePosition);
      
      // Generate realistic knee angles (0° to +70°)
      const leftKnee = this.generateKneeAngle(leftCyclePosition);
      const rightKnee = this.generateKneeAngle(rightCyclePosition);
      
      // Generate realistic ankle angles (-20° to +20°)
      const leftAnkle = this.generateAnkleAngle(leftCyclePosition);
      const rightAnkle = this.generateAnkleAngle(rightCyclePosition);
      
      // Determine foot contact (stance phase: 0-60% of cycle)
      const leftFootContact = leftCyclePosition <= 0.6;
      const rightFootContact = rightCyclePosition <= 0.6;
      
      data.push({
        frame: i,
        time,
        leftHip,
        rightHip,
        leftKnee,
        rightKnee,
        leftAnkle,
        rightAnkle,
        leftFootContact,
        rightFootContact
      });
    }
    
    return data;
  }
  
  /**
   * Generate realistic hip angle for a given cycle position (0-1)
   */
  private static generateHipAngle(cyclePosition: number): number {
    // Hip flexion pattern: peak flexion at toe-off (~60%), extension in swing
    const baseAngle = 20 * Math.sin(2 * Math.PI * cyclePosition - Math.PI / 3);
    const noise = (Math.random() - 0.5) * 3; // ±1.5° noise
    return Math.round((baseAngle + noise) * 10) / 10;
  }
  
  /**
   * Generate realistic knee angle for a given cycle position (0-1)
   */
  private static generateKneeAngle(cyclePosition: number): number {
    // Knee flexion pattern: two peaks (loading response and swing)
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
    
    const noise = (Math.random() - 0.5) * 2;
    return Math.round((Math.max(0, angle) + noise) * 10) / 10;
  }
  
  /**
   * Generate realistic ankle angle for a given cycle position (0-1)
   */
  private static generateAnkleAngle(cyclePosition: number): number {
    // Ankle dorsi/plantarflexion pattern
    const baseAngle = 15 * Math.sin(2 * Math.PI * cyclePosition + Math.PI / 4);
    const noise = (Math.random() - 0.5) * 2;
    return Math.round((baseAngle + noise) * 10) / 10;
  }
  
  /**
   * Detect Initial Contact (IC) events from foot contact data
   */
  static detectInitialContacts(data: GaitData[]): GaitEvent[] {
    const events: GaitEvent[] = [];
    
    // Detect left foot IC events
    for (let i = 1; i < data.length; i++) {
      // IC occurs when foot contact changes from false to true
      if (!data[i - 1].leftFootContact && data[i].leftFootContact) {
        events.push({
          frame: i,
          time: data[i].time,
          type: 'IC',
          leg: 'left'
        });
      }
      
      if (!data[i - 1].rightFootContact && data[i].rightFootContact) {
        events.push({
          frame: i,
          time: data[i].time,
          type: 'IC',
          leg: 'right'
        });
      }
    }
    
    return events.sort((a, b) => a.frame - b.frame);
  }
  
  /**
   * Extract complete gait cycles from IC events
   */
  static extractGaitCycles(data: GaitData[], icEvents: GaitEvent[]): GaitCycle[] {
    const cycles: GaitCycle[] = [];
    
    // Group IC events by leg
    const leftICs = icEvents.filter(e => e.leg === 'left');
    const rightICs = icEvents.filter(e => e.leg === 'right');
    
    // Extract left leg cycles
    for (let i = 0; i < leftICs.length - 1; i++) {
      const startEvent = leftICs[i];
      const endEvent = leftICs[i + 1];
      
      const cycle = this.createGaitCycle(data, startEvent, endEvent, 'left');
      if (cycle) cycles.push(cycle);
    }
    
    // Extract right leg cycles
    for (let i = 0; i < rightICs.length - 1; i++) {
      const startEvent = rightICs[i];
      const endEvent = rightICs[i + 1];
      
      const cycle = this.createGaitCycle(data, startEvent, endEvent, 'right');
      if (cycle) cycles.push(cycle);
    }
    
    return cycles;
  }
  
  /**
   * Create a gait cycle from start and end events
   */
  private static createGaitCycle(
    data: GaitData[], 
    startEvent: GaitEvent, 
    endEvent: GaitEvent, 
    leg: 'left' | 'right'
  ): GaitCycle | null {
    const startFrame = startEvent.frame;
    const endFrame = endEvent.frame;
    
    // Ensure minimum cycle duration (0.8 seconds) and maximum (1.5 seconds)
    const duration = endEvent.time - startEvent.time;
    if (duration < 0.8 || duration > 1.5) {
      return null;
    }
    
    const frames: number[] = [];
    const hipAngles: number[] = [];
    const kneeAngles: number[] = [];
    const ankleAngles: number[] = [];
    
    for (let i = startFrame; i <= endFrame && i < data.length; i++) {
      frames.push(i);
      
      if (leg === 'left') {
        hipAngles.push(data[i].leftHip);
        kneeAngles.push(data[i].leftKnee);
        ankleAngles.push(data[i].leftAnkle);
      } else {
        hipAngles.push(data[i].rightHip);
        kneeAngles.push(data[i].rightKnee);
        ankleAngles.push(data[i].rightAnkle);
      }
    }
    
    return {
      leg,
      startFrame,
      endFrame,
      startTime: startEvent.time,
      endTime: endEvent.time,
      duration,
      frames,
      hipAngles,
      kneeAngles,
      ankleAngles
    };
  }
  
  /**
   * Normalize gait cycles to 0-100% with resampling
   */
  static normalizeGaitCycles(cycles: GaitCycle[], pointsCount: number = 101): {
    leg: 'left' | 'right';
    normalizedHip: number[];
    normalizedKnee: number[];
    normalizedAnkle: number[];
  }[] {
    return cycles.map(cycle => {
      const normalizedHip = this.resampleData(cycle.hipAngles, pointsCount);
      const normalizedKnee = this.resampleData(cycle.kneeAngles, pointsCount);
      const normalizedAnkle = this.resampleData(cycle.ankleAngles, pointsCount);
      
      return {
        leg: cycle.leg,
        normalizedHip,
        normalizedKnee,
        normalizedAnkle
      };
    });
  }
  
  /**
   * Resample data to specified number of points using linear interpolation
   */
  private static resampleData(data: number[], targetPoints: number): number[] {
    if (data.length === 0) return [];
    if (data.length === 1) return new Array(targetPoints).fill(data[0]);
    
    const result: number[] = [];
    const step = (data.length - 1) / (targetPoints - 1);
    
    for (let i = 0; i < targetPoints; i++) {
      const index = i * step;
      const lowerIndex = Math.floor(index);
      const upperIndex = Math.ceil(index);
      
      if (lowerIndex === upperIndex) {
        result.push(data[lowerIndex]);
      } else {
        const weight = index - lowerIndex;
        const interpolated = data[lowerIndex] * (1 - weight) + data[upperIndex] * weight;
        result.push(Math.round(interpolated * 10) / 10);
      }
    }
    
    return result;
  }
  
  /**
   * Calculate average joint angles across multiple cycles
   */
  static calculateAverageAngles(normalizedCycles: ReturnType<typeof GaitCycleDetector.normalizeGaitCycles>): {
    leftHip: number[];
    rightHip: number[];
    leftKnee: number[];
    rightKnee: number[];
    leftAnkle: number[];
    rightAnkle: number[];
  } {
    const leftCycles = normalizedCycles.filter(c => c.leg === 'left');
    const rightCycles = normalizedCycles.filter(c => c.leg === 'right');
    
    const pointsCount = leftCycles[0]?.normalizedHip.length || 101;
    
    const result = {
      leftHip: new Array(pointsCount).fill(0),
      rightHip: new Array(pointsCount).fill(0),
      leftKnee: new Array(pointsCount).fill(0),
      rightKnee: new Array(pointsCount).fill(0),
      leftAnkle: new Array(pointsCount).fill(0),
      rightAnkle: new Array(pointsCount).fill(0)
    };
    
    // Calculate averages for left leg
    if (leftCycles.length > 0) {
      for (let i = 0; i < pointsCount; i++) {
        result.leftHip[i] = leftCycles.reduce((sum, cycle) => sum + cycle.normalizedHip[i], 0) / leftCycles.length;
        result.leftKnee[i] = leftCycles.reduce((sum, cycle) => sum + cycle.normalizedKnee[i], 0) / leftCycles.length;
        result.leftAnkle[i] = leftCycles.reduce((sum, cycle) => sum + cycle.normalizedAnkle[i], 0) / leftCycles.length;
      }
    }
    
    // Calculate averages for right leg
    if (rightCycles.length > 0) {
      for (let i = 0; i < pointsCount; i++) {
        result.rightHip[i] = rightCycles.reduce((sum, cycle) => sum + cycle.normalizedHip[i], 0) / rightCycles.length;
        result.rightKnee[i] = rightCycles.reduce((sum, cycle) => sum + cycle.normalizedKnee[i], 0) / rightCycles.length;
        result.rightAnkle[i] = rightCycles.reduce((sum, cycle) => sum + cycle.normalizedAnkle[i], 0) / rightCycles.length;
      }
    }
    
    // Round to 1 decimal place
    Object.keys(result).forEach(key => {
      result[key as keyof typeof result] = result[key as keyof typeof result].map(val => Math.round(val * 10) / 10);
    });
    
    return result;
  }
}
