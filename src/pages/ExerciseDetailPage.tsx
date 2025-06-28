import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Plus, Check, X } from 'lucide-react';
import { exercisesData } from '../data/exercises';
import { AddToWorkoutModal } from '../components/AddToWorkoutModal';
import { UserData, WorkoutSession, SessionExercise } from '../types';

interface ExerciseDetailPageProps {
  userData: UserData;
  onUpdateUserData: (data: UserData) => void;
}

export function ExerciseDetailPage({ userData, onUpdateUserData }: ExerciseDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionIdToDelete, setSessionIdToDelete] = useState<string | null>(null);
  const deleteModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showDeleteModal) {
        setShowDeleteModal(false);
        setSessionIdToDelete(null);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        showDeleteModal &&
        deleteModalRef.current &&
        !deleteModalRef.current.contains(event.target as Node)
      ) {
        setShowDeleteModal(false);
        setSessionIdToDelete(null);
      }
    };

    if (showDeleteModal) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDeleteModal]);

  const exercise = exercisesData.find(ex => ex.id === id);
  
  if (!exercise) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            تمرین یافت نشد
          </h1>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 space-x-reverse text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowRight className="h-4 w-4" />
            <span>بازگشت به صفحه اصلی</span>
          </Link>
        </div>
      </div>
    );
  }

  const sessionsWithExercise = userData.sessions.filter(session =>
    session.exercises.some(ex => ex.exerciseId === exercise.id)
  );

  const handleAddToSessions = (sessionIds: string[]) => {
    const updatedSessions = userData.sessions.map(session => {
      if (sessionIds.includes(session.id)) {
        const exerciseExists = session.exercises.some(ex => ex.exerciseId === exercise.id);
        if (!exerciseExists) {
          const newExercise: SessionExercise = {
            exerciseId: exercise.id,
            completed: false
          };
          return {
            ...session,
            exercises: [...session.exercises, newExercise]
          };
        }
      }
      return session;
    });

    onUpdateUserData({ sessions: updatedSessions });
  };

  const handleCreateNewSession = (sessionName: string) => {
    const newSession: WorkoutSession = {
      id: Date.now().toString(),
      name: sessionName,
      exercises: [{
        exerciseId: exercise.id,
        completed: false
      }],
      createdAt: new Date()
    };

    onUpdateUserData({
      sessions: [...userData.sessions, newSession]
    });
  };

  const handleRemoveFromSession = (sessionId: string) => {
    setSessionIdToDelete(sessionId);
    setShowDeleteModal(true);
  };

  const confirmRemoveFromSession = () => {
    if (sessionIdToDelete) {
      const updatedSessions = userData.sessions.map(session => {
        if (session.id === sessionIdToDelete) {
          return {
            ...session,
            exercises: session.exercises.filter(ex => ex.exerciseId !== exercise.id)
          };
        }
        return session;
      });

      onUpdateUserData({ sessions: updatedSessions });
      setShowDeleteModal(false);
      setSessionIdToDelete(null);
    }
  };

  const defaultImage = 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800';

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-6 lg:px-8 py-6">
      <div className="overflow-hidden">
        <div className="aspect-video flex items-center justify-center bg-white dark:bg-white rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-4">
          <img
            src={exercise.image || defaultImage}
            alt={exercise.name}
            className="h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = defaultImage;
            }}
          />
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {exercise.name}
            </h1>
            {exercise.otherNames && (
              <p className="text-gray-600 dark:text-gray-400">
                {exercise.otherNames}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                عضلات درگیر
              </h3>
              <div className="flex flex-wrap gap-2">
                {exercise.targetMuscles.map((muscle, index) => (
                  <span
                    key={index}
                    className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm"
                  >
                    {muscle}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                وسایل مورد نیاز
              </h3>
              <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-3 py-1 rounded-full">
                {exercise.equipment}
              </span>
            </div>
          </div>

          {exercise.description && (
            <div className="mt-8">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                شرح تمرین
              </h3>
              <div
                className="text-gray-600 dark:text-gray-400 leading-relaxed [&_a]:text-blue-600 [&_a]:hover:text-blue-700 dark:[&_a]:text-blue-400 dark:[&_a]:hover:text-blue-300"
                dangerouslySetInnerHTML={{ __html: exercise.description }}
              />
            </div>
          )}
          
          {sessionsWithExercise.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                جلسات شامل این تمرین
              </h3>
              <div className="space-y-2">
                {sessionsWithExercise.map(session => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
                  >
                    <div className="flex items-center space-x-2 space-x-reverse text-green-600 dark:text-green-400">
                      <Check className="h-5 w-5" />
                      <span>{session.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse gap-2">
                      <Link
                        to="/my-workouts"
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                      >
                        مشاهده برنامه من
                      </Link>
                      <button
                        onClick={() => handleRemoveFromSession(session.id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse"
            >
              <Plus className="h-4 w-4" />
              <span>افزودن به برنامه</span>
            </button>
          </div>
        </div>
      </div>

      <AddToWorkoutModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        sessions={userData.sessions}
        onAddToSessions={handleAddToSessions}
        onCreateNewSession={handleCreateNewSession}
        exerciseId={exercise.id}
      />

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={deleteModalRef}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                حذف جلسه
              </h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSessionIdToDelete(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              تمرین از این جلسه حذف شود؟
            </p>
            <div className="flex space-x-2 space-x-reverse">
              <button
                onClick={confirmRemoveFromSession}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                حذف
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSessionIdToDelete(null);
                }}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                لغو
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}