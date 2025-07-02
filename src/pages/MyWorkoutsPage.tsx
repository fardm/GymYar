import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Filter, X, Check, Eraser } from 'lucide-react';
import { SessionCard } from '../components/SessionCard';
import { exercisesData } from '../data/exercises';
import { UserData, WorkoutSession } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { UserMenu } from '../components/UserMenu'; // Import the new UserMenu component

interface MyWorkoutsPageProps {
  userData: UserData;
  onUpdateUserData: (data: UserData) => void;
}

export function MyWorkoutsPage({ userData, onUpdateUserData }: MyWorkoutsPageProps) {
  const [activeSessionFilterIds, setActiveSessionFilterIds] = useLocalStorage<string[]>('workout-session-filter', []);
  const [newSessionName, setNewSessionName] = useState('');
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempSelectedSessionIds, setTempSelectedSessionIds] = useState<string[]>([]);
  const filterModalRef = useRef<HTMLDivElement>(null);

  const [searchParams, setSearchParams] = useSearchParams();

  // Effect to handle initial filtering from URL search params
  useEffect(() => {
    const filterSessionIdFromUrl = searchParams.get('sessionId');
    if (filterSessionIdFromUrl) {
      if (!activeSessionFilterIds.includes(filterSessionIdFromUrl) || activeSessionFilterIds.length !== 1) {
        setActiveSessionFilterIds([filterSessionIdFromUrl]);
      }
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  // Initialize tempSelectedSessionIds when the modal opens
  useEffect(() => {
    if (showFilterModal) {
      setTempSelectedSessionIds(activeSessionFilterIds);
    }
  }, [showFilterModal, activeSessionFilterIds]);

  // Handle click outside to close the filter modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterModalRef.current && !filterModalRef.current.contains(event.target as Node)) {
        setShowFilterModal(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowFilterModal(false);
      }
    };

    if (showFilterModal) {
      document.body.style.overflow = 'hidden'; // Disable background scrolling
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = ''; // Re-enable scrolling on cleanup
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showFilterModal]);

  // Filter sessions based on activeSessionFilterIds
  const filteredSessions = userData.sessions.filter(session => {
    if (activeSessionFilterIds.length === 0) {
      return true;
    }
    return activeSessionFilterIds.includes(session.id);
  });

  const handleCreateSession = () => {
    if (newSessionName.trim()) {
      const newSession: WorkoutSession = {
        id: Date.now().toString(),
        name: newSessionName.trim(),
        exercises: [],
        createdAt: new Date()
      };

      onUpdateUserData({
        sessions: [...userData.sessions, newSession]
      });

      setNewSessionName('');
      setShowNewSessionForm(false);
    }
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
    setActiveSessionFilterIds(prev => prev.filter(id => id !== sessionId));
  };

  const handleRenameSession = (sessionId: string, newName: string) => {
    const updatedSessions = userData.sessions.map(session =>
      session.id === sessionId ? { ...session, name: newName } : session
    );
    onUpdateUserData({ sessions: updatedSessions });
  };

  // Filter Modal Handlers
  const handleTempSessionToggle = (sessionId: string) => {
    setTempSelectedSessionIds(prev =>
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const handleConfirmFilter = () => {
    setActiveSessionFilterIds(tempSelectedSessionIds);
    setShowFilterModal(false);
  };

  const handleClearAllSessionsFilter = () => {
    setTempSelectedSessionIds([]);
  };

  const handleCancelFilter = () => {
    setShowFilterModal(false);
  };

  const handleNewSessionInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleCreateSession();
    }
  };

  const isClearAllSessionsDisabled = tempSelectedSessionIds.length === 0;

  return (
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

      {/* Controls */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
        {/* User Menu is now in the Header component, so it's removed from here */}

        {/* Filter Button */}
        <button
          onClick={() => setShowFilterModal(true)}
          className={`flex items-center justify-center space-x-2 space-x-reverse px-6 py-2 rounded-lg transition-colors w-full sm:w-auto
            ${activeSessionFilterIds.length > 0
              ? 'bg-blue-50 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-200 dark:hover:bg-blue-900/60 border border-blue-300 dark:border-blue-600'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
        >
          <Filter className="h-4 w-4" />
          <span>فیلتر جلسات</span>
          {activeSessionFilterIds.length > 0 && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full ml-2">
              {activeSessionFilterIds.length}
            </span>
          )}
        </button>

        {/* Filter Modal */}
        {showFilterModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
              ref={filterModalRef}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-xl md:max-w-2xl lg:max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto flex flex-col"
            >
              <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  فیلتر جلسات
                </h3>
              </div>

              <div className="flex justify-end mb-6 flex-shrink-0">
                <button
                  onClick={handleClearAllSessionsFilter}
                  disabled={isClearAllSessionsDisabled}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors text-sm font-medium
                    ${isClearAllSessionsDisabled
                      ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                    }`}
                >
                  <Eraser className="h-4 w-4 ml-2" />
                  پاک کردن همه
                </button>
              </div>

              <div className="flex-grow overflow-y-auto px-2 -mr-2">
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {userData.sessions.length > 0 ? (
                    userData.sessions.map(session => (
                      <div
                        key={session.id}
                        className={`relative flex flex-col p-4 border rounded-lg cursor-pointer transition-all duration-200 min-h-[80px] justify-center
                          ${tempSelectedSessionIds.includes(session.id)
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40'
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        onClick={() => handleTempSessionToggle(session.id)}
                      >
                        <div className="flex-1 text-center">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {session.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {session.exercises.length} تمرین
                          </div>
                        </div>
                        {tempSelectedSessionIds.includes(session.id) && (
                          <div className="absolute top-2 right-2 bg-blue-600 rounded-full p-0.5">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center col-span-full">
                      هیچ جلسه‌ای برای فیلتر کردن وجود ندارد.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex space-x-2 space-x-reverse mt-6 flex-shrink-0">
                <button
                  onClick={handleConfirmFilter}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  تایید
                </button>
                <button
                  onClick={handleCancelFilter}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  لغو
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Session Button */}
        {!showNewSessionForm ? (
          <button
            onClick={() => setShowNewSessionForm(true)}
            className="flex items-center justify-center space-x-2 space-x-reverse bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            <span>جلسه جدید</span>
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 sm:space-x-reverse w-full sm:w-auto">
            <input
              type="text"
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              onKeyDown={handleNewSessionInputKeyDown}
              placeholder="نام جلسه جدید..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <div className="flex space-x-2 space-x-reverse">
              <button
                onClick={handleCreateSession}
                disabled={!newSessionName.trim()}
                className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ایجاد
              </button>
              <button
                onClick={() => {
                  setShowNewSessionForm(false);
                  setNewSessionName('');
                }}
                className="w-full sm:w-auto bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                لغو
              </button>
            </div>
          </div>
        )}
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
            {activeSessionFilterIds.length === 0
              ? 'هنوز جلسه‌ای ایجاد نشده!'
              : 'هیچ جلسه‌ای با فیلترهای انتخاب شده یافت نشد'
            }
          </p>
          {activeSessionFilterIds.length === 0 && (
            <p className="text-gray-400 dark:text-gray-500">
              برای شروع، یک جلسه جدید ایجاد کنید و سپس از صفحه اصلی تمرینات را اضافه کنید
            </p>
          )}
        </div>
      )}
    </div>
  );
}