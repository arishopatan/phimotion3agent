"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Download, BarChart3, Info, Play, RefreshCw, Target } from "lucide-react";
import { GaitCycleDetector, GaitData, GaitCycle } from "@/services/gait/gaitCycleDetection";
import { GaitPhaseDetector } from "@/services/gait/gaitPhaseDetection";
import { ROMCalculator, ROMAnalysis } from "@/services/gait/romCalculation";

interface HipGaitAnalysisProps {
  onExportPNG?: (canvas: HTMLCanvasElement) => void;
}

interface ChartDataPoint {
  percent: number;
  leftHip: number;
  rightHip: number;
  phase?: string;
}

export function HipGaitAnalysis({ onExportPNG }: HipGaitAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [gaitData, setGaitData] = useState<GaitData[]>([]);
  const [gaitCycles, setGaitCycles] = useState<GaitCycle[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [analysisStats, setAnalysisStats] = useState({
    totalCycles: 0,
    leftCycles: 0,
    rightCycles: 0,
    avgCycleDuration: 0,
    dataQuality: 'Excellent'
  });
  
  const [romAnalysis, setRomAnalysis] = useState<ROMAnalysis | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  
  const chartRef = useRef<HTMLDivElement>(null);

  /**
   * Generate realistic gait data and perform analysis
   */
  const performGaitAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate realistic gait data (10 seconds at 100 Hz)
      const rawData = GaitCycleDetector.generateRealisticGaitData(10, 100);
      setGaitData(rawData);
      
      // Detect Initial Contact events
      const icEvents = GaitCycleDetector.detectInitialContacts(rawData);
      
      // Extract complete gait cycles
      const cycles = GaitCycleDetector.extractGaitCycles(rawData, icEvents);
      setGaitCycles(cycles);
      
      // Normalize cycles to 0-100%
      const normalizedCycles = GaitCycleDetector.normalizeGaitCycles(cycles, 101);
      
      // Calculate average joint angles
      const averages = GaitCycleDetector.calculateAverageAngles(normalizedCycles);
      
      // Calculate ROM analysis
      const rom = ROMCalculator.calculateBilateralROM(averages.leftHip, averages.rightHip);
      setRomAnalysis(rom);
      
      // Generate CSV data
      const timePoints = Array.from({ length: 101 }, (_, i) => i / 100);
      const csvData = ROMCalculator.generateROMCSVData(
        averages.leftHip,
        averages.rightHip,
        timePoints
      );
      setCsvData(csvData);
      
      // Prepare chart data
      const chartPoints: ChartDataPoint[] = [];
      for (let i = 0; i <= 100; i++) {
        const phase = GaitPhaseDetector.getPhaseAtPercent(i);
        chartPoints.push({
          percent: i,
          leftHip: averages.leftHip[i] || 0,
          rightHip: averages.rightHip[i] || 0,
          phase: phase?.abbreviation
        });
      }
      setChartData(chartPoints);
      
      // Calculate statistics
      const leftCycles = cycles.filter(c => c.leg === 'left').length;
      const rightCycles = cycles.filter(c => c.leg === 'right').length;
      const avgDuration = cycles.reduce((sum, c) => sum + c.duration, 0) / cycles.length;
      
      setAnalysisStats({
        totalCycles: cycles.length,
        leftCycles,
        rightCycles,
        avgCycleDuration: Math.round(avgDuration * 100) / 100,
        dataQuality: cycles.length >= 8 ? 'Excellent' : cycles.length >= 5 ? 'Good' : 'Fair'
      });
      
    } catch (error) {
      console.error('Gait analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Export CSV data
   */
  const exportCSV = () => {
    if (csvData.length === 0) return;
    
    const headers = [
      'Frame',
      'Time(s)',
      'GaitCycle(%)',
      'LeftHip(deg)',
      'RightHip(deg)',
      'LeftROM(%)',
      'RightROM(%)',
      'LeftFlexion(deg)',
      'RightFlexion(deg)',
      'LeftExtension(deg)',
      'RightExtension(deg)'
    ];
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => [
        row.frame,
        row.time,
        Math.round(row.frame),
        row.leftAngle,
        row.rightAngle,
        row.leftROM,
        row.rightROM,
        row.leftFlexion,
        row.rightFlexion,
        row.leftExtension,
        row.rightExtension
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hip-gait-analysis-rom.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Export chart as PNG
   */
  const exportAsPNG = async () => {
    if (!chartRef.current) return;
    
    try {
      // Create a canvas to render the chart
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Set canvas size
      canvas.width = 1200;
      canvas.height = 600;
      
      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Title
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 24px system-ui';
      ctx.fillText('Hip Joint Angles - Average Gait Cycle', 50, 50);
      
      // Subtitle
      ctx.font = '16px system-ui';
      ctx.fillStyle = '#64748b';
      ctx.fillText(`Analysis of ${analysisStats.totalCycles} complete gait cycles`, 50, 80);
      
      // Draw chart area
      const chartX = 100;
      const chartY = 120;
      const chartWidth = 1000;
      const chartHeight = 400;
      
      // Chart background
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(chartX, chartY, chartWidth, chartHeight);
      
      // Chart border
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.strokeRect(chartX, chartY, chartWidth, chartHeight);
      
      // Draw grid lines
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 0.5;
      
      // Vertical grid lines (every 10%)
      for (let i = 0; i <= 10; i++) {
        const x = chartX + (i * chartWidth / 10);
        ctx.beginPath();
        ctx.moveTo(x, chartY);
        ctx.lineTo(x, chartY + chartHeight);
        ctx.stroke();
      }
      
      // Horizontal grid lines
      for (let i = 0; i <= 10; i++) {
        const y = chartY + (i * chartHeight / 10);
        ctx.beginPath();
        ctx.moveTo(chartX, y);
        ctx.lineTo(chartX + chartWidth, y);
        ctx.stroke();
      }
      
      // Draw phase markers
      const phaseMarkers = GaitPhaseDetector.generatePhaseMarkers();
      phaseMarkers.forEach(marker => {
        const x = chartX + (marker.percent / 100) * chartWidth;
        ctx.strokeStyle = marker.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(x, chartY);
        ctx.lineTo(x, chartY + chartHeight);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Phase label
        ctx.fillStyle = marker.color;
        ctx.font = '12px system-ui';
        ctx.fillText(marker.label, x + 3, chartY + 15);
      });
      
      // Draw zero line
      const zeroY = chartY + chartHeight / 2;
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(chartX, zeroY);
      ctx.lineTo(chartX + chartWidth, zeroY);
      ctx.stroke();
      
      // Draw data lines
      if (chartData.length > 0) {
        // Left hip (red)
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        chartData.forEach((point, index) => {
          const x = chartX + (point.percent / 100) * chartWidth;
          const y = zeroY - (point.leftHip / 50) * (chartHeight / 2); // Scale: -50° to +50°
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
        
        // Right hip (blue)
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        chartData.forEach((point, index) => {
          const x = chartX + (point.percent / 100) * chartWidth;
          const y = zeroY - (point.rightHip / 50) * (chartHeight / 2);
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
      }
      
      // Draw axes
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      
      // Y-axis
      ctx.beginPath();
      ctx.moveTo(chartX, chartY);
      ctx.lineTo(chartX, chartY + chartHeight);
      ctx.stroke();
      
      // X-axis
      ctx.beginPath();
      ctx.moveTo(chartX, chartY + chartHeight);
      ctx.lineTo(chartX + chartWidth, chartY + chartHeight);
      ctx.stroke();
      
      // Axis labels
      ctx.fillStyle = '#1e293b';
      ctx.font = '14px system-ui';
      
      // X-axis labels
      for (let i = 0; i <= 10; i++) {
        const x = chartX + (i * chartWidth / 10);
        const label = `${i * 10}%`;
        const metrics = ctx.measureText(label);
        ctx.fillText(label, x - metrics.width / 2, chartY + chartHeight + 20);
      }
      
      // Y-axis labels
      for (let i = 0; i <= 4; i++) {
        const y = chartY + (i * chartHeight / 4);
        const angle = 50 - (i * 25); // +50° to -50°
        const label = `${angle}°`;
        ctx.fillText(label, chartX - 30, y + 5);
      }
      
      // Axis titles
      ctx.font = 'bold 16px system-ui';
      ctx.fillText('Gait Cycle (%)', chartX + chartWidth / 2 - 50, chartY + chartHeight + 50);
      
      // Y-axis title (rotated)
      ctx.save();
      ctx.translate(30, chartY + chartHeight / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('Hip Flexion (+) / Extension (−)', -80, 0);
      ctx.restore();
      
      // Legend
      const legendY = chartY + chartHeight + 80;
      
      // Left leg
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(chartX, legendY, 20, 10);
      ctx.fillStyle = '#1e293b';
      ctx.font = '14px system-ui';
      ctx.fillText('Left Leg', chartX + 30, legendY + 8);
      
      // Right leg
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(chartX + 120, legendY, 20, 10);
      ctx.fillStyle = '#1e293b';
      ctx.fillText('Right Leg', chartX + 150, legendY + 8);
      
      if (onExportPNG) {
        onExportPNG(canvas);
      } else {
        // Download automatically
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'hip-gait-analysis.png';
            a.click();
            URL.revokeObjectURL(url);
          }
        });
      }
      
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Perform initial analysis
  useEffect(() => {
    performGaitAnalysis();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                Hip Joint Gait Analysis
              </CardTitle>
              <CardDescription>
                Average hip joint angles across complete gait cycles
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={performGaitAnalysis}
                disabled={isAnalyzing}
                variant="outline"
                size="sm"
              >
                {isAnalyzing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
              </Button>
              <Button
                onClick={exportCSV}
                variant="outline"
                size="sm"
                disabled={csvData.length === 0}
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button
                onClick={exportAsPNG}
                variant="outline"
                size="sm"
                disabled={chartData.length === 0}
              >
                <Download className="h-4 w-4" />
                Export PNG
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{analysisStats.totalCycles}</div>
            <div className="text-sm text-muted-foreground">Total Cycles</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{analysisStats.leftCycles}</div>
            <div className="text-sm text-muted-foreground">Left Cycles</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{analysisStats.rightCycles}</div>
            <div className="text-sm text-muted-foreground">Right Cycles</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{analysisStats.avgCycleDuration}s</div>
            <div className="text-sm text-muted-foreground">Avg Duration</div>
          </CardContent>
        </Card>
      </div>

      {/* ROM Analysis Summary */}
      {romAnalysis && (
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Range of Motion (ROM) Analysis
            </CardTitle>
            <CardDescription>
              Hip joint range of motion calculated using anatomical zero and peak detection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Left Hip ROM</h4>
                <div className="text-2xl font-bold text-red-600">{romAnalysis.left.totalROM}°</div>
                <div className="text-xs text-muted-foreground">
                  Flex: {romAnalysis.left.maxFlexion}° | Ext: {romAnalysis.left.maxExtension}°
                </div>
                <Badge variant="outline" className="text-xs">
                  {romAnalysis.left.method === 'peak_detection' ? 'Peak Detection' : 'Percentile'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Right Hip ROM</h4>
                <div className="text-2xl font-bold text-blue-600">{romAnalysis.right.totalROM}°</div>
                <div className="text-xs text-muted-foreground">
                  Flex: {romAnalysis.right.maxFlexion}° | Ext: {romAnalysis.right.maxExtension}°
                </div>
                <Badge variant="outline" className="text-xs">
                  {romAnalysis.right.method === 'peak_detection' ? 'Peak Detection' : 'Percentile'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Average ROM</h4>
                <div className="text-2xl font-bold text-green-600">{romAnalysis.averageROM}°</div>
                <div className="text-xs text-muted-foreground">
                  Bilateral average
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    romAnalysis.averageROM < 20 ? 'text-red-600' : 
                    romAnalysis.averageROM > 50 ? 'text-yellow-600' : 'text-green-600'
                  }`}
                >
                  {romAnalysis.averageROM < 20 ? 'Low ROM' : 
                   romAnalysis.averageROM > 50 ? 'High ROM' : 'Normal ROM'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Asymmetry</h4>
                <div className="text-2xl font-bold text-purple-600">{romAnalysis.asymmetry}°</div>
                <div className="text-xs text-muted-foreground">
                  Left vs Right difference
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    romAnalysis.asymmetry > 10 ? 'text-red-600' : 
                    romAnalysis.asymmetry > 5 ? 'text-yellow-600' : 'text-green-600'
                  }`}
                >
                  {romAnalysis.asymmetry > 10 ? 'High Asymmetry' : 
                   romAnalysis.asymmetry > 5 ? 'Moderate Asymmetry' : 'Low Asymmetry'}
                </Badge>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-sm">Data Quality</h5>
                  <p className="text-xs text-muted-foreground">
                    Confidence: {Math.round((romAnalysis.left.confidence + romAnalysis.right.confidence) / 2 * 100)}%
                  </p>
                </div>
                <Badge 
                  variant="outline" 
                  className={`${
                    romAnalysis.dataQuality === 'excellent' ? 'bg-green-50 text-green-700 border-green-200' :
                    romAnalysis.dataQuality === 'good' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    romAnalysis.dataQuality === 'fair' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                    'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  {romAnalysis.dataQuality.charAt(0).toUpperCase() + romAnalysis.dataQuality.slice(1)} Quality
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Chart */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Hip Joint Angles - Average Gait Cycle</CardTitle>
              <CardDescription>
                Flexion (+) / Extension (−) • Range: -50° to +50°
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {analysisStats.dataQuality} Quality
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div ref={chartRef} className="w-full">
            <ResponsiveContainer width="100%" height={500}>
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 40, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                
                {/* X-axis */}
                <XAxis 
                  dataKey="percent"
                  type="number"
                  scale="linear"
                  domain={[0, 100]}
                  ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                  tickFormatter={(value) => `${value}%`}
                  className="text-sm"
                />
                
                {/* Y-axis */}
                <YAxis 
                  domain={[-50, 50]}
                  ticks={[-50, -25, 0, 25, 50]}
                  tickFormatter={(value) => `${value}°`}
                  className="text-sm"
                />
                
                {/* Zero line */}
                <ReferenceLine y={0} stroke="#374151" strokeWidth={1} />
                
                {/* Phase markers */}
                {GaitPhaseDetector.generatePhaseMarkers().map((marker, index) => (
                  <ReferenceLine 
                    key={index}
                    x={marker.percent} 
                    stroke={marker.color} 
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    label={{ value: marker.label, position: "top" }}
                  />
                ))}
                
                {/* Tooltip */}
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(1)}°`,
                    name === 'leftHip' ? 'Left Hip' : 'Right Hip'
                  ]}
                  labelFormatter={(label) => `${label}% of Gait Cycle`}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                
                {/* Data lines */}
                <Line 
                  type="monotone" 
                  dataKey="leftHip" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  dot={false}
                  name="Left Hip"
                />
                <Line 
                  type="monotone" 
                  dataKey="rightHip" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={false}
                  name="Right Hip"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Phase labels */}
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {GaitPhaseDetector.STANDARD_PHASES.map((phase, index) => (
              <div key={index} className="flex items-center gap-1 text-xs">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: phase.color }}
                />
                <span className="text-muted-foreground">
                  {phase.abbreviation}: {phase.name}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Info */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Analysis Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Methodology</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Gait cycles detected via Initial Contact (IC) events</li>
                <li>• Each cycle normalized to 0-100% progression</li>
                <li>• Data resampled to 101 points for consistency</li>
                <li>• Averages calculated across all detected cycles</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Quality Metrics</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Cycle duration range: 0.8-1.5 seconds</li>
                <li>• Minimum cycles required: 5 per leg</li>
                <li>• Phase transitions detected automatically</li>
                <li>• Data quality: {analysisStats.dataQuality}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
