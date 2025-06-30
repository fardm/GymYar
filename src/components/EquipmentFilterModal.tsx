// src/components/EquipmentFilterModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { X, Check } from 'lucide-react';
import { FilterRule } from '../types';
import { exercisesData } from '../data/exercises';

interface EquipmentOption {
  id: string; // Unique ID for keying
  displayName: string; // Persian name for display
  filterName: string; // Corresponding name in exercisesData.equipment
  imageName: string; // File name for the image
}

const equipmentOptionsList: EquipmentOption[] = [
  { id: 'dumbbell', displayName: 'دمبل', filterName: 'دمبل', imageName: 'dumbbell.webp' },
  { id: 'barbell', displayName: 'هالتر', filterName: 'هالتر', imageName: 'barbell.webp' },
  { id: 'plate_weight', displayName: 'صفحه وزنه', filterName: 'صفحه وزنه', imageName: 'plate_weight.webp' },
  { id: 'machine', displayName: 'دستگاه', filterName: 'دستگاه', imageName: 'machine.webp' },
  { id: 'cable', displayName: 'سیمکش', filterName: 'سیمکش', imageName: 'cable.webp' },
  { id: 'bench', displayName: 'نیمکت', filterName: 'نیمکت', imageName: 'bench.webp' },
  { id: 'bodyweight', displayName: 'وزن بدن', filterName: 'وزن بدن', imageName: 'bodyweight.webp' },
];


interface EquipmentFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: FilterRule[];
  onApplyFilters: (filters: FilterRule[]) => void;
}

export function EquipmentFilterModal({ isOpen, onClose, currentFilters, onApplyFilters }: EquipmentFilterModalProps) {
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const equipmentFilter = currentFilters.find(f => f.field === 'equipment');
      if (equipmentFilter) {
        // Map current filter values back to their original EquipmentOption IDs
        const initialSelected = equipmentOptionsList.filter(option =>
          equipmentFilter.values.includes(option.filterName)
        ).map(option => option.id);
        setSelectedEquipmentIds(initialSelected);
      } else {
        setSelectedEquipmentIds([]);
      }
    }
  }, [isOpen, currentFilters]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleEquipmentSelection = (equipmentId: string) => {
    setSelectedEquipmentIds(prev =>
      prev.includes(equipmentId) ? prev.filter(id => id !== equipmentId) : [...prev, equipmentId]
    );
  };

  const handleApply = () => {
    const newFilterValues: string[] = [];
    selectedEquipmentIds.forEach(id => {
      const option = equipmentOptionsList.find(eo => eo.id === id);
      if (option) {
        newFilterValues.push(option.filterName);
      }
    });

    const uniqueFilterValues = Array.from(new Set(newFilterValues));

    const newFilterRules: FilterRule[] = currentFilters.filter(f => f.field !== 'equipment');
    if (uniqueFilterValues.length > 0) {
      newFilterRules.push({
        id: 'equipment-filter', // A static ID for this filter
        field: 'equipment',
        values: uniqueFilterValues,
      });
    }
    onApplyFilters(newFilterRules);
    onClose();
  };

  const handleClear = () => {
    onApplyFilters(currentFilters.filter(f => f.field !== 'equipment'));
    setSelectedEquipmentIds([]);
    onClose();
  };

  const getImageUrl = (imageName: string) => {
    try {
      // Assumes images are in src/assets/images
      return new URL(`/src/assets/images/${imageName}`, import.meta.url).href;
    } catch (error) {
      console.error("Error creating local image URL:", error);
      // Fallback image if not found or error
      return 'https://placehold.co/100x100/e0e0e0/000000?text=No+Image'; // Generic placeholder
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md md:max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">فیلتر وسایل</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
          {equipmentOptionsList.map(equipment => (
            <div
              key={equipment.id}
              className={`relative flex flex-col items-center p-2 border rounded-lg cursor-pointer transition-all duration-200
                ${selectedEquipmentIds.includes(equipment.id)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              onClick={() => toggleEquipmentSelection(equipment.id)}
            >
              <img
                src={getImageUrl(equipment.imageName)}
                alt={equipment.displayName}
                className="w-20 h-20 object-contain mb-2 rounded-lg bg-gray-200 dark:bg-gray-600 p-1"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/e0e0e0/000000?text=No+Image'; // Fallback
                }}
              />
              <span className="text-sm font-medium text-center text-gray-900 dark:text-white">
                {equipment.displayName}
              </span>
              {selectedEquipmentIds.includes(equipment.id) && (
                <div className="absolute top-1 right-1 bg-blue-600 rounded-full p-0.5">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex space-x-2 space-x-reverse mt-6">
          <button
            onClick={handleApply}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            اعمال
          </button>
          <button
            onClick={handleClear}
            className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            پاک کردن همه
          </button>
        </div>
      </div>
    </div>
  );
}

