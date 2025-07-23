import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
      aria-label="Toggle theme"
    >
      <div
        className={`absolute h-5 w-5 rounded-full bg-white dark:bg-gray-200 shadow-lg transition-transform duration-200 ease-in-out ${
          theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
      <div className="relative flex w-full items-center justify-between px-1 pointer-events-none">
        <Sun className={`h-3 w-3 ${theme === 'light' ? 'text-yellow-500' : 'text-gray-400'} transition-colors`} />
        <Moon className={`h-3 w-3 ${theme === 'dark' ? 'text-blue-400' : 'text-gray-400'} transition-colors`} />
      </div>
    </button>
  );
}