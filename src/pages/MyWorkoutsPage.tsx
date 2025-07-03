// src/pages/MyWorkoutsPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Check, PanelRightOpen, PanelRightClose, Download, Upload, Trash2, HelpCircle, X } from 'lucide-react';
import { SessionCard } from '../components/SessionCard';
import { exercisesData } from '../data/exercises';
import { UserData, WorkoutSession } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { NewSessionModal } from '../components/NewSessionModal'; // ایمپورت مودال جدید
import { ImportProgramModal } from '../components/ImportProgramModal'; // ایمپورت مودال‌های موجود
import { ExportProgramModal } from '../components/ExportProgramModal';
import { clearUserData } from '../utils/storage'; // Import clearUserData

interface MyWorkoutsPageProps {
  userData: UserData;
  onUpdateUserData: (data: UserData) => void;
}

export function MyWorkoutsPage({ userData, onUpdateUserData }: MyWorkoutsPageProps) {
  const [activeTab, setActiveTab] = useLocalStorage<string>('workout-active-tab', 'all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // وضعیت سایدبار برای موبایل
  const sidebarRef = useRef<HTMLDivElement>(null); // رفرنس برای سایدبار

  // وضعیت‌های مودال‌ها که قبلاً در UserMenu بودند
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showExportProgramModal, setShowExportProgramModal] = useState(false);
  const [showImportProgramModal, setShowImportProgramModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'delete' | null>(null);

  const clearModalRef = useRef<HTMLDivElement>(null);
  const helpModalRef = useRef<HTMLDivElement>(null);


  // Effect to handle initial filtering from URL search params (اگر هنوز لازم باشد)
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const filterSessionIdFromUrl = searchParams.get('sessionId');
    if (filterSessionIdFromUrl) {
      // اگر sessionId در URL بود و با تب فعال فعلی فرق داشت، آن را فعال کن
      if (activeTab !== filterSessionIdFromUrl) {
        setActiveTab(filterSessionIdFromUrl);
      }
      setSearchParams({}, { replace: true }); // پاک کردن پارامتر از URL
    }
  }, [searchParams, activeTab, setActiveTab, setSearchParams]);

  // مدیریت بستن سایدبار با کلیک بیرون یا کلید Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false);
        // بستن مودال‌ها نیز
        setShowNewSessionModal(false);
        setShowClearConfirm(false);
        setShowHelpModal(false);
        setShowExportProgramModal(false);
        setShowImportProgramModal(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
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
    setIsSidebarOpen(false); // بستن سایدبار بعد از کلیک
  };

  const handleOpenExportProgramModal = () => {
    setShowExportProgramModal(true);
    setIsSidebarOpen(false); // بستن سایدبار بعد از کلیک
  };

  const handleOpenHelpModal = () => {
    setShowHelpModal(true);
    setIsSidebarOpen(false); // بستن سایدبار بعد از کلیک
  };

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row">
      {/* دکمه شناور برای باز کردن سایدبار در موبایل */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden fixed bottom-4 right-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 p-3 rounded-full shadow-lg z-40 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label="باز کردن منو"
        >
          <PanelRightOpen className="h-6 w-6" />
        </button>
      )}

      {/* سایدبار */}
      <div
        ref={sidebarRef}
        // Fixed positioning, top-16 to start below header, calculated height to prevent overall page scroll
        // right-0 for placement, w-64 for width, z-40 to be below the header
        className={`fixed top-16 h-[calc(100vh-4rem)] right-0 w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 z-40 p-4 flex flex-col transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
          md:translate-x-0 md:w-64 overflow-y-auto`}
      >
        <div className="flex justify-between items-center mb-6 md:hidden">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">گزینه‌ها</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex flex-col space-y-2">
          <button
            onClick={() => { setShowNewSessionModal(true); setIsSidebarOpen(false); }}
            className="w-full flex items-center space-x-3 space-x-reverse px-4 py-2 text-right text-base font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
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
            onClick={() => { setShowClearConfirm(true); setIsSidebarOpen(false); }}
            className="w-full flex items-center space-x-3 space-x-reverse px-4 py-2 text-right text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="h-5 w-5" />
            <span>حذف برنامه</span>
          </button>
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
      {/* Removed md:pr-64 as sidebar is now a floating box not affecting flow */}
      <div className="flex-1 overflow-auto">
        {/* max-w-7xl and mx-auto to center content like the homepage */}
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