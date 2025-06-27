import React, { useState } from 'react';
import { Filter, X, Plus, Trash2 } from 'lucide-react';
import { FilterRule } from '../types';
import { exercisesData } from '../data/exercises';

interface FilterPanelProps {
  filters: FilterRule[];
  onFiltersChange: (filters: FilterRule[]) => void;
}

export function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Extract unique values from exercises data
  const equipmentOptions = [...new Set(exercisesData.map(ex => ex.equipment))].filter(Boolean);
  const muscleOptions = [...new Set(exercisesData.flatMap(ex => ex.targetMuscles))].filter(Boolean);

  const addFilter = () => {
    const newFilter: FilterRule = {
      id: Date.now().toString(),
      field: 'equipment',
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

  const toggleValue = (filterId: string, value: string) => {
    const filter = filters.find(f => f.id === filterId);
    if (!filter) return;

    const newValues = filter.values.includes(value)
      ? filter.values.filter(v => v !== value)
      : [...filter.values, value];

    updateFilter(filterId, { values: newValues });
  };

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
        <div className="absolute top-full left-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-10">
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
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filters.map((filter) => (
              <div key={filter.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                <div className="flex justify-between items-center mb-3">
                  <select
                    value={filter.field}
                    onChange={(e) => updateFilter(filter.id, { 
                      field: e.target.value as 'equipment' | 'targetMuscles',
                      values: [] // Reset values when field changes
                    })}
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="equipment">تجهیزات</option>
                    <option value="targetMuscles">عضله هدف</option>
                  </select>
                  <button
                    onClick={() => removeFilter(filter.id)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {(filter.field === 'equipment' ? equipmentOptions : muscleOptions).map((option) => (
                    <label key={option} className="flex items-center space-x-2 space-x-reverse text-sm">
                      <input
                        type="checkbox"
                        checked={filter.values.includes(option)}
                        onChange={() => toggleValue(filter.id, option)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={addFilter}
              className="w-full flex items-center justify-center space-x-2 space-x-reverse py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>افزودن فیلتر</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}