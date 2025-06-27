import React, { useState } from 'react';
import { ArrowUpDown, X, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { SortRule } from '../types';

interface SortPanelProps {
  sortRules: SortRule[];
  onSortRulesChange: (rules: SortRule[]) => void;
}

export function SortPanel({ sortRules, onSortRulesChange }: SortPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const fieldOptions = [
    { value: 'name', label: 'نام تمرین' },
    { value: 'equipment', label: 'تجهیزات' },
    { value: 'targetMuscles', label: 'عضله هدف' }
  ];

  const addSortRule = () => {
    const newRule: SortRule = {
      id: Date.now().toString(),
      field: 'name',
      direction: 'asc'
    };
    onSortRulesChange([...sortRules, newRule]);
  };

  const updateSortRule = (id: string, updates: Partial<SortRule>) => {
    onSortRulesChange(sortRules.map(rule => 
      rule.id === id ? { ...rule, ...updates } : rule
    ));
  };

  const removeSortRule = (id: string) => {
    onSortRulesChange(sortRules.filter(rule => rule.id !== id));
  };

  const clearAllSortRules = () => {
    onSortRulesChange([]);
  };

  const moveRule = (id: string, direction: 'up' | 'down') => {
    const index = sortRules.findIndex(rule => rule.id === id);
    if (index === -1) return;

    const newRules = [...sortRules];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < newRules.length) {
      [newRules[index], newRules[targetIndex]] = [newRules[targetIndex], newRules[index]];
      onSortRulesChange(newRules);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-lg border transition-colors ${
          sortRules.length > 0
            ? 'bg-green-50 border-green-300 text-green-700 dark:bg-green-900/20 dark:border-green-600 dark:text-green-300'
            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
      >
        <ArrowUpDown className="h-4 w-4" />
        <span>مرتب‌سازی</span>
        {sortRules.length > 0 && (
          <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
            {sortRules.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">مرتب‌سازی</h3>
            <div className="flex space-x-2 space-x-reverse">
              {sortRules.length > 0 && (
                <button
                  onClick={clearAllSortRules}
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

          <div className="space-y-3">
            {sortRules.map((rule, index) => (
              <div key={rule.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => moveRule(rule.id, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => moveRule(rule.id, 'down')}
                      disabled={index === sortRules.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>

                  <select
                    value={rule.field}
                    onChange={(e) => updateSortRule(rule.id, { field: e.target.value as any })}
                    className="flex-1 text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {fieldOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={rule.direction}
                    onChange={(e) => updateSortRule(rule.id, { direction: e.target.value as 'asc' | 'desc' })}
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="asc">صعودی</option>
                    <option value="desc">نزولی</option>
                  </select>

                  <button
                    onClick={() => removeSortRule(rule.id)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={addSortRule}
              className="w-full flex items-center justify-center space-x-2 space-x-reverse py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>افزودن قانون</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}