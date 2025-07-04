import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Plus, Check, PanelRightOpen, PanelRightClose, Download, Upload, Trash2, HelpCircle, X, Bot } from 'lucide-react';
import { SessionCard } from '../components/SessionCard';
import { exercisesData } from '../data/exercises';
import { UserData, WorkoutSession } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { NewSessionModal } from '../components/NewSessionModal';
import { ImportProgramModal } from '../components/ImportProgramModal';
import { ExportProgramModal } from '../components/ExportProgramModal';
import { clearUserData } from '../utils/storage';

interface MyWorkoutsPageProps {
  userData: UserData;
  onUpdateUserData: (data: UserData) => void;
}

export function MyWorkoutsPage({ userData, onUpdateUserData }: MyWorkoutsPageProps) {
  const [activeTab, setActiveTab] = useLocalStorage<string>('workout-active-tab', 'all');
  // وضعیت سایدبار: در دسکتاپ به صورت پیش‌فرض باز، در موبایل بسته
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(min-width: 768px)').matches; // دسکتاپ (md breakpoint) به صورت پیش‌فرض باز
    }
    return false; // پیش‌فرض بسته (موبایل یا SSR)
  });
  const sidebarRef = useRef<HTMLDivElement>(null); // رفرنس برای سایدبار

  // وضعیت‌های مودال‌ها
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showExportProgramModal, setShowExportProgramModal] = useState(false);
  const [showImportProgramModal, setShowImportProgramModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'delete' | null>(null);

  const clearModalRef = useRef<HTMLDivElement>(null);
  const helpModalRef = useRef<HTMLDivElement>(null);

  // تابع کمکی برای تشخیص حالت موبایل
  const isMobile = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;

  // Effect برای مدیریت فیلتر اولیه از URL search params
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const filterSessionIdFromUrl = searchParams.get('sessionId');
    if (filterSessionIdFromUrl) {
      if (activeTab !== filterSessionIdFromUrl) {
        setActiveTab(filterSessionIdFromUrl);
      }
      setSearchParams({}, { replace: true }); // پاک کردن پارامتر از URL
    }
  }, [searchParams, activeTab, setActiveTab, setSearchParams]);

  // مدیریت بستن سایدبار و مودال‌ها با کلیک بیرون یا کلید Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false);
        setShowNewSessionModal(false);
        setShowClearConfirm(false);
        setShowHelpModal(false);
        setShowExportProgramModal(false);
        setShowImportProgramModal(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      // بستن سایدبار فقط در حالت موبایل با کلیک بیرون
      if (isMobile() && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsSidebarOpen(false);
      }
      // مدیریت کلیک بیرون برای مودال‌ها
      if (clearModalRef.current && !clearModalRef.current.contains(event.target as Node)) {
        setShowClearConfirm(false);
      }
      if (helpModalRef.current && !helpModalRef.current.contains(event.target as Node)) {
        setShowHelpModal(false);
      }
    };

    if (isSidebarOpen || showNewSessionModal || showClearConfirm || showHelpModal || showExportProgramModal || showImportProgramModal) {
      document.body.style.overflow = 'hidden'; // جلوگیری از اسکرول پس‌زمینه
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.body.style.overflow = ''; // فعال کردن مجدد اسکرول پس‌زمینه
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen, showNewSessionModal, showClearConfirm, showHelpModal, showExportProgramModal, showImportProgramModal]);


  // فیلتر کردن جلسات بر اساس تب فعال
  const filteredSessions = userData.sessions.filter(session => {
    if (activeTab === 'all') {
      return true; // نمایش همه جلسات
    }
    return session.id === activeTab; // نمایش فقط جلسه انتخاب شده
  });

  // تابع ایجاد جلسه جدید (برای مودال)
  const handleCreateSession = (sessionName: string) => {
    const newSession: WorkoutSession = {
      id: Date.now().toString(),
      name: sessionName,
      exercises: [],
      createdAt: new Date()
    };

    onUpdateUserData({
      sessions: [...userData.sessions, newSession]
    });
    setShowNewSessionModal(false);
    setActiveTab(newSession.id); // پس از ایجاد، به تب جلسه جدید منتقل شود
    showToast('جلسه با موفقیت ایجاد شد', 'success');
  };

  const handleToggleExercise = (sessionId: string, exerciseId: string) => {
    const updatedSessions = userData.sessions.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          exercises: session.exercises.map(ex =>
            ex.exerciseId === exerciseId ? { ...ex, completed: !ex.completed } : ex
          )
        };
      }
      return session;
    });

    onUpdateUserData({ sessions: updatedSessions });
  };

  const handleRemoveExercise = (sessionId: string, exerciseId: string) => {
    const updatedSessions = userData.sessions.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          exercises: session.exercises.filter(ex => ex.exerciseId !== exerciseId)
        };
      }
      return session;
    });

    onUpdateUserData({ sessions: updatedSessions });
  };

  const handleDeleteSession = (sessionId: string) => {
    const updatedSessions = userData.sessions.filter(session => session.id !== sessionId);
    onUpdateUserData({ sessions: updatedSessions });
    // اگر جلسه حذف شده، تب فعال بود، به تب "همه" برگرد
    if (activeTab === sessionId) {
      setActiveTab('all');
    }
    showToast('جلسه با موفقیت حذف شد', 'delete');
  };

  const handleRenameSession = (sessionId: string, newName: string) => {
    const updatedSessions = userData.sessions.map(session =>
      session.id === sessionId ? { ...session, name: newName } : session
    );
    onUpdateUserData({ sessions: updatedSessions });
    showToast('نام جلسه با موفقیت تغییر یافت', 'success');
  };

  // توابع مربوط به Toast Notification
  const showToast = (message: string, type: 'success' | 'delete') => {
    setToastMessage(message);
    setToastType(type);
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
        setToastType(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // توابع مدیریت مودال‌ها
  const handleClearData = () => {
    clearUserData();
    onUpdateUserData({ sessions: [] });
    setShowClearConfirm(false);
    showToast('تمام داده‌ها پاک شدند', 'delete');
  };

  const handleOpenImportProgramModal = () => {
    setShowImportProgramModal(true);
    if (isMobile()) setIsSidebarOpen(false); // بستن سایدبار فقط در موبایل
  };

  const handleOpenExportProgramModal = () => {
    setShowExportProgramModal(true);
    if (isMobile()) setIsSidebarOpen(false); // بستن سایدبار فقط در موبایل
  };

  const handleOpenHelpModal = () => {
    setShowHelpModal(true);
    if (isMobile()) setIsSidebarOpen(false); // بستن سایدبار فقط در موبایل
  };

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row">
      {/* دکمه شناور برای باز کردن سایدبار در موبایل */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden fixed bottom-[2.5rem] right-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 p-3 rounded-full shadow-lg z-40 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label="باز کردن منو"
        >
          <PanelRightOpen className="h-6 w-6" />
        </button>
      )}

      {/* دکمه شناور برای باز کردن سایدبار در دسکتاپ */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="hidden md:block fixed top-1/2 -translate-y-1/2 right-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 p-3 rounded-full shadow-lg z-40 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label="باز کردن پنل"
        >
          <PanelRightOpen className="h-6 w-6" />
        </button>
      )}

      {/* بک‌دراپ موبایل (فقط در موبایل و زمانی که سایدبار باز است) */}
      {isSidebarOpen && isMobile() && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40" // Z-index changed to 40
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* سایدبار */}
      <div
        ref={sidebarRef}
        // کلاس‌های پایه برای موبایل (تمام صفحه، از راست باز می‌شود، ثابت)
        className={`fixed top-0 bottom-0 right-0 w-64 h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-lg z-50 p-4 flex flex-col transition-transform duration-300 ease-in-out overflow-y-auto
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
          // بازنویسی‌ها برای دسکتاپ (حفظ رفتار قبلی دسکتاپ: ثابت، ارتفاع محدود، از راست باز می‌شود)
          md:top-0 md:h-full md:w-64 md:${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`} // top-0 and h-full for desktop too
      >
        <div className="flex justify-end items-center mb-6">
          {/* دکمه بستن موبایل (مخفی در دسکتاپ) */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="بستن پنل"
          >
            <PanelRightClose className="h-6 w-6" />
          </button>
          {/* دکمه بستن دسکتاپ (مخفی در موبایل) */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="hidden md:block text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="بستن پنل"
          >
            <PanelRightClose className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex flex-col space-y-2">
          <button
            onClick={() => { setShowNewSessionModal(true); if (isMobile()) setIsSidebarOpen(false); }}
            className="w-full flex items-center space-x-3 space-x-reverse px-4 py-2 text-right text-base font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>جلسه جدید</span>
          </button>
          <button
            onClick={handleOpenImportProgramModal}
            className="w-full flex items-center space-x-3 space-x-reverse px-4 py-2 text-right text-base font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Upload className="h-5 w-5" />
            <span>وارد کردن برنامه</span>
          </button>
          <button
            onClick={handleOpenExportProgramModal}
            className="w-full flex items-center space-x-3 space-x-reverse px-4 py-2 text-right text-base font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Download className="h-5 w-5" />
            <span>دانلود برنامه</span>
          </button>
          <button
            onClick={() => { setShowClearConfirm(true); if (isMobile()) setIsSidebarOpen(false); }}
            className="w-full flex items-center space-x-3 space-x-reverse px-4 py-2 text-right text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="h-5 w-5" />
            <span>حذف برنامه</span>
          </button>
          <br/>
          <hr/>
          {/* لینک جدید برای AI workout generator */}
          <Link
            to="/ai-workout-generator"
            onClick={() => { if (isMobile()) setIsSidebarOpen(false); }}
            className="mt-8 w-full flex items-center space-x-3 space-x-reverse px-4 py-2 text-right text-base font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Bot className="h-5 w-5" />
            <span>ساخت برنامه با AI</span>
          </Link>
          <button
            onClick={handleOpenHelpModal}
            className="w-full flex items-center space-x-3 space-x-reverse px-4 py-2 text-right text-base font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <HelpCircle className="h-5 w-5" />
            <span>راهنما</span>
          </button>
        </nav>
      </div>

      {/* محتوای اصلی صفحه */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              برنامه من
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {userData.sessions.length} جلسه تمرینی
            </p>
          </div>

          {/* Tab Navigation for Desktop */}
          <div className="hidden md:flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto whitespace-nowrap">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-shrink-0 px-4 py-2 text-center text-sm font-medium rounded-t-lg transition-colors
                ${activeTab === 'all'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
              همه
            </button>
            {userData.sessions.map(session => (
              <button
                key={session.id}
                onClick={() => setActiveTab(session.id)}
                className={`flex-shrink-0 px-4 py-2 text-center text-sm font-medium rounded-t-lg transition-colors
                  ${activeTab === session.id
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                {session.name}
              </button>
            ))}
          </div>

          {/* Dropdown for Mobile */}
          <div className="md:hidden mb-6">
            <label htmlFor="session-select" className="sr-only">انتخاب جلسه</label>
            <select
              id="session-select"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">همه جلسات</option>
              {userData.sessions.map(session => (
                <option key={session.id} value={session.id}>
                  {session.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sessions Grid */}
          {filteredSessions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  exercises={exercisesData}
                  onToggleExercise={handleToggleExercise}
                  onRemoveExercise={handleRemoveExercise}
                  onDeleteSession={handleDeleteSession}
                  onRenameSession={handleRenameSession}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                {activeTab === 'all'
                  ? 'هنوز جلسه‌ای ایجاد نشده!'
                  : 'هیچ تمرینی در این جلسه یافت نشد.'
                }
              </p>
              {activeTab === 'all' && (
                <p className="text-gray-400 dark:text-gray-500">
                  برای شروع، یک جلسه جدید ایجاد کنید و سپس از صفحه اصلی تمرینات را اضافه کنید
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* مودال ایجاد جلسه جدید */}
      <NewSessionModal
        isOpen={showNewSessionModal}
        onClose={() => setShowNewSessionModal(false)}
        onCreateSession={handleCreateSession}
      />

      {/* مودال وارد کردن برنامه */}
      <ImportProgramModal
        isOpen={showImportProgramModal}
        onClose={() => setShowImportProgramModal(false)}
        onUpdateUserData={onUpdateUserData}
        showToast={showToast}
      />

      {/* مودال دانلود برنامه */}
      <ExportProgramModal
        isOpen={showExportProgramModal}
        onClose={() => setShowExportProgramModal(false)}
        userData={userData}
        showToast={showToast}
      />

      {/* مودال تایید حذف برنامه */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={clearModalRef}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              حذف برنامه
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              با حذف برنامه تمامی جلسات و تمرینات شما حذف خواهد شد. این عمل قابل بازگشت نیست.
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
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                لغو
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال راهنما */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={helpModalRef}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
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
    </div>
  );
}
