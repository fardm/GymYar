import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { WorkoutSession } from '../types';

interface AddToWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: WorkoutSession[];
  onAddToSessions: (sessionIds: string[]) => void;
  onCreateNewSession: (sessionName: string) => void;
  exerciseId: string;
}

export function AddToWorkoutModal({
  isOpen,
  onClose,
  sessions,
  onAddToSessions,
  onCreateNewSession,
  exerciseId
}: AddToWorkoutModalProps) {
  const [newSessionName, setNewSessionName] = useState('');
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);

  if (!isOpen) return null;

  // Filter out sessions that already contain the exercise
  const availableSessions = sessions.filter(
    session => !session.exercises.some(ex => ex.exerciseId === exerciseId)
  );

  const handleSessionToggle = (sessionId: string) => {
    setSelectedSessions(prev =>
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const handleAddToSelected = () => {
    if (selectedSessions.length > 0) {
      onAddToSessions(selectedSessions);
      setSelectedSessions([]);
      onClose();
    }
  };

  const handleCreateSession = () => {
    if (newSessionName.trim()) {
      onCreateNewSession(newSessionName.trim());
      setNewSessionName('');
      setShowNewSessionForm(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            افزودن به برنامه تمرینی
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          {availableSessions.length > 0 ? (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                جلسات موجود:
              </h4>
              <div className="space-y-2">
                {availableSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex-1 text-right">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {session.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {session.exercises.length} تمرین
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedSessions.includes(session.id)}
                      onChange={() => handleSessionToggle(session.id)}
                      className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={handleAddToSelected}
                disabled={selectedSessions.length === 0}
                className="w-full mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                افزودن به جلسات انتخاب شده
              </button>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center">
              هیچ جلسه‌ای برای افزودن این تمرین در دسترس نیست
            </p>
          )}

          <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
            {!showNewSessionForm ? (
              <button
                onClick={() => setShowNewSessionForm(true)}
                className="w-full flex items-center justify-center space-x-2 space-x-reverse py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>ایجاد جلسه جدید</span>
              </button>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  placeholder="نام جلسه جدید..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
                <div className="flex space-x-2 space-x-reverse">
                  <button
                    onClick={handleCreateSession}
                    disabled={!newSessionName.trim()}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ایجاد
                  </button>
                  <button
                    onClick={() => {
                      setShowNewSessionForm(false);
                      setNewSessionName('');
                    }}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    لغو
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}