// src/components/FilterPanel.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Filter, X, Check, Trash2 } from 'lucide-react'; // Added Check and Trash2 icons
import { FilterRule } from '../types';
import { exercisesData } from '../data/exercises';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface FilterPanelProps {
  filters: FilterRule[];
  onFiltersChange: (filters: FilterRule[]) => void;
}

export function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Use local state for filters within the modal until applied
  const [tempFilters, setTempFilters] = useState<FilterRule[]>([]);
  // Store the active state of filter sections (equipment, targetMuscles)
  const [isEquipmentFilterEnabled, setIsEquipmentFilterEnabled] = useState(false);
  const [isMusclesFilterEnabled, setIsMusclesFilterEnabled] = useState(false);

  // Load stored filters on initial render and when modal opens
  const [storedFilters, setStoredFilters] = useLocalStorage<FilterRule[]>('gymyar-filters', []);

  useEffect(() => {
    // When component mounts, apply stored filters
    if (storedFilters.length > 0) {
      onFiltersChange(storedFilters);
      // Initialize enabled states based on stored filters
      setIsEquipmentFilterEnabled(storedFilters.some(f => f.field === 'equipment'));
      setIsMusclesFilterEnabled(storedFilters.some(f => f.field === 'targetMuscles'));
    }
  }, []); // Run only once on mount

  useEffect(() => {
    // Sync external filters prop to stored filters whenever it changes
    setStoredFilters(filters);
  }, [filters, setStoredFilters]);

  // Sync tempFilters with current global filters when modal opens
  useEffect(() => {
    if (isOpen) {
      setTempFilters(filters);
      setIsEquipmentFilterEnabled(filters.some(f => f.field === 'equipment'));
      setIsMusclesFilterEnabled(filters.some(f => f.field === 'targetMuscles'));
    }
  }, [isOpen, filters]);

  const equipmentOptions = [...new Set(exercisesData.map(ex => ex.equipment))].filter(Boolean);
  const muscleOptions = [...new Set(exercisesData.flatMap(ex => ex.targetMuscles))].filter(Boolean);

  // Handle click outside and escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
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
  }, [isOpen]);

  const toggleFilterSection = (field: 'equipment' | 'targetMuscles', isChecked: boolean) => {
    if (field === 'equipment') {
      setIsEquipmentFilterEnabled(isChecked);
    } else {
      setIsMusclesFilterEnabled(isChecked);
    }

    // If unchecking a section, remove its filter rules from tempFilters
    if (!isChecked) {
      setTempFilters(prevFilters => prevFilters.filter(f => f.field !== field));
    } else {
      // If checking a section and it's not already in tempFilters, add an empty rule
      if (!tempFilters.some(f => f.field === field)) {
        const newFilter: FilterRule = {
          id: Date.now().toString(),
          field,
          values: []
        };
        setTempFilters(prevFilters => [...prevFilters, newFilter]);
      }
    }
  };

  const addFilterValue = (filterField: 'equipment' | 'targetMuscles', value: string) => {
    setTempFilters(prevFilters => {
      const existingFilter = prevFilters.find(f => f.field === filterField);
      if (existingFilter) {
        if (!existingFilter.values.includes(value)) {
          return prevFilters.map(f =>
            f.field === filterField ? { ...f, values: [...f.values, value] } : f
          );
        }
      } else {
        // This case should ideally not happen if toggleFilterSection is used correctly
        // to enable the section before adding values.
        const newFilter: FilterRule = {
          id: Date.now().toString(),
          field: filterField,
          values: [value]
        };
        return [...prevFilters, newFilter];
      }
      return prevFilters;
    });
  };

  const removeFilterValue = (filterField: 'equipment' | 'targetMuscles', value: string) => {
    setTempFilters(prevFilters => {
      return prevFilters.map(filter =>
        filter.field === filterField
          ? { ...filter, values: filter.values.filter(v => v !== value) }
          : filter
      ).filter(filter => filter.values.length > 0 || filter.field !== filterField); // Remove rule if no values left
    });
  };

  const handleApplyFilters = () => {
    // Filter out rules that have no values and their section is disabled
    const appliedFilters = tempFilters.filter(filter => {
      if (filter.field === 'equipment' && !isEquipmentFilterEnabled) return false;
      if (filter.field === 'targetMuscles' && !isMusclesFilterEnabled) return false;
      return filter.values.length > 0;
    });
    onFiltersChange(appliedFilters);
    setIsOpen(false);
  };

  const handleClearAllFilters = () => {
    onFiltersChange([]);
    setTempFilters([]);
    setIsEquipmentFilterEnabled(false);
    setIsMusclesFilterEnabled(false);
    setIsOpen(false);
  };

  const getFilterValuesForField = (field: 'equipment' | 'targetMuscles'): string[] => {
    const filter = tempFilters.find(f => f.field === field);
    return filter ? filter.values : [];
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(true)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={modalRef}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">فیلتر تمرینات</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Equipment Filter Section */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <label className="flex items-center justify-between cursor-pointer mb-3">
                  <span className="text-gray-900 dark:text-white font-medium">فیلتر وسایل</span>
                  <input
                    type="checkbox"
                    checked={isEquipmentFilterEnabled}
                    onChange={(e) => toggleFilterSection('equipment', e.target.checked)}
                    className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
                {isEquipmentFilterEnabled && (
                  <>
                    <div className="relative w-full mb-3">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            addFilterValue('equipment', e.target.value);
                            e.target.value = ''; // Reset select after selection
                          }
                        }}
                        value="" // Control value to allow re-selection of the same option
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="" disabled>انتخاب وسایل...</option>
                        {equipmentOptions
                          .filter(option => !getFilterValuesForField('equipment').includes(option))
                          .map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {getFilterValuesForField('equipment').map((value) => (
                        <span
                          key={value}
                          className="flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm px-2 py-1 rounded-full"
                        >
                          {value}
                          <button
                            onClick={() => removeFilterValue('equipment', value)}
                            className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Target Muscles Filter Section */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <label className="flex items-center justify-between cursor-pointer mb-3">
                  <span className="text-gray-900 dark:text-white font-medium">فیلتر عضلات درگیر</span>
                  <input
                    type="checkbox"
                    checked={isMusclesFilterEnabled}
                    onChange={(e) => toggleFilterSection('targetMuscles', e.target.checked)}
                    className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
                {isMusclesFilterEnabled && (
                  <>
                    <div className="relative w-full mb-3">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            addFilterValue('targetMuscles', e.target.value);
                            e.target.value = ''; // Reset select after selection
                          }
                        }}
                        value="" // Control value to allow re-selection of the same option
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="" disabled>انتخاب عضلات...</option>
                        {muscleOptions
                          .filter(option => !getFilterValuesForField('targetMuscles').includes(option))
                          .map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {getFilterValuesForField('targetMuscles').map((value) => (
                        <span
                          key={value}
                          className="flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm px-2 py-1 rounded-full"
                        >
                          {value}
                          <button
                            onClick={() => removeFilterValue('targetMuscles', value)}
                            className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex space-x-2 space-x-reverse mt-6">
              <button
                onClick={handleApplyFilters}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                اعمال فیلتر
              </button>
              <button
                onClick={handleClearAllFilters}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                پاک کردن فیلتر
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
