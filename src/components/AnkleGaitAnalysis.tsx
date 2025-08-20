"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Download, Info, Play, RefreshCw, Target, Zap, FileText } from "lucide-react";
import { AnkleGraphGenerator, AnkleAnalysisResult, AnkleDataPoint } from "@/services/gait/ankleGraphGenerator";
import { GaitMode, getAvailableGaitModes } from "@/config/gaitModePresets";

interface AnkleGaitAnalysisProps {
  onExportPNG?: () => void;
}

interface ChartDataPoint {
  gaitCyclePercent: number;
  ankleLeft: number;
  ankleRight: number;
  phase: string;
}

export function AnkleGaitAnalysis({ onExportPNG }: AnkleGaitAnalysisProps) {
  const [selectedMode, setSelectedMode] = useState<GaitMode>('walk');
  const [analysisResult, setAnalysisResult] = useState<AnkleAnalysisResult | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [csvData, setCsvData] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const performAnkleAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate ankle data for selected mode
      const generator = new AnkleGraphGenerator(selectedMode);
      const dataPoints = generator.generateAnkleData(10);
      
      // Analyze the data
      const result = generator.analyzeAnkleData(dataPoints);
      setAnalysisResult(result);
      
      // Generate CSV data
      const csv = generator.generateCSVData(dataPoints);
      setCsvData(csv);
      
      // Prepare chart data for single clean cycle (use all points for smooth curve)
      const chartPoints: ChartDataPoint[] = dataPoints.map(point => ({
        gaitCyclePercent: point.gaitCyclePercent,
        ankleLeft: point.ankleLeft,
        ankleRight: point.ankleRight,
        phase: point.phase
      }));
      setChartData(chartPoints);
      
    } catch (error) {
      console.error('Ankle analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportCSV = () => {
    if (csvData) {
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ankle_gait_analysis_${selectedMode}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  };

  const exportAsPNG = async () => {
    if (chartRef.current && onExportPNG) {
      onExportPNG();
    }
  };

  useEffect(() => {
    performAnkleAnalysis();
  }, [selectedMode]);

  const gaitModes = getAvailableGaitModes();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Ankle Joint Gait Analysis
              </CardTitle>
              <CardDescription>
                Professional dorsiflexion/plantarflexion analysis with ROM calculation
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedMode} onValueChange={(value: GaitMode) => setSelectedMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {gaitModes.map(mode => (
                    <SelectItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={performAnkleAnalysis} 
                disabled={isAnalyzing}
                variant="outline"
                size="sm"
              >
                {isAnalyzing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Re-analyze
              </Button>
              <Button onClick={exportCSV} disabled={csvData.length === 0} variant="outline" size="sm">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button onClick={exportAsPNG} variant="outline" size="sm">
                <FileText className="h-4 w-4" />
                Export PNG
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* ROM Analysis Summary */}
          {analysisResult && (
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Left ROM</h4>
                  <div className="text-2xl font-bold text-blue-600">{analysisResult.romAnalysis.left.totalROM}°</div>
                  <div className="text-xs text-muted-foreground">
                    DF: {analysisResult.romAnalysis.left.maxDorsiflexion}° | PF: {analysisResult.romAnalysis.left.maxPlantarflexion}°
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Right ROM</h4>
                  <div className="text-2xl font-bold text-red-600">{analysisResult.romAnalysis.right.totalROM}°</div>
                  <div className="text-xs text-muted-foreground">
                    DF: {analysisResult.romAnalysis.right.maxDorsiflexion}° | PF: {analysisResult.romAnalysis.right.maxPlantarflexion}°
                  </div>
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
                      analysisResult.romAnalysis.asymmetry >= 10 ? 'text-red-600' : 
                      analysisResult.romAnalysis.asymmetry >= 5 ? 'text-yellow-600' : 'text-green-600'
                    }`}
                  >
                    {analysisResult.romAnalysis.asymmetry >= 10 ? 'High Asymmetry' : 
                     analysisResult.romAnalysis.asymmetry >= 5 ? 'Moderate Asymmetry' : 'Low Asymmetry'}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Average ROM</h4>
                  <div className="text-2xl font-bold text-green-600">{analysisResult.romAnalysis.averageROM}°</div>
                  <div className="text-xs text-muted-foreground">
                    Bilateral average
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-sm">Ankle ROM Analysis Summary</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {analysisResult.qualityMetrics.dataQuality}
                  </Badge>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>Anatomical Zero: Left {analysisResult.romAnalysis.left.anatomicalZero}° | Right {analysisResult.romAnalysis.right.anatomicalZero}°</p>
                  <p>Confidence: {Math.round(analysisResult.qualityMetrics.confidence * 100)}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Main Chart */}
          <div ref={chartRef} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Ankle Joint Angles – {selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)} Gait</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Left</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Right</span>
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={500}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="gaitCyclePercent" 
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Gait Cycle (%)', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  domain={[-50, 20]}
                  tick={{ fontSize: 12 }}
                  label={{ 
                    value: 'Dorsiflexion (+) / Plantarflexion (−)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' }
                  }}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value}°`, 
                    name === 'ankleLeft' ? 'Left Ankle' : 'Right Ankle'
                  ]}
                  labelFormatter={(label) => `${label}% of Gait Cycle`}
                />
                
                {/* Anatomical Zero Reference Line */}
                <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />
                
                {/* Gait Phase Markers */}
                <ReferenceLine x={2} stroke="#3b82f6" strokeDasharray="3 3" />
                <ReferenceLine x={12} stroke="#3b82f6" strokeDasharray="3 3" />
                <ReferenceLine x={31} stroke="#3b82f6" strokeDasharray="3 3" />
                <ReferenceLine x={50} stroke="#3b82f6" strokeDasharray="3 3" />
                <ReferenceLine x={62} stroke="#3b82f6" strokeDasharray="3 3" />
                <ReferenceLine x={73} stroke="#3b82f6" strokeDasharray="3 3" />
                <ReferenceLine x={87} stroke="#3b82f6" strokeDasharray="3 3" />
                
                <Line 
                  type="monotone" 
                  dataKey="ankleLeft" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, stroke: '#ef4444', strokeWidth: 2, fill: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="ankleRight" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Gait Phase Labels */}
            <div className="flex justify-between text-xs text-muted-foreground px-4">
              <span>IC</span>
              <span>LR</span>
              <span>MSt</span>
              <span>TSt</span>
              <span>PSw</span>
              <span>ISw</span>
              <span>MSw</span>
              <span>TSw</span>
            </div>
          </div>

          {/* Analysis Details */}
          {analysisResult && (
            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium">Analysis Details</h4>
              </div>
              <div className="text-sm text-muted-foreground">
                <ul className="space-y-1">
                  <li>• Mode: {selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)}</li>
                  <li>• Data points: {chartData.length}</li>
                  <li>• Confidence: {analysisResult?.qualityMetrics.confidence ? Math.round(analysisResult.qualityMetrics.confidence * 100) : 'Calculating'}%</li>
                  <li>• Data quality: {analysisResult?.qualityMetrics.dataQuality || 'Analyzing'}</li>
                  <li>• Asymmetry: {analysisResult?.romAnalysis.asymmetry || 'Calculating'}°</li>
                  <li>• Recommendations: {analysisResult?.qualityMetrics.recommendations.length || 0} provided</li>
                </ul>
              </div>
              
              {analysisResult.qualityMetrics.recommendations.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-medium text-sm mb-2">Recommendations:</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {analysisResult.qualityMetrics.recommendations.map((rec, index) => (
                      <li key={index}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
