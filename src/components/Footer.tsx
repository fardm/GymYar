import React from 'react';
import { Github } from 'lucide-react';

export function Footer() {
  return (
    <footer dir="ltr" className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © 2025 GymYar.
          </p>
          <a
            href="https://github.com/fardm"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Github className="h-5 w-5" />
            <span></span>
          </a>
        </div>
      </div>
    </footer>
  );
}