import { Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme.js";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-5 w-9 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 shrink-0"
      aria-label="Toggle theme"
    >
      <div
        className={`h-3.5 w-3.5 rounded-full bg-white dark:bg-gray-800 shadow-sm transition-transform duration-200 ${
          theme === 'dark' ? 'translate-x-4.5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}