"use client";


import { VideoUpload } from "@/components/VideoUpload";
import { AnalysisStatus } from "@/components/AnalysisStatus";
import { Charts } from "@/components/Charts";
import { AnalysisResults } from "@/components/AnalysisResults";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useAnalysis } from "@/hooks/useAnalysis";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Users, Target, TrendingUp } from "lucide-react";



export default function Dashboard() {
  const {
    status: analysisStatus,
    progress,
    error,
    analysisData,
    startAnalysis
  } = useAnalysis();

  const handleVideoSelect = (file: File) => {
    startAnalysis(file);
  };

  const metrics = [
    {
      title: "Total Analyses",
      value: "1,247",
      change: "+12.5%",
      icon: Activity,
      description: "From last month"
    },
    {
      title: "Active Users",
      value: "89",
      change: "+5.2%",
      icon: Users,
      description: "Currently online"
    },
    {
      title: "Accuracy Rate",
      value: "94.2%",
      change: "+2.1%",
      icon: Target,
      description: "Motion detection"
    },
    {
      title: "Processing Time",
      value: "2.3s",
      change: "-15.3%",
      icon: TrendingUp,
      description: "Average per video"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                PhiMotion3Agent
              </h1>
              <p className="text-sm text-muted-foreground">
                Professional Motion Analysis Dashboard
              </p>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
              Live
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <Card key={index} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {metric.title}
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {metric.value}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {metric.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <metric.icon className="h-8 w-8 text-slate-600 dark:text-slate-400" />
                    <span className={`text-xs font-medium ${
                      metric.change.startsWith('+') 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload and Status */}
          <div className="lg:col-span-1 space-y-6">
            <VideoUpload onVideoSelect={handleVideoSelect} />
            <AnalysisStatus status={analysisStatus} progress={progress} error={error} />
            <ThemeSwitcher />
          </div>

          {/* Right Column - Charts and Results */}
          <div className="lg:col-span-2 space-y-6">
            {analysisStatus === "completed" && analysisData ? (
              <>
                <Charts data={analysisData} />
                <AnalysisResults 
                  data={analysisData}
                  onExport={() => console.log('Export functionality')}
                  onShare={() => console.log('Share functionality')}
                />
              </>
            ) : (
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Analysis Results
                  </CardTitle>
                  <CardDescription>
                    Upload a video to see detailed motion analysis results
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Activity className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                      {analysisStatus === "idle" 
                        ? "No analysis data available" 
                        : "Analysis in progress..."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              PhiMotion3Agent - Advanced Motion Analysis Platform
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Built with Next.js, TypeScript, and Tailwind CSS
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
