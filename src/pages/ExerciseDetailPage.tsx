import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Plus, Check } from 'lucide-react';
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

  const isInWorkout = userData.sessions.some(session =>
    session.exercises.some(ex => ex.exerciseId === exercise.id)
  );

  const getSessionName = (): string | undefined => {
    for (const session of userData.sessions) {
      if (session.exercises.some(ex => ex.exerciseId === exercise.id)) {
        return session.name;
      }
    }
    return undefined;
  };

  const handleAddToSession = (sessionId: string) => {
    const updatedSessions = userData.sessions.map(session => {
      if (session.id === sessionId) {
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

  const handleRemoveFromWorkout = () => {
    const updatedSessions = userData.sessions.map(session => ({
      ...session,
      exercises: session.exercises.filter(ex => ex.exerciseId !== exercise.id)
    }));

    onUpdateUserData({ sessions: updatedSessions });
  };

  const defaultImage = 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center space-x-2 space-x-reverse text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-6"
      >
        <ArrowRight className="h-4 w-4" />
        <span>بازگشت به گالری</span>
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Exercise Image */}
        <div className="aspect-video bg-gray-100 dark:bg-gray-700">
          <img
            src={exercise.image || defaultImage}
            alt={exercise.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = defaultImage;
            }}
          />
        </div>

        {/* Exercise Details */}
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {exercise.name}
              </h1>
              {exercise.otherNames && (
                <p className="text-gray-600 dark:text-gray-400">
                  {exercise.otherNames}
                </p>
              )}
            </div>

            {/* Add/Remove Button */}
            {isInWorkout ? (
              <div className="text-left">
                <div className="flex items-center space-x-2 space-x-reverse text-green-600 dark:text-green-400 mb-2">
                  <Check className="h-5 w-5" />
                  <span className="text-sm">در برنامه: {getSessionName()}</span>
                </div>
                <button
                  onClick={handleRemoveFromWorkout}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  حذف از برنامه
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse"
              >
                <Plus className="h-4 w-4" />
                <span>افزودن به برنامه</span>
              </button>
            )}
          </div>

          {/* Exercise Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                عضلات هدف
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                تجهیزات مورد نیاز
              </h3>
              <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-3 py-1 rounded-full">
                {exercise.equipment}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              توضیحات
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {exercise.description || 'توضیحی برای این تمرین ثبت نشده است.'}
            </p>
          </div>
        </div>
      </div>

      {/* Add to Workout Modal */}
      <AddToWorkoutModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        sessions={userData.sessions}
        onAddToSession={handleAddToSession}
        onCreateNewSession={handleCreateNewSession}
      />
    </div>
  );
}