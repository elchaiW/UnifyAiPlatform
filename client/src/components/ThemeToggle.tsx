import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-6 w-11 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-200 focus:outline-none"
      aria-label="Toggle theme"
    >
      <div
        className={`absolute inset-0.5 h-5 w-5 rounded-full bg-white dark:bg-gray-800 shadow-sm transition-transform duration-200 ${
          theme === 'dark' ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
      <div className="relative flex w-full items-center justify-between px-1">
        <Sun className={`h-3 w-3 ${theme === 'light' ? 'text-yellow-500' : 'text-gray-400'} transition-colors`} />
        <Moon className={`h-3 w-3 ${theme === 'dark' ? 'text-blue-400' : 'text-gray-400'} transition-colors`} />
      </div>
    </button>
  );
}