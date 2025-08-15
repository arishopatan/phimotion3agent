"use client";

import { useState, useEffect } from "react";
import { Palette, Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Theme = "slate" | "light" | "blue" | "purple";

const themes: { name: Theme; label: string; icon: React.ReactNode; gradient: string }[] = [
  {
    name: "slate",
    label: "Slate",
    icon: <Monitor className="h-4 w-4" />,
    gradient: "from-slate-500 to-slate-700"
  },
  {
    name: "light",
    label: "Light",
    icon: <Sun className="h-4 w-4" />,
    gradient: "from-gray-300 to-gray-500"
  },
  {
    name: "blue",
    label: "Blue",
    icon: <Palette className="h-4 w-4" />,
    gradient: "from-blue-500 to-blue-700"
  },
  {
    name: "purple",
    label: "Purple",
    icon: <Palette className="h-4 w-4" />,
    gradient: "from-purple-500 to-purple-700"
  }
];

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<Theme>("slate");

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme && themes.some(t => t.name === savedTheme)) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove("theme-slate", "theme-light", "theme-blue", "theme-purple");
    
    // Add new theme class
    root.classList.add(`theme-${theme}`);
    
    // Update CSS variables based on theme
    switch (theme) {
      case "slate":
        root.style.setProperty("--primary", "hsl(215, 25%, 27%)");
        root.style.setProperty("--primary-foreground", "hsl(210, 40%, 98%)");
        break;
      case "light":
        root.style.setProperty("--primary", "hsl(222.2, 84%, 4.9%)");
        root.style.setProperty("--primary-foreground", "hsl(210, 40%, 98%)");
        break;
      case "blue":
        root.style.setProperty("--primary", "hsl(221.2, 83.2%, 53.3%)");
        root.style.setProperty("--primary-foreground", "hsl(210, 40%, 98%)");
        break;
      case "purple":
        root.style.setProperty("--primary", "hsl(262.1, 83.3%, 57.8%)");
        root.style.setProperty("--primary-foreground", "hsl(210, 40%, 98%)");
        break;
    }
  };

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    applyTheme(theme);
    localStorage.setItem("theme", theme);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Theme Customization
        </CardTitle>
        <CardDescription>
          Choose your preferred color theme for the dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {themes.map((theme) => (
            <Button
              key={theme.name}
              variant={currentTheme === theme.name ? "default" : "outline"}
              className={`h-auto p-4 flex flex-col items-center gap-2 transition-all ${
                currentTheme === theme.name 
                  ? "ring-2 ring-primary ring-offset-2" 
                  : "hover:scale-105"
              }`}
              onClick={() => handleThemeChange(theme.name)}
            >
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-white`}>
                {theme.icon}
              </div>
              <span className="text-sm font-medium">{theme.label}</span>
              {currentTheme === theme.name && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </Button>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            Current theme: <span className="font-medium capitalize">{currentTheme}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Your theme preference will be saved for future visits.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
