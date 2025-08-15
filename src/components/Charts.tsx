"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { Activity, TrendingUp, Target } from "lucide-react";

// Sample data for demonstration
const jointAngleData = [
  { time: "0s", knee: 45, hip: 30, ankle: 15 },
  { time: "1s", knee: 60, hip: 45, ankle: 25 },
  { time: "2s", knee: 75, hip: 60, ankle: 35 },
  { time: "3s", knee: 90, hip: 75, ankle: 45 },
  { time: "4s", knee: 85, hip: 70, ankle: 40 },
  { time: "5s", knee: 70, hip: 55, ankle: 30 },
  { time: "6s", knee: 55, hip: 40, ankle: 20 },
  { time: "7s", knee: 40, hip: 25, ankle: 10 },
];

const symmetryData = [
  { joint: "Knee", left: 85, right: 82, difference: 3 },
  { joint: "Hip", left: 78, right: 75, difference: 3 },
  { joint: "Ankle", left: 92, right: 89, difference: 3 },
  { joint: "Shoulder", left: 88, right: 85, difference: 3 },
];

const movementQualityData = [
  { name: "Excellent", value: 35, color: "#10b981" },
  { name: "Good", value: 45, color: "#3b82f6" },
  { name: "Fair", value: 15, color: "#f59e0b" },
  { name: "Poor", value: 5, color: "#ef4444" },
];

export function Charts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Joint Angles Over Time */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Joint Angles Over Time
          </CardTitle>
          <CardDescription>
            Real-time tracking of joint angles during movement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={jointAngleData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="time" 
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Line 
                type="monotone" 
                dataKey="knee" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Knee"
              />
              <Line 
                type="monotone" 
                dataKey="hip" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Hip"
              />
              <Line 
                type="monotone" 
                dataKey="ankle" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="Ankle"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Symmetry Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Symmetry Analysis
          </CardTitle>
          <CardDescription>
            Comparison of left vs right joint performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={symmetryData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="joint" 
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="left" fill="#3b82f6" name="Left" />
              <Bar dataKey="right" fill="#10b981" name="Right" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Movement Quality Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Movement Quality
          </CardTitle>
          <CardDescription>
            Distribution of movement quality scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={movementQualityData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {movementQualityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-4">
            {movementQualityData.map((item, index) => (
              <div key={index} className="flex items-center gap-1 text-xs">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted-foreground">{item.name}: {item.value}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
