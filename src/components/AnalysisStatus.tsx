"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Clock, AlertCircle, Play } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type AnalysisStatus = "idle" | "uploading" | "processing" | "analyzing" | "completed" | "error";

interface AnalysisStatusProps {
  status: AnalysisStatus;
  progress?: number;
  error?: string;
}

export function AnalysisStatus({ status, progress = 0, error }: AnalysisStatusProps) {
  const [currentProgress, setCurrentProgress] = useState(0);

  useEffect(() => {
    if (status === "processing" || status === "analyzing") {
      const interval = setInterval(() => {
        setCurrentProgress(prev => {
          if (prev >= 95) return prev;
          return prev + Math.random() * 5;
        });
      }, 500);

      return () => clearInterval(interval);
    } else if (status === "completed") {
      setCurrentProgress(100);
    } else {
      setCurrentProgress(0);
    }
  }, [status]);

  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "processing":
      case "analyzing":
        return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Play className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "processing":
      case "analyzing":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "error":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "idle":
        return "Ready for Analysis";
      case "uploading":
        return "Uploading Video";
      case "processing":
        return "Processing Video";
      case "analyzing":
        return "Analyzing Motion";
      case "completed":
        return "Analysis Complete";
      case "error":
        return "Analysis Failed";
      default:
        return "Unknown Status";
    }
  };

  const getStatusDescription = () => {
    switch (status) {
      case "idle":
        return "Upload a video to begin motion analysis";
      case "uploading":
        return "Please wait while your video is being uploaded";
      case "processing":
        return "Extracting frames and preparing for analysis";
      case "analyzing":
        return "Analyzing joint angles and movement patterns";
      case "completed":
        return "Motion analysis has been completed successfully";
      case "error":
        return error || "An error occurred during analysis";
      default:
        return "";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Analysis Status
        </CardTitle>
        <CardDescription>
          Track the progress of your motion analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={getStatusColor()}>
            {getStatusText()}
          </Badge>
          {status === "processing" || status === "analyzing" ? (
            <span className="text-sm text-muted-foreground">
              {Math.round(currentProgress)}%
            </span>
          ) : null}
        </div>

        {(status === "processing" || status === "analyzing") && (
          <div className="space-y-2">
            <Progress value={currentProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {getStatusDescription()}
            </p>
          </div>
        )}

        {status === "completed" && (
          <div className="space-y-2">
            <Progress value={100} className="h-2" />
            <p className="text-sm text-green-600 font-medium">
              ✓ {getStatusDescription()}
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">
              {getStatusDescription()}
            </p>
          </div>
        )}

        {status === "idle" && (
          <p className="text-sm text-muted-foreground">
            {getStatusDescription()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
