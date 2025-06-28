import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { SessionCard } from '../components/SessionCard';
import { exercisesData } from '../data/exercises';
import { UserData, WorkoutSession } from '../types';

interface MyWorkoutsPageProps {
  userData: UserData;
  onUpdateUserData: (data: UserData) => void;
}

export function MyWorkoutsPage({ userData, onUpdateUserData }: MyWorkoutsPageProps) {
  const [sessionFilter, setSessionFilter] = useState<string>('all');
  const [newSessionName, setNewSessionName] = useState('');
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);

  const filteredSessions = userData.sessions.filter(session => {
    if (sessionFilter === 'all') return true;
    return session.id === sessionFilter;
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
  };

  const handleRenameSession = (sessionId: string, newName: string) => {
    const updatedSessions = userData.sessions.map(session =>
      session.id === sessionId ? { ...session, name: newName } : session
    );
    onUpdateUserData({ sessions: updatedSessions });
  };

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
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:gap-4">
        {/* Filter */}
        <select
          value={sessionFilter}
          onChange={(e) => setSessionFilter(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 sm:mb-0"
        >
          <option value="all">همه جلسات</option>
          {userData.sessions.map(session => (
            <option key={session.id} value={session.id}>
              {session.name}
            </option>
          ))}
        </select>

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
            {sessionFilter === 'all' 
              ? 'هنوز جلسه‌ای ایجاد نکرده‌اید'
              : 'هیچ جلسه‌ای با این نام یافت نشد'
            }
          </p>
          {sessionFilter === 'all' && (
            <p className="text-gray-400 dark:text-gray-500">
              برای شروع، یک جلسه جدید ایجاد کنید و سپس از صفحه اصلی تمرینات را اضافه کنید
            </p>
          )}
        </div>
      )}
    </div>
  );
}