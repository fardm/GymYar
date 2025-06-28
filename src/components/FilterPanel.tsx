import React, { useState, useEffect, useRef } from 'react';
import { Filter, X, Plus, Trash2, XCircle } from 'lucide-react';
import { FilterRule } from '../types';
import { exercisesData } from '../data/exercises';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface FilterPanelProps {
  filters: FilterRule[];
  onFiltersChange: (filters: FilterRule[]) => void;
}

export function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const [storedFilters, setStoredFilters] = useLocalStorage<FilterRule[]>('gymyar-filters', []);

  // Sync prop filters with localStorage on mount
  useEffect(() => {
    if (storedFilters.length > 0) {
      onFiltersChange(storedFilters);
    }
  }, []);

  // Update localStorage when filters change
  useEffect(() => {
    setStoredFilters(filters);
  }, [filters, setStoredFilters]);

  // Extract unique values from exercises data
  const equipmentOptions = [...new Set(exercisesData.map(ex => ex.equipment))].filter(Boolean);
  const muscleOptions = [...new Set(exercisesData.flatMap(ex => ex.targetMuscles))].filter(Boolean);

  const addFilter = (field: 'equipment' | 'targetMuscles') => {
    const newFilter: FilterRule = {
      id: Date.now().toString(),
      field,
      values: []
    };
    onFiltersChange([...filters, newFilter]);
  };

  const updateFilter = (id: string, updates: Partial<FilterRule>) => {
    onFiltersChange(filters.map(filter => 
      filter.id === id ? { ...filter, ...updates } : filter
    ));
  };

  const removeFilter = (id: string) => {
    onFiltersChange(filters.filter(filter => filter.id !== id));
  };

  const clearAllFilters = () => {
    onFiltersChange([]);
  };

  const addFilterValue = (filterId: string, value: string) => {
    const filter = filters.find(f => f.id === filterId);
    if (!filter || filter.values.includes(value)) return;

    const newValues = [...filter.values, value];
    updateFilter(filterId, { values: newValues });
  };

  const removeFilterValue = (filterId: string, value: string) => {
    const filter = filters.find(f => f.id === filterId);
    if (!filter) return;

    const newValues = filter.values.filter(v => v !== value);
    updateFilter(filterId, { values: newValues });
  };

  // Close panel on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-lg border transition-colors ${
          filters.length > 0
            ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-300'
            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
      >
        <Filter className="h-4 w-4" />
        <span>فیلتر</span>
        {filters.length > 0 && (
          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
            {filters.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          className="absolute top-full right-0 mt-2 w-96 max-w-[90vw] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-10"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">فیلترها</h3>
            <div className="flex space-x-2 space-x-reverse">
              {filters.length > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                >
                  حذف همه
                </button>
              )}
              {/* <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button> */}
            </div>
          </div>

          <div className="space-y-4">
            {!filters.some(f => f.field === 'equipment') && (
              <button
                onClick={() => addFilter('equipment')}
                className="w-full flex items-center justify-center space-x-2 space-x-reverse py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>افزودن فیلتر تجهیزات</span>
              </button>
            )}
            {!filters.some(f => f.field === 'targetMuscles') && (
              <button
                onClick={() => addFilter('targetMuscles')}
                className="w-full flex items-center justify-center space-x-2 space-x-reverse py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>افزودن فیلتر عضله هدف</span>
              </button>
            )}

            {filters.map((filter) => (
              <div key={filter.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                <div className="flex items-center space-x-2 space-x-reverse mb-2">
                  {filter.field === 'equipment' && <span className="text-sm text-gray-900 dark:text-white">تجهیزات:</span>}
                  {filter.field === 'targetMuscles' && <span className="text-sm text-gray-900 dark:text-white">عضلات:</span>}

                  <select
                    onChange={(e) => addFilterValue(filter.id, e.target.value)}
                    value=""
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-40"
                  >
                    <option value="" disabled>انتخاب مقدار</option>
                    {(filter.field === 'equipment' ? equipmentOptions : muscleOptions)
                      .filter(option => !filter.values.includes(option))
                      .map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                  </select>

                  <button
                    onClick={() => removeFilter(filter.id)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {filter.values.map((value) => (
                    <span
                      key={value}
                      className="flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm px-2 py-1 rounded-full"
                    >
                      {value}
                      <button
                        onClick={() => removeFilterValue(filter.id, value)}
                        className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                      >
                        <XCircle className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}