// src/pages/ExerciseDetailPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Plus, Check, X, SquarePen } from 'lucide-react'; // Import SquarePen icon
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

  // New states for editing notes
  const [showEditNotesModal, setShowEditNotesModal] = useState(false);
  const [sessionBeingEdited, setSessionBeingEdited] = useState<string | null>(null);
  const [currentNotes, setCurrentNotes] = useState<string>('');
  const editNotesModalRef = useRef<HTMLHTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showDeleteModal) {
          setShowDeleteModal(false);
          setSessionIdToDelete(null);
        }
        if (showEditNotesModal) { // Handle escape for edit notes modal
          setShowEditNotesModal(false);
          setSessionBeingEdited(null);
          setCurrentNotes('');
        }
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
      if (
        showEditNotesModal && // Handle click outside for edit notes modal
        editNotesModalRef.current &&
        !editNotesModalRef.current.contains(event.target as Node)
      ) {
        setShowEditNotesModal(false);
        setSessionBeingEdited(null);
        setCurrentNotes('');
      }
    };

    if (showDeleteModal || showEditNotesModal) { // Add edit notes modal to event listener dependencies
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDeleteModal, showEditNotesModal]); // Add showEditNotesModal to dependencies

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

  // Find sessions that contain this exercise, and get the specific SessionExercise object for notes
  const sessionsWithExercise = userData.sessions
    .map(session => {
      const sessionExercise = session.exercises.find(ex => ex.exerciseId === exercise.id);
      return sessionExercise ? { session, sessionExercise } : null;
    })
    .filter(Boolean) as { session: WorkoutSession; sessionExercise: SessionExercise }[];

  // Updated handleAddToSessions to accept notes
  const handleAddToSessions = (selectedSessionsData: { sessionId: string; notes: string }[]) => {
    const updatedSessions = userData.sessions.map(session => {
      const selectedSessionInfo = selectedSessionsData.find(s => s.sessionId === session.id);

      if (selectedSessionInfo) {
        const exerciseExists = session.exercises.some(ex => ex.exerciseId === exercise.id);
        if (!exerciseExists) {
          const newExercise: SessionExercise = {
            exerciseId: exercise.id,
            completed: false,
            notes: selectedSessionInfo.notes // Assign notes from modal
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

  // Updated handleCreateNewSession to only create the session, no exercise added yet
  const handleCreateNewSession = (sessionName: string) => {
    const newSession: WorkoutSession = {
      id: Date.now().toString(),
      name: sessionName,
      exercises: [], // New session starts with no exercises
      createdAt: new Date()
    };

    onUpdateUserData({
      sessions: [...userData.sessions, newSession]
    });
    // The modal remains open, allowing the user to select this new session to add the exercise.
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

  // Handle opening the edit notes modal
  const handleEditNotes = (sessionId: string, notes: string | undefined) => {
    setSessionBeingEdited(sessionId);
    setCurrentNotes(notes || ''); // Set current notes, default to empty string if undefined
    setShowEditNotesModal(true);
  };

  // Handle saving the edited notes
  const handleSaveNotes = () => {
    if (sessionBeingEdited && exercise) {
      const updatedSessions = userData.sessions.map(session => {
        if (session.id === sessionBeingEdited) {
          return {
            ...session,
            exercises: session.exercises.map(ex => 
              ex.exerciseId === exercise.id 
                ? { ...ex, notes: currentNotes.trim() || undefined } // Save notes, or undefined if empty
                : ex
            )
          };
        }
        return session;
      });
      onUpdateUserData({ sessions: updatedSessions });
      setShowEditNotesModal(false);
      setSessionBeingEdited(null);
      setCurrentNotes('');
    }
  };

  // Handle canceling the edit notes
  const handleCancelEditNotes = () => {
    setShowEditNotesModal(false);
    setSessionBeingEdited(null);
    setCurrentNotes('');
  };

  const defaultImage = 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800';

  // Function to get the correct image URL (local or external)
  const getImageUrl = (imageName: string | undefined) => {
    if (imageName && !imageName.startsWith('http')) { // If it's not an external link
      try {
        // Construct URL for local images
        return new URL(`/src/assets/images/${imageName}`, import.meta.url).href;
      } catch (error) {
        console.error("Error creating local image URL:", error);
        return defaultImage; // Fallback to default image on error
      }
    }
    return imageName || defaultImage; // If it's an external link or undefined, return as is
  };

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-6 lg:px-8 py-6">
      <div className="overflow-hidden">
        <div className="aspect-video flex items-center justify-center bg-white dark:bg-white rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-4">
          <img
            src={getImageUrl(exercise.image)} // Use the new function to get image URL
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
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
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
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
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
                {sessionsWithExercise.map(({ session, sessionExercise }) => (
                  <div
                    key={session.id}
                    className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 space-x-reverse text-green-600 dark:text-green-400">
                        <Check className="h-5 w-5" />
                        <span>{session.name}</span>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse gap-2">
                        {/* New position for the link, before the edit button */}
                        <Link
                          to={`/my-workouts?sessionId=${session.id}`} // Use query parameter for filtering
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                        >
                          مشاهده جلسه
                        </Link>
                        {/* Edit button remains */}
                        <button
                          onClick={() => handleEditNotes(session.id, sessionExercise.notes)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <SquarePen className="h-5 w-5" />
                        </button>
                        {/* Delete button remains */}
                        <button
                          onClick={() => handleRemoveFromSession(session.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    {/* توضیحات */}
                    </div>
                    {sessionExercise.notes && ( // Display notes if they exist
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-right">
                        {sessionExercise.notes}
                      </p>
                    )}
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

      {/* Edit Notes Modal */}
      {showEditNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={editNotesModalRef}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                ویرایش توضیحات تمرین
              </h3>
              <button
                onClick={handleCancelEditNotes}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <textarea
              value={currentNotes}
              onChange={(e) => setCurrentNotes(e.target.value)}
              placeholder="توضیحات تمرین..."
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              autoFocus
            ></textarea>
            <div className="flex space-x-2 space-x-reverse">
              <button
                onClick={handleSaveNotes}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                تأیید
              </button>
              <button
                onClick={handleCancelEditNotes}
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