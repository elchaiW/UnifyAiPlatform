import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { BarChart3, Home, Settings } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export default function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <div className="w-10 h-10 bg-gradient-to-br from-secondary via-secondary to-accent rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-all duration-200">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <div className="ml-3">
                <span className="text-xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                  Unify AI
                </span>
                <div className="text-xs text-muted-foreground -mt-1">Multi-AI Platform</div>
              </div>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              <Link href="/" className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                location === "/" 
                  ? "bg-secondary/10 text-secondary shadow-sm" 
                  : "text-muted-foreground hover:text-primary hover:bg-gray-50"
              }`}>
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link href="/analytics" className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                location === "/analytics" 
                  ? "bg-secondary/10 text-secondary shadow-sm" 
                  : "text-muted-foreground hover:text-primary hover:bg-gray-50"
              }`}>
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg text-white">
              Get Started
            </Button>
            <div className="w-8 h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-full flex items-center justify-center">
              <Settings className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
