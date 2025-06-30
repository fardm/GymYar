import React, { useState, useMemo } from 'react';
import { SearchBar } from '../components/SearchBar';
import { SortPanel } from '../components/SortPanel';
import { ExerciseGrid } from '../components/ExerciseGrid';
import { exercisesData } from '../data/exercises';
import { FilterRule, SortRule, UserData } from '../types';
import { MuscleFilterModal } from '../components/MuscleFilterModal';
import { EquipmentFilterModal } from '../components/EquipmentFilterModal';
import { Filter } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage'; // Import useLocalStorage

interface HomePageProps {
  userData: UserData;
}

const EXERCISES_PER_PAGE = 20;

export function HomePage({ userData }: HomePageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  // Use useLocalStorage for filters to persist across refreshes
  const [filters, setFilters] = useLocalStorage<FilterRule[]>('tamrinsaz-filters', []);
  const [sortRules, setSortRules] = useState<SortRule[]>([]);
  const [visibleExerciseCount, setVisibleExerciseCount] = useState(EXERCISES_PER_PAGE);

  // New states for modal visibility
  const [showMuscleFilterModal, setShowMuscleFilterModal] = useState(false);
  const [showEquipmentFilterModal, setShowEquipmentFilterModal] = useState(false);

  const getSessionName = (exerciseId: string): string | undefined => {
    for (const session of userData.sessions) {
      if (session.exercises.some(ex => ex.exerciseId === exerciseId)) {
        return session.name;
      }
    }
    return undefined;
  };

  const filteredAndSortedExercises = useMemo(() => {
    let result = [...exercisesData];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(exercise =>
        exercise.name.toLowerCase().includes(searchLower) ||
        exercise.targetMuscles.some(muscle => muscle.toLowerCase().includes(searchLower)) ||
        exercise.equipment.toLowerCase().includes(searchLower) ||
        (exercise.otherNames && exercise.otherNames.toLowerCase().includes(searchLower))
      );
    }

    // Apply filters from both modals
    filters.forEach(filter => {
      if (filter.values.length > 0) {
        result = result.filter(exercise => {
          if (filter.field === 'equipment') {
            return filter.values.includes(exercise.equipment);
          } else if (filter.field === 'targetMuscles') {
            // Check if any of the exercise's target muscles match any of the filter values
            return exercise.targetMuscles.some(muscle => filter.values.includes(muscle));
          }
          return true;
        });
      }
    });

    // Apply sorting
    if (sortRules.length > 0) {
      result.sort((a, b) => {
        for (const rule of sortRules) {
          let comparison = 0;
          
          if (rule.field === 'name') {
            comparison = a.name.localeCompare(b.name, 'fa');
          } else if (rule.field === 'equipment') {
            comparison = a.equipment.localeCompare(b.equipment, 'fa');
          } else if (rule.field === 'targetMuscles') {
            // Compare by the first muscle if available, otherwise 0
            comparison = a.targetMuscles[0]?.localeCompare(b.targetMuscles[0] || '', 'fa') || 0;
          }

          if (comparison !== 0) {
            return rule.direction === 'desc' ? -comparison : comparison;
          }
        }
        return 0;
      });
    }

    // Reset visible count whenever filters or search terms change
    setVisibleExerciseCount(EXERCISES_PER_PAGE);

    return result;
  }, [searchTerm, filters, sortRules]);
  
  const handleLoadMore = () => {
    setVisibleExerciseCount(prevCount => prevCount + EXERCISES_PER_PAGE);
  };
  
  const exercisesToShow = filteredAndSortedExercises.slice(0, visibleExerciseCount);
  const hasMoreExercises = filteredAndSortedExercises.length > exercisesToShow.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          تمرینات
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {filteredAndSortedExercises.length} تمرین یافت شد
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 flex flex-wrap gap-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="جستجوی تمرینات..."
        />

        {/* New Muscle Filter Button */}
        <button
          onClick={() => setShowMuscleFilterModal(true)}
          className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-lg border transition-colors ${
            filters.some(f => f.field === 'targetMuscles' && f.values.length > 0)
              ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-300'
              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Filter className="h-4 w-4" />
          <span>فیلتر عضلات</span>
          {filters.find(f => f.field === 'targetMuscles')?.values.length > 0 && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {filters.find(f => f.field === 'targetMuscles')?.values.length}
            </span>
          )}
        </button>

        {/* New Equipment Filter Button */}
        <button
          onClick={() => setShowEquipmentFilterModal(true)}
          className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-lg border transition-colors ${
            filters.some(f => f.field === 'equipment' && f.values.length > 0)
              ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-300'
              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Filter className="h-4 w-4" />
          <span>فیلتر وسایل</span>
          {filters.find(f => f.field === 'equipment')?.values.length > 0 && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {filters.find(f => f.field === 'equipment')?.values.length}
            </span>
          )}
        </button>
        
        {/* Sort Panel (Commented out) */}
        {/* <SortPanel
          sortRules={sortRules}
          onSortRulesChange={setSortRules}
        /> */}
      </div>

      {/* Exercise Grid */}
      <ExerciseGrid
        exercises={exercisesToShow}
        getSessionName={getSessionName}
      />

      {/* Load More Button */}
      {hasMoreExercises && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            بارگذاری بیشتر
          </button>
        </div>
      )}

      {/* Muscle Filter Modal */}
      <MuscleFilterModal
        isOpen={showMuscleFilterModal}
        onClose={() => setShowMuscleFilterModal(false)}
        currentFilters={filters}
        onApplyFilters={setFilters}
      />

      {/* Equipment Filter Modal */}
      <EquipmentFilterModal
        isOpen={showEquipmentFilterModal}
        onClose={() => setShowEquipmentFilterModal(false)}
        currentFilters={filters}
        onApplyFilters={setFilters}
      />
    </div>
  );
}

