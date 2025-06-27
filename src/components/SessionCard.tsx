import React, { useState } from 'react';
import { WorkoutSession, Exercise } from '../types';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SessionCardProps {
  session: WorkoutSession;
  exercises: Exercise[];
  onToggleExercise: (sessionId: string, exerciseId: string) => void;
  onRemoveExercise: (sessionId: string, exerciseId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newName: string) => void;
}

export function SessionCard({
  session,
  exercises,
  onToggleExercise,
  onRemoveExercise,
  onDeleteSession,
  onRenameSession
}: SessionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(session.name);

  const completedCount = session.exercises.filter(ex => ex.completed).length;
  const totalCount = session.exercises.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleSaveEdit = () => {
    if (editName.trim() && editName.trim() !== session.name) {
      onRenameSession(session.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(session.name);
    setIsEditing(false);
  };

  const handleRemoveExerciseWithConfirm = (sessionId: string, exerciseId: string) => {
    if (confirm('آیا مطمئن هستید که می‌خواهید این تمرین را حذف کنید؟')) {
      onRemoveExercise(sessionId, exerciseId);
    }
  };

  const defaultImage = 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=100';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Session Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          {isEditing ? (
            <div className="flex items-center space-x-2 space-x-reverse">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                autoFocus
              />
              <button
                onClick={handleSaveEdit}
                className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={handleCancelEdit}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 space-x-reverse">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {session.name}
              </h3>
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => onDeleteSession(session.id)}
          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span>پیشرفت</span>
          <span>{completedCount} از {totalCount}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-3">
        {session.exercises.map((sessionExercise) => {
          const exercise = exercises.find(ex => ex.id === sessionExercise.exerciseId);
          if (!exercise) return null;

          return (
            <div
              key={sessionExercise.exerciseId}
              className="relative flex items-center space-x-3 space-x-reverse p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              {/* Delete Button */}
              <button
                onClick={() => handleRemoveExerciseWithConfirm(session.id, exercise.id)}
                className="right-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Exercise Image */}
              <img
                src={exercise.image || defaultImage}
                alt={exercise.name}
                className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = defaultImage;
                }}
              />

              {/* Exercise Info */}
              <div className="flex-1 min-w-0">
                <Link
                  to={`/exercise/${exercise.id}`}
                  className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate"
                >
                  {exercise.name}
                </Link>
                <div className="flex flex-wrap gap-1 mt-1">
                  {exercise.targetMuscles.slice(0, 2).map((muscle, index) => (
                    <span
                      key={index}
                      className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full"
                    >
                      {muscle}
                    </span>
                  ))}
                  {exercise.targetMuscles.length > 2 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      +{exercise.targetMuscles.length - 2}
                    </span>
                  )}
                </div>
              </div>

              {/* Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={sessionExercise.completed}
                  onChange={() => onToggleExercise(session.id, exercise.id)}
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
          );
        })}

        {session.exercises.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            هنوز تمرینی اضافه نشده است
          </p>
        )}
      </div>
    </div>
  );
}