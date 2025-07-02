// tamrin/src/components/Header.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dumbbell, Moon, Sun } from 'lucide-react'; // Removed ClipboardList
import { useTheme } from '../hooks/useTheme';
import { UserMenu } from './UserMenu'; // Import UserMenu
import { UserData } from '../types'; // Import UserData type

interface HeaderProps {
  onDataChange: () => void;
  userData: UserData; // Add userData prop
  onUpdateUserData: (data: UserData) => void; // Add onUpdateUserData prop
}

export function Header({ onDataChange, userData, onUpdateUserData }: HeaderProps) {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center space-x-2 space-x-reverse hover:opacity-80 transition-opacity">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="8" fill="#3B82F6"/><path d="M8 12h4v8H8v-8zm12 0h4v8h-4v-8zm-6-4h4v16h-4V8z" fill="white"/></svg>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">تمرین‌ساز</h1>
          </Link>

          {/* Navigation and Actions */}
          <div className="flex items-center space-x-3 space-x-reverse">
            {/* Light/Dark mode toggle - New position */}
            <button
              onClick={toggleTheme}
              className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label={isDark ? 'حالت روشن' : 'حالت تیره'}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* User Menu component */}
            <UserMenu userData={userData} onUpdateUserData={onUpdateUserData} showToast={onDataChange} /> {/* Pass showToast as onDataChange for simplicity */}
          </div>
        </div>
      </div>
    </header>
  );
}
