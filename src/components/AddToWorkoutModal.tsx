// src/components/AddToWorkoutModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { X, Plus } from 'lucide-react';
import { WorkoutSession } from '../types';

interface AddToWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: WorkoutSession[];
  // Updated onAddToSessions to pass selected session IDs along with notes for the exercise
  onAddToSessions: (selectedSessions: { sessionId: string; notes: string }[]) => void;
  // onCreateNewSession no longer receives exerciseNotes as the exercise is not added immediately
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
  const [exerciseNotes, setExerciseNotes] = useState(''); // State for exercise notes
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter out sessions that already contain the exercise
  // Also, include newly created sessions that don't yet have the exercise (after handleCreateSession)
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
      // Map selected session IDs to objects including the exercise notes
      const sessionsToAdd = selectedSessions.map(sessionId => ({
        sessionId,
        notes: exerciseNotes // Pass notes for each selected session
      }));
      onAddToSessions(sessionsToAdd);
      setSelectedSessions([]);
      setExerciseNotes(''); // Clear notes after adding
      onClose(); // Close modal after adding exercise
    }
  };

  const handleCreateSession = () => {
    if (newSessionName.trim()) {
      onCreateNewSession(newSessionName.trim()); // Only create the session, no exercise notes here
      setNewSessionName('');
      setShowNewSessionForm(false);
      // Do NOT close the modal here. The new session will appear in the list,
      // and the user can then select it to add the exercise.
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            افزودن به برنامه
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

              {selectedSessions.length > 0 && ( // Show notes field if any session is selected
                <div className="mt-4">
                  <label htmlFor="exercise-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    توضیحات تمرین (اختیاری):
                  </label>
                  <textarea
                    id="exercise-notes"
                    value={exerciseNotes}
                    onChange={(e) => setExerciseNotes(e.target.value)}
                    placeholder="مثال: 3 ست 10 تکرار"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  ></textarea>
                </div>
              )}

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
                {/* Removed the notes textarea from here */}
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
                      setExerciseNotes(''); // Clear notes on cancel
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
