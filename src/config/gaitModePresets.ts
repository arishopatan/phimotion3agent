/**
 * Professional Gait Mode Configuration
 * Supports different gait types with specific settings and reference ranges
 */

export type GaitMode = 'walk' | 'run' | 'sprint';

export interface GaitModeConfig {
  mode: GaitMode;
  label: string;
  description: string;
  yAxisRange: {
    min: number;
    max: number;
    center: number; // Anatomical neutral reference
  };
  jointRanges: {
    hip: { min: number; max: number; center: number };
    knee: { min: number; max: number; center: number };
    ankle: { min: number; max: number; center: number };
  };
  phaseBoundaries: {
    IC: number;   // Initial Contact
    LR: number;   // Loading Response
    MSt: number;  // Mid Stance
    TSt: number;  // Terminal Stance
    PSw: number;  // Pre-Swing
    ISw: number;  // Initial Swing
    MSw: number;  // Mid Swing
    TSw: number;  // Terminal Swing
  };
  analysisSettings: {
    frameRate: number;
    cycleDuration: number; // seconds
    minCycles: number;
    maxCycles: number;
  };
  qualityThresholds: {
    excellent: { confidence: number; asymmetry: number };
    good: { confidence: number; asymmetry: number };
    fair: { confidence: number; asymmetry: number };
    poor: { confidence: number; asymmetry: number };
  };
}

export const GAIT_MODE_PRESETS: Record<GaitMode, GaitModeConfig> = {
  walk: {
    mode: 'walk',
    label: 'Walking',
    description: 'Normal walking gait analysis',
    yAxisRange: {
      min: -20,
      max: 80,
      center: 0 // Anatomical neutral reference
    },
    jointRanges: {
      hip: { min: -50, max: 50, center: 0 },
      knee: { min: -20, max: 80, center: 0 },
      ankle: { min: -30, max: 30, center: 0 }
    },
    phaseBoundaries: {
      IC: 0,    // Initial Contact
      LR: 12,   // Loading Response
      MSt: 31,  // Mid Stance
      TSt: 50,  // Terminal Stance
      PSw: 62,  // Pre-Swing
      ISw: 75,  // Initial Swing
      MSw: 87,  // Mid Swing
      TSw: 100  // Terminal Swing
    },
    analysisSettings: {
      frameRate: 100,
      cycleDuration: 1.1, // seconds
      minCycles: 3,
      maxCycles: 15
    },
    qualityThresholds: {
      excellent: { confidence: 0.8, asymmetry: 5 },
      good: { confidence: 0.6, asymmetry: 10 },
      fair: { confidence: 0.4, asymmetry: 15 },
      poor: { confidence: 0.2, asymmetry: 20 }
    }
  },
  
  run: {
    mode: 'run',
    label: 'Running',
    description: 'Running gait analysis (future implementation)',
    yAxisRange: {
      min: -30,
      max: 100,
      center: 0
    },
    jointRanges: {
      hip: { min: -60, max: 60, center: 0 },
      knee: { min: -30, max: 100, center: 0 },
      ankle: { min: -40, max: 40, center: 0 }
    },
    phaseBoundaries: {
      IC: 0,
      LR: 10,
      MSt: 25,
      TSt: 45,
      PSw: 55,
      ISw: 70,
      MSw: 85,
      TSw: 100
    },
    analysisSettings: {
      frameRate: 120,
      cycleDuration: 0.8,
      minCycles: 5,
      maxCycles: 20
    },
    qualityThresholds: {
      excellent: { confidence: 0.85, asymmetry: 8 },
      good: { confidence: 0.65, asymmetry: 15 },
      fair: { confidence: 0.45, asymmetry: 20 },
      poor: { confidence: 0.25, asymmetry: 25 }
    }
  },
  
  sprint: {
    mode: 'sprint',
    label: 'Sprinting',
    description: 'Sprint gait analysis (future implementation)',
    yAxisRange: {
      min: -40,
      max: 120,
      center: 0
    },
    jointRanges: {
      hip: { min: -70, max: 70, center: 0 },
      knee: { min: -40, max: 120, center: 0 },
      ankle: { min: -50, max: 50, center: 0 }
    },
    phaseBoundaries: {
      IC: 0,
      LR: 8,
      MSt: 20,
      TSt: 40,
      PSw: 50,
      ISw: 65,
      MSw: 80,
      TSw: 100
    },
    analysisSettings: {
      frameRate: 200,
      cycleDuration: 0.6,
      minCycles: 8,
      maxCycles: 25
    },
    qualityThresholds: {
      excellent: { confidence: 0.9, asymmetry: 10 },
      good: { confidence: 0.7, asymmetry: 18 },
      fair: { confidence: 0.5, asymmetry: 25 },
      poor: { confidence: 0.3, asymmetry: 30 }
    }
  }
};

/**
 * Get configuration for a specific gait mode
 */
export function getGaitModeConfig(mode: GaitMode): GaitModeConfig {
  return GAIT_MODE_PRESETS[mode];
}

/**
 * Get available gait modes
 */
export function getAvailableGaitModes(): Array<{ value: GaitMode; label: string; description: string }> {
  return Object.values(GAIT_MODE_PRESETS).map(config => ({
    value: config.mode,
    label: config.label,
    description: config.description
  }));
}

/**
 * Get joint-specific configuration
 */
export function getJointConfig(mode: GaitMode, joint: 'hip' | 'knee' | 'ankle') {
  const config = getGaitModeConfig(mode);
  return config.jointRanges[joint];
}

/**
 * Get phase boundaries for a gait mode
 */
export function getPhaseBoundaries(mode: GaitMode) {
  const config = getGaitModeConfig(mode);
  return config.phaseBoundaries;
}

/**
 * Get quality thresholds for a gait mode
 */
export function getQualityThresholds(mode: GaitMode) {
  const config = getGaitModeConfig(mode);
  return config.qualityThresholds;
}
