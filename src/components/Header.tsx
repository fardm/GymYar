import React, { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dumbbell, User, Moon, Sun, Download, Upload, Trash2 } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { exportUserData, importUserData, clearUserData, saveUserData } from '../utils/storage';

interface HeaderProps {
  onDataChange: () => void;
}

export function Header({ onDataChange }: HeaderProps) {
  const { isDark, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  const handleExport = () => {
    exportUserData();
    setShowUserMenu(false);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
    setShowUserMenu(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const data = await importUserData(file);
        saveUserData(data);
        onDataChange();
        alert('داده‌ها با موفقیت وارد شدند');
      } catch (error) {
        alert('خطا در وارد کردن داده‌ها');
      }
    }
  };

  const handleClearData = () => {
    clearUserData();
    onDataChange();
    setShowClearConfirm(false);
    setShowUserMenu(false);
    alert('تمام داده‌ها پاک شدند');
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center space-x-3 space-x-reverse hover:opacity-80 transition-opacity">
            <Dumbbell className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">GymYar</h1>
          </Link>

          {/* Navigation and Actions */}
          <div className="flex items-center space-x-4 space-x-reverse">
            <Link
              to="/my-workouts"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                location.pathname === '/my-workouts'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              برنامه تمرینی من
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
              aria-label="تغییر تم"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                aria-label="منوی کاربر"
              >
                <User className="h-5 w-5" />
              </button>

              {showUserMenu && (
                <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                  <button
                    onClick={handleExport}
                    className="w-full px-4 py-2 text-right text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 space-x-reverse"
                  >
                    <Download className="h-4 w-4" />
                    <span>خروجی داده‌ها</span>
                  </button>
                  <button
                    onClick={handleImport}
                    className="w-full px-4 py-2 text-right text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 space-x-reverse"
                  >
                    <Upload className="h-4 w-4" />
                    <span>ورودی داده‌ها</span>
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="w-full px-4 py-2 text-right text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2 space-x-reverse"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>حذف داده‌ها</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Clear confirmation modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              حذف تمام داده‌ها
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              آیا مطمئن هستید که می‌خواهید تمام داده‌های خود را حذف کنید؟ این عمل قابل بازگشت نیست.
            </p>
            <div className="flex space-x-3 space-x-reverse">
              <button
                onClick={handleClearData}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                حذف
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                لغو
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}