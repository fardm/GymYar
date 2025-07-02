import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Eraser } from 'lucide-react'; // Eraser icon imported
import { FilterRule } from '../types';
// exercisesData is not directly used in this component, but it's kept for consistency if needed elsewhere.
// import { exercisesData } from '../data/exercises'; 

export interface EquipmentOption { // Exported for use in other components
  id: string; // Unique ID for keying
  displayName: string; // Persian name for display
  filterName: string; // Corresponding name in exercisesData.equipment
  imageName: string; // File name for the image
}

export const equipmentOptionsList: EquipmentOption[] = [ // Exported for use in other components
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
  // State to hold the IDs of currently selected equipment options
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);
  // Ref for the modal content to detect clicks outside
  const modalRef = useRef<HTMLDivElement>(null);

  // Effect to initialize selected equipment when the modal opens
  useEffect(() => {
    if (isOpen) {
      // Find the existing equipment filter from currentFilters
      const equipmentFilter = currentFilters.find(f => f.field === 'equipment');
      if (equipmentFilter) {
        // Map current filter values back to their original EquipmentOption IDs for display
        const initialSelected = equipmentOptionsList.filter(option =>
          equipmentFilter.values.includes(option.filterName)
        ).map(option => option.id);
        setSelectedEquipmentIds(initialSelected);
      } else {
        // If no equipment filter exists, clear all selections
        setSelectedEquipmentIds([]);
      }
    }
  }, [isOpen, currentFilters]); // Re-run when modal opens or currentFilters change

  // Effect to handle closing modal on escape key or outside click
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose(); // Close modal on Escape key press
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      // If click is outside the modal content, close the modal
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden'; // Disable background scrolling
      // Add event listeners when modal is open
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.body.style.overflow = ''; // Re-enable scrolling on cleanup
      // Clean up event listeners when modal closes or component unmounts
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]); // Re-run when modal opens or onClose function changes

  // If modal is not open, return null to prevent rendering
  if (!isOpen) return null;

  // Handler for toggling equipment selection
  const toggleEquipmentSelection = (equipmentId: string) => {
    setSelectedEquipmentIds(prev =>
      prev.includes(equipmentId) ? prev.filter(id => id !== equipmentId) : [...prev, equipmentId]
    );
  };

  // Handler for confirming and applying selected filters
  const handleConfirm = () => {
    const newFilterValues: string[] = [];
    // Collect all filterNames from selected equipment IDs
    selectedEquipmentIds.forEach(id => {
      const option = equipmentOptionsList.find(eo => eo.id === id);
      if (option) {
        newFilterValues.push(option.filterName);
      }
    });

    // Remove duplicate filter names to ensure uniqueness
    const uniqueFilterValues = Array.from(new Set(newFilterValues));

    // Create a new array of filter rules, removing any existing 'equipment' filter
    const newFilterRules: FilterRule[] = currentFilters.filter(f => f.field !== 'equipment');
    if (uniqueFilterValues.length > 0) {
      newFilterRules.push({
        id: 'equipment-filter', // A static ID for the equipment filter rule
        field: 'equipment',
        values: uniqueFilterValues,
      });
    }
    onApplyFilters(newFilterRules); // Apply the new filter rules
    onClose(); // Close the modal
  };

  // Handler for clearing all equipment selections without applying changes immediately
  const handleClearAll = () => {
    setSelectedEquipmentIds([]); // Clear selected IDs in modal state
    // Changes will only be applied on "تایید" click.
  };

  // Handler for canceling and closing the modal without applying changes
  const handleCancel = () => {
    onClose(); // Just close the modal
  };

  // Function to get image URL for equipment options
  const getImageUrl = (imageName: string) => {
    try {
      // Constructs a URL for local images located in src/assets/images
      return new URL(`/src/assets/images/${imageName}`, import.meta.url).href;
    } catch (error) {
      console.error("Error creating local image URL:", error);
      // Fallback to a generic placeholder image if an error occurs
      return 'https://placehold.co/100x100/e0e0e0/000000?text=No+Image';
    }
  };

  // Determine if the "پاک کردن همه" (Clear All) button should be disabled
  const isClearAllDisabled = selectedEquipmentIds.length === 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        // Main modal container: uses flex-col to stack children vertically
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md md:max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto flex flex-col"
      >
        {/* Header section */}
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">فیلتر وسایل</h3>
          {/* <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button> */}
        </div>

        {/* Clear All button section */}
        <div className="flex justify-end mb-6 flex-shrink-0">
          <button
            onClick={handleClearAll}
            disabled={isClearAllDisabled} // Disable button when no equipment is selected
            className={`flex items-center px-4 py-2 rounded-lg transition-colors text-sm font-medium
              ${isClearAllDisabled
                ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' // Disabled state styling
                : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' // Enabled state styling
              }`}
          >
            <Eraser className="h-4 w-4 ml-2" /> {/* آیکون پاک کن */}
            پاک کردن همه
          </button>
        </div>

        {/* Scrollable Equipment Grid Section */}
        <div className="flex-grow overflow-y-auto px-2 -mr-2">
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
        </div>

        {/* Footer Buttons */}
        <div className="flex space-x-2 space-x-reverse mt-6 flex-shrink-0">
          <button
            onClick={handleConfirm}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            تایید
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            لغو
          </button>
        </div>
      </div>
    </div>
  );
}