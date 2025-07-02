// tamrin/src/components/UserMenu.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Download, Upload, Trash2, HelpCircle, Bot, ClipboardList } from 'lucide-react';
import { exportUserData, clearUserData, saveUserData } from '../utils/storage';
import { UserData } from '../types';
import { AIGenWorkoutModal } from './AIGenWorkoutModal';
import { ImportProgramModal } from './ImportProgramModal';
import { ExportProgramModal } from './ExportProgramModal';

interface UserMenuProps {
  onUpdateUserData: (data: UserData) => void;
  userData: UserData; // Pass userData to UserMenu
}

export function UserMenu({ onUpdateUserData, userData }: UserMenuProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showExportProgramModal, setShowExportProgramModal] = useState(false);
  const [showImportProgramModal, setShowImportProgramModal] = useState(false);
  const [showAIGenWorkoutModal, setShowAIGenWorkoutModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'delete' | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const helpModalRef = useRef<HTMLDivElement>(null);
  const clearModalRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close the user menu and its modals
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (helpModalRef.current && !helpModalRef.current.contains(event.target as Node)) {
        setShowHelpModal(false);
      }
      if (clearModalRef.current && !clearModalRef.current.contains(event.target as Node)) {
        setShowClearConfirm(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowUserMenu(false);
        setShowHelpModal(false);
        setShowClearConfirm(false);
        setShowAIGenWorkoutModal(false);
        setShowImportProgramModal(false);
        setShowExportProgramModal(false);
      }
    };

    if (showUserMenu || showHelpModal || showExportProgramModal || showImportProgramModal || showClearConfirm || showAIGenWorkoutModal) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showUserMenu, showHelpModal, showExportProgramModal, showImportProgramModal, showClearConfirm, showAIGenWorkoutModal]);

  // Toast message effect
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
        setToastType(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (message: string, type: 'success' | 'delete') => {
    setToastMessage(message);
    setToastType(type);
  };

  const handleClearData = () => {
    clearUserData();
    onUpdateUserData({ sessions: [] });
    setShowClearConfirm(false);
    setShowUserMenu(false);
    showToast('تمام داده‌ها پاک شدند', 'delete');
  };

  const handleOpenAIGenWorkoutModal = () => {
    setShowAIGenWorkoutModal(true);
    setShowUserMenu(false);
  };

  const handleOpenImportProgramModal = () => {
    setShowImportProgramModal(true);
    setShowUserMenu(false);
  };

  const handleOpenExportProgramModal = () => {
    setShowExportProgramModal(true);
    setShowUserMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowUserMenu(!showUserMenu)}
        className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
        aria-label="منوی کاربر"
      >
        <Menu className="h-5 w-5" />
      </button>

      {showUserMenu && (
        <div
          ref={menuRef}
          className="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10" // Changed right-0 to left-0
        >
          {/* New "My Workouts" link - First option */}
          <Link
            to="/my-workouts"
            onClick={() => setShowUserMenu(false)} // Close menu on click
            className="w-full px-4 py-2 text-right text-base font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 space-x-reverse border-b border-gray-200 dark:border-gray-700" // Lighter text color
          >
            <ClipboardList className="h-5 w-5" />
            <span>برنامه‌من</span>
          </Link>

          <button
            onClick={handleOpenExportProgramModal}
            className="w-full px-4 py-2 text-right text-base font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 space-x-reverse border-b border-gray-200 dark:border-gray-700" // Lighter text color
          >
            <Download className="h-5 w-5" />
            <span>دانلود برنامه</span>
          </button>
          <button
            onClick={handleOpenImportProgramModal}
            className="w-full px-4 py-2 text-right text-base font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 space-x-reverse border-b border-gray-200 dark:border-gray-700" // Lighter text color
          >
            <Upload className="h-5 w-5" />
            <span>وارد کردن برنامه</span>
          </button>
          <button
            onClick={handleOpenAIGenWorkoutModal}
            className="w-full px-4 py-2 text-right text-base font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 space-x-reverse border-b border-gray-200 dark:border-gray-700" // Lighter text color
          >
            <Bot className="h-5 w-5" />
            <span>ایجاد برنامه با AI</span>
          </button>
          <button
            onClick={() => { setShowClearConfirm(true); setShowUserMenu(false); }}
            className="w-full px-4 py-2 text-right text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-3 space-x-reverse border-b border-gray-200 dark:border-gray-700" // Lighter text color for red option
          >
            <Trash2 className="h-5 w-5" />
            <span>حذف داده‌ها</span>
          </button>
          <button
            onClick={() => { setShowHelpModal(true); setShowUserMenu(false); }}
            className="w-full px-4 py-2 text-right text-base font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 space-x-reverse" // Lighter text color
          >
            <HelpCircle className="h-5 w-5" />
            <span>راهنما</span>
          </button>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-2 rounded-md shadow-lg animate-fade-in-out ${
            toastType === 'success'
              ? 'bg-green-200 dark:bg-green-300 text-gray-800 dark:text-gray-900'
              : 'bg-red-200 dark:bg-red-300 text-gray-800 dark:text-gray-900'
          }`}
        >
          {toastMessage}
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            ref={helpModalRef}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              راهنما
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-right">
              این سایت یک سایت استاتیک است و امکان ثبت‌نام یا ذخیره‌سازی دائمی اطلاعات شما را ندارد.
              تمام داده‌های شما فقط در مرورگر شما ذخیره می‌شوند و با پاک‌کردن تاریخچه (History) یا کش (Cache)، این اطلاعات نیز از بین می‌روند.
              <br /><br />
              برای نگهداری داده‌ها یا انتقال آن‌ها به مرورگر یا دستگاهی دیگر، لطفاً از گزینه «دانلود برنامه» استفاده کنید.
              با این کار، یک فایل JSON دریافت می‌کنید که می‌توانید آن را از طریق گزینه «وارد کردن برنامه» دوباره بارگذاری کرده و اطلاعات خود را بازیابی کنید.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={clearModalRef}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              حذف تمام داده‌ها
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              آیا مطمئن هستید که می‌خواهید تمام داده‌های خود را حذف کنید؟ این عمل قابل بازگشت نیست.
            </p>
            <div className="flex space-x-3 space-x-reverse">
              <button
                onClick={handleClearData}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
              >
                حذف
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                لغو
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Generated Workout Modal */}
      <AIGenWorkoutModal
        isOpen={showAIGenWorkoutModal}
        onClose={() => setShowAIGenWorkoutModal(false)}
      />

      {/* Import Program Modal */}
      <ImportProgramModal
        isOpen={showImportProgramModal}
        onClose={() => setShowImportProgramModal(false)}
        onUpdateUserData={onUpdateUserData}
        showToast={showToast}
      />

      {/* Export Program Modal */}
      <ExportProgramModal
        isOpen={showExportProgramModal}
        onClose={() => setShowExportProgramModal(false)}
        userData={userData}
        showToast={showToast}
      />
    </div>
  );
}
