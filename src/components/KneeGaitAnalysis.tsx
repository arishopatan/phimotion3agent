"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Download, BarChart3, Info, Play, RefreshCw, Target, Zap } from "lucide-react";
import { KneeGraphGenerator, KneeAnalysisResult, KneeDataPoint } from "@/services/gait/kneeGraphGenerator";
import { GaitMode, getAvailableGaitModes } from "@/config/gaitModePresets";

interface KneeGaitAnalysisProps {
  onExportPNG?: (canvas: HTMLCanvasElement) => void;
}

interface ChartDataPoint {
  gaitCyclePercent: number;
  kneeLeft: number;
  kneeRight: number;
  phase?: string;
}

export function KneeGaitAnalysis({ onExportPNG }: KneeGaitAnalysisProps) {
  const [selectedMode, setSelectedMode] = useState<GaitMode>('walk');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [kneeData, setKneeData] = useState<KneeDataPoint[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [analysisResult, setAnalysisResult] = useState<KneeAnalysisResult | null>(null);
  const [csvData, setCsvData] = useState<string>('');
  
  const chartRef = useRef<HTMLDivElement>(null);
  const generator = new KneeGraphGenerator(selectedMode);

  /**
   * Perform knee gait analysis
   */
  const performKneeAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate knee data for selected mode
      const dataPoints = generator.generateKneeData(10);
      setKneeData(dataPoints);
      
      // Analyze the data
      const result = generator.analyzeKneeData(dataPoints);
      setAnalysisResult(result);
      
      // Generate CSV data
      const csv = generator.generateCSVData(dataPoints);
      setCsvData(csv);
      
      // Prepare chart data (sample every 5th point for smooth visualization)
      const chartPoints: ChartDataPoint[] = [];
      for (let i = 0; i < dataPoints.length; i += 5) {
        const point = dataPoints[i];
        chartPoints.push({
          gaitCyclePercent: point.gaitCyclePercent,
          kneeLeft: point.kneeLeft,
          kneeRight: point.kneeRight,
          phase: point.phase
        });
      }
      setChartData(chartPoints);
      
    } catch (error) {
      console.error('Knee analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Export CSV data
   */
  const exportCSV = () => {
    if (!csvData) return;
    
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `knee-gait-analysis-${selectedMode}.csv`;
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
      ctx.fillText(`Knee Joint Angles - ${selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)} Gait`, 50, 50);
      
      // Subtitle
      ctx.font = '16px system-ui';
      ctx.fillStyle = '#64748b';
      ctx.fillText(`Range: -20° to +80° | Anatomical Zero: 0°`, 50, 80);
      
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
      const phaseBoundaries = analysisResult?.graphData.config.phaseBoundaries;
      if (phaseBoundaries) {
        Object.entries(phaseBoundaries).forEach(([phase, percent]) => {
          if (percent > 0) { // Skip IC at 0%
            const x = chartX + (percent / 100) * chartWidth;
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(x, chartY);
            ctx.lineTo(x, chartY + chartHeight);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Phase label
            ctx.fillStyle = '#3b82f6';
            ctx.font = '12px system-ui';
            ctx.fillText(phase, x + 3, chartY + 15);
          }
        });
      }
      
      // Draw zero line (anatomical neutral)
      const zeroY = chartY + chartHeight / 2;
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(chartX, zeroY);
      ctx.lineTo(chartX + chartWidth, zeroY);
      ctx.stroke();
      
      // Draw data lines
      if (chartData.length > 0) {
        // Left knee (red)
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        chartData.forEach((point, index) => {
          const x = chartX + (point.gaitCyclePercent / 100) * chartWidth;
          const y = zeroY - (point.kneeLeft / 50) * (chartHeight / 2); // Scale: -20° to +80°
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
        
        // Right knee (blue)
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        chartData.forEach((point, index) => {
          const x = chartX + (point.gaitCyclePercent / 100) * chartWidth;
          const y = zeroY - (point.kneeRight / 50) * (chartHeight / 2);
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
      for (let i = 0; i <= 10; i++) {
        const y = chartY + (i * chartHeight / 10);
        const angle = 80 - (i * 10); // +80° to -20°
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
      ctx.fillText('Knee Flexion (+) / Extension (−)', -80, 0);
      ctx.restore();
      
      // Legend
      const legendY = chartY + chartHeight + 80;
      
      // Left leg
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(chartX, legendY, 20, 10);
      ctx.fillStyle = '#1e293b';
      ctx.font = '14px system-ui';
      ctx.fillText('Left Knee', chartX + 30, legendY + 8);
      
      // Right leg
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(chartX + 120, legendY, 20, 10);
      ctx.fillStyle = '#1e293b';
      ctx.fillText('Right Knee', chartX + 150, legendY + 8);
      
      if (onExportPNG) {
        onExportPNG(canvas);
      } else {
        // Download automatically
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `knee-gait-analysis-${selectedMode}.png`;
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
    performKneeAnalysis();
  }, [selectedMode]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-green-600" />
                Knee Joint Gait Analysis
              </CardTitle>
              <CardDescription>
                Professional knee angle analysis with gait mode selection
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={selectedMode} onValueChange={(value: GaitMode) => setSelectedMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableGaitModes().map(mode => (
                    <SelectItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={performKneeAnalysis}
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
                disabled={!csvData}
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

      {/* ROM Analysis Summary */}
      {analysisResult && (
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Knee Range of Motion (ROM) Analysis
            </CardTitle>
            <CardDescription>
              Knee joint range of motion for {selectedMode} gait mode
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Left Knee ROM</h4>
                <div className="text-2xl font-bold text-red-600">{analysisResult.romAnalysis.left.totalROM}°</div>
                <div className="text-xs text-muted-foreground">
                  Flex: {analysisResult.romAnalysis.left.maxFlexion}° | Ext: {analysisResult.romAnalysis.left.maxExtension}°
                </div>
                <Badge variant="outline" className="text-xs">
                  Anatomical Zero: {analysisResult.romAnalysis.left.anatomicalZero}°
                </Badge>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Right Knee ROM</h4>
                <div className="text-2xl font-bold text-blue-600">{analysisResult.romAnalysis.right.totalROM}°</div>
                <div className="text-xs text-muted-foreground">
                  Flex: {analysisResult.romAnalysis.right.maxFlexion}° | Ext: {analysisResult.romAnalysis.right.maxExtension}°
                </div>
                <Badge variant="outline" className="text-xs">
                  Anatomical Zero: {analysisResult.romAnalysis.right.anatomicalZero}°
                </Badge>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Average ROM</h4>
                <div className="text-2xl font-bold text-green-600">{analysisResult.romAnalysis.averageROM}°</div>
                <div className="text-xs text-muted-foreground">
                  Bilateral average
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    analysisResult.romAnalysis.averageROM < 30 ? 'text-red-600' : 
                    analysisResult.romAnalysis.averageROM > 60 ? 'text-yellow-600' : 'text-green-600'
                  }`}
                >
                  {analysisResult.romAnalysis.averageROM < 30 ? 'Low ROM' : 
                   analysisResult.romAnalysis.averageROM > 60 ? 'High ROM' : 'Normal ROM'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Asymmetry</h4>
                <div className="text-2xl font-bold text-purple-600">{analysisResult.romAnalysis.asymmetry}°</div>
                <div className="text-xs text-muted-foreground">
                  Left vs Right difference
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    analysisResult.romAnalysis.asymmetry > 10 ? 'text-red-600' : 
                    analysisResult.romAnalysis.asymmetry > 5 ? 'text-yellow-600' : 'text-green-600'
                  }`}
                >
                  {analysisResult.romAnalysis.asymmetry > 10 ? 'High Asymmetry' : 
                   analysisResult.romAnalysis.asymmetry > 5 ? 'Moderate Asymmetry' : 'Low Asymmetry'}
                </Badge>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-sm">Data Quality</h5>
                  <p className="text-xs text-muted-foreground">
                    Confidence: {Math.round(analysisResult.qualityMetrics.confidence * 100)}%
                  </p>
                </div>
                <Badge 
                  variant="outline" 
                  className={`${
                    analysisResult.qualityMetrics.dataQuality === 'excellent' ? 'bg-green-50 text-green-700 border-green-200' :
                    analysisResult.qualityMetrics.dataQuality === 'good' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    analysisResult.qualityMetrics.dataQuality === 'fair' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                    'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  {analysisResult.qualityMetrics.dataQuality.charAt(0).toUpperCase() + analysisResult.qualityMetrics.dataQuality.slice(1)} Quality
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
              <CardTitle className="text-lg">Knee Joint Angles - {selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)} Gait</CardTitle>
              <CardDescription>
                Flexion (+) / Extension (−) • Range: -20° to +80° • Anatomical Zero: 0°
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {analysisResult?.qualityMetrics.dataQuality || 'Analyzing'} Quality
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
                  dataKey="gaitCyclePercent"
                  type="number"
                  scale="linear"
                  domain={[0, 100]}
                  ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                  tickFormatter={(value) => `${value}%`}
                  className="text-sm"
                />
                
                {/* Y-axis */}
                <YAxis 
                  domain={[-20, 80]}
                  ticks={[-20, -10, 0, 10, 20, 30, 40, 50, 60, 70, 80]}
                  tickFormatter={(value) => `${value}°`}
                  className="text-sm"
                />
                
                {/* Zero line (anatomical neutral) */}
                <ReferenceLine y={0} stroke="#374151" strokeWidth={1} />
                
                {/* Phase markers */}
                {analysisResult?.graphData.config.phaseBoundaries && 
                  Object.entries(analysisResult.graphData.config.phaseBoundaries).map(([phase, percent], index) => (
                    <ReferenceLine 
                      key={index}
                      x={percent} 
                      stroke="#3b82f6" 
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      label={{ value: phase, position: "top" }}
                    />
                  ))
                }
                
                {/* Tooltip */}
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(1)}°`,
                    name === 'kneeLeft' ? 'Left Knee' : 'Right Knee'
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
                  dataKey="kneeLeft" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  dot={false}
                  name="Left Knee"
                />
                <Line 
                  type="monotone" 
                  dataKey="kneeRight" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={false}
                  name="Right Knee"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Phase labels */}
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {analysisResult?.graphData.config.phaseBoundaries && 
              Object.entries(analysisResult.graphData.config.phaseBoundaries).map(([phase, percent], index) => (
                <div key={index} className="flex items-center gap-1 text-xs">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-muted-foreground">
                    {phase}: {phase === 'IC' ? 'Initial Contact' : 
                              phase === 'LR' ? 'Loading Response' :
                              phase === 'MSt' ? 'Mid Stance' :
                              phase === 'TSt' ? 'Terminal Stance' :
                              phase === 'PSw' ? 'Pre-Swing' :
                              phase === 'ISw' ? 'Initial Swing' :
                              phase === 'MSw' ? 'Mid Swing' : 'Terminal Swing'}
                  </span>
                </div>
              ))
            }
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
              <h4 className="font-medium mb-2">Gait Mode: {selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)}</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Y-axis range: -20° to +80°</li>
                <li>• Anatomical zero: 0° (neutral reference)</li>
                <li>• 8 gait phases with proper boundaries</li>
                <li>• Professional ROM calculation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Quality Metrics</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Confidence: {analysisResult?.qualityMetrics.confidence ? Math.round(analysisResult.qualityMetrics.confidence * 100) : 'Calculating'}%</li>
                <li>• Data quality: {analysisResult?.qualityMetrics.dataQuality || 'Analyzing'}</li>
                <li>• Asymmetry: {analysisResult?.romAnalysis.asymmetry || 'Calculating'}°</li>
                <li>• Recommendations: {analysisResult?.qualityMetrics.recommendations.length || 0} provided</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
