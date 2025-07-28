'use client';

import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Smartphone, 
  Wifi, 
  Download, 
  Zap, 
  Shield, 
  Database,
  Keyboard,
  Bell
} from 'lucide-react';

export default function PWAFeatures() {
  const features = [
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "App-like Experience",
      description: "Install on your device for native app feeling",
      status: "Available"
    },
    {
      icon: <Wifi className="h-6 w-6" />,
      title: "Offline Support", 
      description: "Access your chat history even without internet",
      status: "Active"
    },
    {
      icon: <Download className="h-6 w-6" />,
      title: "Fast Loading",
      description: "Cached resources for instant startup",
      status: "Optimized"
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: "Local Storage",
      description: "All data stored securely on your device",
      status: "Secure"
    },
    {
      icon: <Keyboard className="h-6 w-6" />,
      title: "Keyboard Shortcuts",
      description: "Ctrl+N for new chat, Ctrl+A for analytics",
      status: "Enabled"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Privacy First",
      description: "No server-side data tracking",
      status: "Protected"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
      <div className="md:col-span-2 lg:col-span-3 mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Progressive Web App Features
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          LUMINADOC is optimized as a Progressive Web App for the best user experience
        </p>
      </div>
      
      {features.map((feature, index) => (
        <Card key={index} className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-start space-x-3">
            <div className="text-blue-500 mt-1">
              {feature.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {feature.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}