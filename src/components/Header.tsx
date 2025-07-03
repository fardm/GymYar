import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, Bot, ClipboardList } from 'lucide-react'; // حذف آیکون‌های اضافی
import { useTheme } from '../hooks/useTheme';
import { UserData } from '../types';


interface HeaderProps {
  onDataChange: () => void;
}

export function Header({ onDataChange }: HeaderProps) {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);


  // دریافت userData از localStorage (این بخش برای نمایش Toast در صورت نیاز یا منطق آینده حفظ می‌شود)
  const [userData, setUserData] = useState<UserData>(() => {
    try {
      const storedData = localStorage.getItem('tamrinsaz-user-data');
      return storedData ? JSON.parse(storedData) : { sessions: [] };
    } catch (error) {
      console.error('Error loading user data from localStorage:', error);
      return { sessions: [] };
    }
  });

  // تابع به‌روزرسانی userData (این تابع برای منطق آینده حفظ می‌شود، اما دیگر مستقیماً توسط دکمه‌های این Header فراخوانی نمی‌شود)
  const handleUpdateUserData = (newData: UserData) => {
    // saveUserData(newData); // ذخیره داده‌ها در اینجا انجام نمی‌شود
    setUserData(newData);
    onDataChange(); // اطلاع‌رسانی به App برای رندر مجدد در صورت نیاز
  };

  // مدیریت بستن منوی موبایل با کلیک بیرون یا کلید Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowMobileMenu(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    };

    if (showMobileMenu) {
      document.body.style.overflow = 'hidden'; // جلوگیری از اسکرول پس‌زمینه
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    } else {
      document.body.style.overflow = ''; // فعال کردن مجدد اسکرول پس‌زمینه
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showMobileMenu]);

  // تابعی برای تعیین کلاس‌های حالت فعال لینک‌های ناوبری
  const getNavLinkClass = (path: string) => {
    return `relative px-3 py-2 rounded-md text-sm font-medium transition-colors
            ${location.pathname === path
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' // حالت فعال
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700' // حالت عادی
            }`;
  };

  // تابعی برای تعیین کلاس‌های حالت فعال آیتم‌های منوی کشویی
  const getMenuItemClass = (path: string) => {
    return `w-full px-4 py-2 text-right text-base font-medium flex items-center space-x-3 space-x-reverse transition-colors
            ${location.pathname === path
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' // حالت فعال
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700' // حالت عادی
            }`;
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* لوگو و عنوان */}
          <Link to="/" className="flex items-center space-x-2 space-x-reverse hover:opacity-80 transition-opacity">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="8" fill="#3B82F6"/><path d="M8 12h4v8H8v-8zm12 0h4v8h-4v-8zm-6-4h4v16h-4V8z" fill="white"/></svg>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">تمرین‌ساز</h1>
          </Link>

          {/* آیتم‌های ناوبری اصلی (فقط در دسکتاپ) */}
          <nav className="hidden md:flex items-center space-x-4 space-x-reverse">
            <Link to="/my-workouts" className={getNavLinkClass('/my-workouts')}>
              برنامه‌من
            </Link>
            {/* <Link to="/ai-workout-generator" className={getNavLinkClass('/ai-workout-generator')}>
              ایجاد برنامه با AI
            </Link> */}
          </nav>

          {/* دکمه‌های کنترلی و منوی کاربر (تغییر یافته) */}
          <div className="flex items-center space-x-3 space-x-reverse">
            {/* دکمه تغییر حالت روشن/تیره (همیشه نمایش داده می‌شود) */}
            <button
              onClick={toggleTheme}
              className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label={isDark ? 'حالت روشن' : 'حالت تیره'}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* دکمه منوی موبایل (فقط در موبایل) */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
              aria-label="منوی کاربر"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* منوی کشویی موبایل */}
            {showMobileMenu && (
              <div
                ref={mobileMenuRef}
                className="absolute left-0 mt-2 w-60 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 top-full"
              >
                {/* لینک‌های ناوبری در منوی موبایل */}
                <Link
                  to="/my-workouts"
                  onClick={() => setShowMobileMenu(false)}
                  className={`${getMenuItemClass('/my-workouts')} border-b border-gray-200 dark:border-gray-700`}
                >
                  <ClipboardList className="h-5 w-5" />
                  <span>برنامه‌من</span>
                </Link>
                {/* <Link
                  to="/ai-workout-generator"
                  onClick={() => setShowMobileMenu(false)}
                  className={`${getMenuItemClass('/ai-workout-generator')}`}
                >
                  <Bot className="h-5 w-5" />
                  <span>ایجاد برنامه با AI</span>
                </Link> */}

                {/* دکمه‌های عملیاتی حذف شدند */}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
