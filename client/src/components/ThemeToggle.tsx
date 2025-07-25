import { Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme.js";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-7 w-12 lg:h-9 lg:w-16 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      aria-label="Toggle theme"
    >
      <div
        className={`absolute inset-0.5 h-6 w-6 lg:h-8 lg:w-8 rounded-full bg-white dark:bg-gray-800 shadow-md transition-transform duration-200 ${
          theme === 'dark' ? 'translate-x-4 lg:translate-x-6' : 'translate-x-0'
        }`}
      />
      <div className="relative flex w-full items-center justify-between px-1 lg:px-2">
        <Sun className={`h-3 w-3 lg:h-4 lg:w-4 ${theme === 'light' ? 'text-yellow-500' : 'text-gray-400'} transition-colors`} />
        <Moon className={`h-3 w-3 lg:h-4 lg:w-4 ${theme === 'dark' ? 'text-blue-400' : 'text-gray-400'} transition-colors`} />
      </div>
    </button>
  );
}