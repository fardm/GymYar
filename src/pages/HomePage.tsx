import React, { useState, useMemo } from 'react';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import { SortPanel } from '../components/SortPanel';
import { ExerciseGrid } from '../components/ExerciseGrid';
import { exercisesData } from '../data/exercises';
import { FilterRule, SortRule, UserData } from '../types';

interface HomePageProps {
  userData: UserData;
}

export function HomePage({ userData }: HomePageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterRule[]>([]);
  const [sortRules, setSortRules] = useState<SortRule[]>([]);

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

    // Apply filters
    filters.forEach(filter => {
      if (filter.values.length > 0) {
        result = result.filter(exercise => {
          if (filter.field === 'equipment') {
            return filter.values.includes(exercise.equipment);
          } else if (filter.field === 'targetMuscles') {
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
            comparison = a.targetMuscles[0]?.localeCompare(b.targetMuscles[0] || '', 'fa') || 0;
          }

          if (comparison !== 0) {
            return rule.direction === 'desc' ? -comparison : comparison;
          }
        }
        return 0;
      });
    }

    return result;
  }, [searchTerm, filters, sortRules]);

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
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
          />
          <SortPanel
            sortRules={sortRules}
            onSortRulesChange={setSortRules}
          />
        </div>
      

      {/* Exercise Grid */}
      <ExerciseGrid
        exercises={filteredAndSortedExercises}
        getSessionName={getSessionName}
      />
    </div>
  );
}