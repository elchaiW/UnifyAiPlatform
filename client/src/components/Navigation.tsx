import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { BarChart3, Home, Settings, Menu } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useState } from "react";

export default function Navigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-700/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-all duration-200">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <div className="ml-3 hidden sm:block">
                <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                  Multi-AI
                </span>
                <div className="text-xs text-muted-foreground -mt-1">Intelligent Platform</div>
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              <Link href="/" className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                location === "/" 
                  ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 shadow-sm" 
                  : "text-muted-foreground hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}>
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link href="/analytics" className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                location === "/analytics" 
                  ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 shadow-sm" 
                  : "text-muted-foreground hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}>
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </Link>
            </div>
          </div>
          
          {/* Right side - Theme toggle and mobile menu */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            
            {/* Desktop buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg text-white">
                Get Started
              </Button>
              <div className="w-8 h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-full flex items-center justify-center">
                <Settings className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </div>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-3">
            <div className="space-y-2">
              <Link 
                href="/" 
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location === "/" 
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" 
                    : "text-muted-foreground hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link 
                href="/analytics" 
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location === "/analytics" 
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" 
                    : "text-muted-foreground hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </Link>
              <div className="px-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg text-white">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
