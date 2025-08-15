"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AnalysisData } from "@/types";
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Target,
  Download,
  Share2,
  FileText
} from "lucide-react";

interface AnalysisResultsProps {
  data: AnalysisData;
  onExport?: () => void;
  onShare?: () => void;
}

export function AnalysisResults({ data, onExport, onShare }: AnalysisResultsProps) {
  const { summary, symmetry, movementQuality } = data;



  const getSymmetryScore = () => {
    const avgDifference = symmetry.reduce((sum, joint) => sum + joint.difference, 0) / symmetry.length;
    return Math.round(100 - avgDifference);
  };

  const getOverallScore = () => {
    const accuracyWeight = 0.4;
    const symmetryWeight = 0.3;
    const qualityWeight = 0.3;
    
    const symmetryScore = getSymmetryScore();
    const qualityScore = movementQuality.excellent + movementQuality.good;
    
    return Math.round(
      summary.accuracy * accuracyWeight + 
      symmetryScore * symmetryWeight + 
      qualityScore * qualityWeight
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Score</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {getOverallScore()}%
                </p>
              </div>
              <Target className="h-8 w-8 text-slate-600 dark:text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Accuracy</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {summary.accuracy.toFixed(1)}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Symmetry</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {getSymmetryScore()}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {summary.processingTime.toFixed(1)}s
                </p>
              </div>
              <Clock className="h-8 w-8 text-slate-600 dark:text-slate-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Symmetry Analysis */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Symmetry Analysis
            </CardTitle>
            <CardDescription>
              Bilateral comparison of joint performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {symmetry.map((joint, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{joint.joint}</span>
                  <Badge 
                    variant={joint.difference <= 5 ? "default" : "destructive"}
                    className={joint.difference <= 5 ? "bg-green-100 text-green-800" : ""}
                  >
                    {joint.difference}% diff
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Left: {joint.left}%</span>
                      <span>Right: {joint.right}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                        style={{ width: `${Math.min(joint.left, joint.right)}%` }}
                      />
                    </div>
                  </div>
                </div>
                {index < symmetry.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recommendations
            </CardTitle>
            <CardDescription>
              Actionable insights for improvement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {summary.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {recommendation}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Export & Share</CardTitle>
          <CardDescription>
            Download your analysis report or share results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export Report
            </button>
            <button
              onClick={onShare}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              Share Results
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <FileText className="h-4 w-4" />
              View Details
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
