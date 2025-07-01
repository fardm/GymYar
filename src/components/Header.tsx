import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dumbbell, User, Moon, Sun, Download, Upload, Trash2, HelpCircle, ClipboardList } from 'lucide-react'; // Import ClipboardList
import { useTheme } from '../hooks/useTheme';
import { exportUserData, importUserData, clearUserData, saveUserData } from '../utils/storage';

interface HeaderProps {
  onDataChange: () => void;
}

export function Header({ onDataChange }: HeaderProps) {
  const { isDark, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'delete' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const helpModalRef = useRef<HTMLDivElement>(null);
  const exportModalRef = useRef<HTMLDivElement>(null);
  const importModalRef = useRef<HTMLDivElement>(null);
  const clearModalRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (helpModalRef.current && !helpModalRef.current.contains(event.target as Node)) {
        setShowHelpModal(false);
      }
      if (exportModalRef.current && !exportModalRef.current.contains(event.target as Node)) {
        setShowExportConfirm(false);
      }
      if (importModalRef.current && !importModalRef.current.contains(event.target as Node)) {
        setShowImportConfirm(false);
        setSelectedFile(null);
      }
      if (clearModalRef.current && !clearModalRef.current.contains(event.target as Node)) {
        setShowClearConfirm(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleExport = () => {
    setShowExportConfirm(true);
    setShowUserMenu(false); // Close user menu
  };

  const confirmExport = () => {
    exportUserData();
    setShowExportConfirm(false);
  };

  const handleImport = () => {
    setShowImportConfirm(true);
    setShowUserMenu(false); // Close user menu
  };

  const confirmImport = async () => {
    if (selectedFile) {
      try {
        const data = await importUserData(selectedFile);
        saveUserData(data);
        onDataChange();
        showToast('داده‌ها با موفقیت وارد شدند', 'success');
      } catch (error) {
        showToast('خطا در وارد کردن داده‌ها', 'delete');
      }
      setShowImportConfirm(false);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleClearData = () => {
    clearUserData();
    onDataChange();
    setShowClearConfirm(false);
    setShowUserMenu(false); // Close user menu
    showToast('تمام داده‌ها پاک شدند', 'delete');
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center space-x-2 space-x-reverse hover:opacity-80 transition-opacity">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="8" fill="#3B82F6"/><path d="M8 12h4v8H8v-8zm12 0h4v8h-4v-8zm-6-4h4v16h-4V8z" fill="white"/></svg>
            {/* <Dumbbell className="p-1 rounded-lg h-9 w-9 bg-blue-600 text-white" /> */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">تمرین‌ساز</h1>
          </Link>

          {/* Navigation and Actions */}
          <div className="flex items-center space-x-3 space-x-reverse">
            {/* "برنامه من" moved to header with text and icon in a row and added hover styles */}
            <Link
              to="/my-workouts"
              className="flex items-center space-x-1 space-x-reverse bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700" // Added hover styles
              aria-label="برنامه من"
            >
              <ClipboardList className="h-5 w-5" />
              <span>برنامه‌من</span>
            </Link>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                aria-label="منوی کاربر"
              >
                <User className="h-5 w-5" />
              </button>

              {showUserMenu && (
                <div
                  ref={menuRef}
                  className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1"
                >
                  {/* Light/Dark mode toggle moved here */}
                  <button
                    onClick={() => { toggleTheme(); setShowUserMenu(false); }}
                    className="w-full px-4 py-2 text-right text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 space-x-reverse"
                  >
                    {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    <span>{isDark ? 'حالت روشن' : 'حالت تیره'}</span>
                  </button>

                  {/* "برنامه من" removed from here as it's now in the header */}
                  <button
                    onClick={handleExport}
                    className="w-full px-4 py-2 text-right text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 space-x-reverse"
                  >
                    <Download className="h-4 w-4" />
                    <span>دانلود داده‌ها</span>
                  </button>
                  <button
                    onClick={handleImport}
                    className="w-full px-4 py-2 text-right text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 space-x-reverse"
                  >
                    <Upload className="h-4 w-4" />
                    <span>وارد کردن داده‌ها</span>
                  </button>
                  <button
                    onClick={() => { setShowClearConfirm(true); setShowUserMenu(false); }} // Close user menu
                    className="w-full px-4 py-2 text-right text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2 space-x-reverse"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>حذف داده‌ها</span>
                  </button>
                  <button
                    onClick={() => { setShowHelpModal(true); setShowUserMenu(false); }} // Close user menu
                    className="w-full px-4 py-2 text-right text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 space-x-reverse"
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span>راهنما</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
              برای نگهداری داده‌ها یا انتقال آن‌ها به مرورگر یا دستگاهی دیگر، لطفاً از گزینه «دانلود داده‌ها» استفاده کنید.
              با این کار، یک فایل JSON دریافت می‌کنید که می‌توانید آن را از طریق گزینه «وارد کردن داده‌ها» دوباره بارگذاری کرده و اطلاعات خود را بازیابی کنید.
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

      {/* Export Confirmation Modal */}
      {showExportConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            ref={exportModalRef}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              دانلود داده‌ها
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              آیا می‌خواهید از داده‌های خود خروجی بگیرید؟
            </p>
            <div className="flex space-x-3 space-x-reverse">
              <button
                onClick={confirmExport}
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
              >
                بله
              </button>
              <button
                onClick={() => setShowExportConfirm(false)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                لغو
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Confirmation Modal */}
      {showImportConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            ref={importModalRef}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              وارد کردن داده‌ها
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              لطفاً فقط فایل خروجی گرفته‌شده از همین سایت را انتخاب کنید.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="mb-4 w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300"
            />
            <p className="text-sm text-blue-500 dark:text-blue-400 mb-6">
              ℹ️ داده‌های فعلی با داده‌های فایل جایگزین می‌شوند. این عملیات قابل بازگشت نیست.
            </p>
            <div className="flex space-x-3 space-x-reverse">
              <button
                onClick={confirmImport}
                disabled={!selectedFile}
                className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                  selectedFile
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                تأیید
              </button>
              <button
                onClick={() => {
                  setShowImportConfirm(false);
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                لغو
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
    </header>
  );
}
