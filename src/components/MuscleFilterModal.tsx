import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Check, Eraser } from 'lucide-react'; // Eraser icon imported
import { FilterRule } from '../types';
import { exercisesData } from '../data/exercises';


export interface MuscleOption { // Exported for use in other components
  id: string; // Unique ID for keying
  displayName: string; // Persian name for display
  filterNames: string[]; // Corresponding names in exercisesData.targetMuscles
  imageName: string; // File name for the image
  type: 'normal' | 'advanced';
}

export const muscleOptions: MuscleOption[] = [ // Exported for use in other components
  // Normal Muscles (Commonly used in exercisesData.ts)
  { id: 'shoulder', displayName: 'سرشانه', filterNames: ['سرشانه'], imageName: 'shoulder.webp', type: 'normal' },
  { id: 'biceps', displayName: 'جلو بازو', filterNames: ['جلو بازو'], imageName: 'biceps.webp', type: 'normal' },
  { id: 'triceps', displayName: 'پشت بازو', filterNames: ['پشت بازو'], imageName: 'triceps.webp', type: 'normal' },
  { id: 'forearm', displayName: 'ساعد', filterNames: ['ساعد'], imageName: 'forearm.webp', type: 'normal' },
  { id: 'chest', displayName: 'سینه', filterNames: ['سینه'], imageName: 'chest.webp', type: 'normal' },
  { id: 'abs', displayName: 'شکم', filterNames: ['شکم'], imageName: 'abs.webp', type: 'normal' },
  { id: 'back', displayName: 'پشت', filterNames: ['پشت'], imageName: 'back.webp', type: 'normal' },
  { id: 'legs', displayName: 'پا', filterNames: ['پا'], imageName: 'legs.webp', type: 'normal' },

  // Advanced Muscles (More specific, some map to existing broad categories for filtering)
  { id: 'anterior_deltoid', displayName: 'دلتوئید قدامی', filterNames: ['دلتوئید قدامی'], imageName: 'anterior_deltoid.webp', type: 'advanced' },
  { id: 'lateral_deltoid', displayName: 'دلتوئید میانی', filterNames: ['دلتوئید میانی'], imageName: 'lateral_deltoid.webp', type: 'advanced' },
  { id: 'posterior_deltoid', displayName: 'دلتوئید خلفی', filterNames: ['دلتوئید خلفی'], imageName: 'posterior_deltoid.webp', type: 'advanced' },
  { id: 'lower_chest', displayName: 'زیر سینه', filterNames: ['زیرسینه'], imageName: 'lower_chest.webp', type: 'advanced' },
  { id: 'upper_chest', displayName: 'بالا سینه', filterNames: ['بالا سینه'], imageName: 'upper_chest.webp', type: 'advanced' },
  { id: 'upper_abs', displayName: 'بالا شکم', filterNames: ['بالا شکم'], imageName: 'upper_abs.webp', type: 'advanced' },
  { id: 'lower_abs', displayName: 'زیر شکم', filterNames: ['زیر شکم'], imageName: 'lower_abs.webp', type: 'advanced' },
  { id: 'obliques', displayName: 'مورب شکمی', filterNames: ['مورب شکمی'], imageName: 'obliques.webp', type: 'advanced' },
  { id: 'lats', displayName: 'لت', filterNames: ['لت'], imageName: 'lats.webp', type: 'advanced' },
  { id: 'traps', displayName: 'ذوزنقه‌ای', filterNames: ['ذوزنقه‌ای'], imageName: 'traps.webp', type: 'advanced' },
  { id: 'upper_traps', displayName: 'کول', filterNames: ['کول'], imageName: 'upper_traps.webp', type: 'advanced' },
  { id: 'lower_back', displayName: 'فیله', filterNames: ['فیله'], imageName: 'lower_back.webp', type: 'advanced' },
  { id: 'quadriceps', displayName: 'چهارسر ران', filterNames: ['چهارسر ران'], imageName: 'thigh.webp', type: 'advanced' },
  { id: 'inner_thigh', displayName: 'داخل ران', filterNames: ['داخل ران'], imageName: 'inner_thigh.webp', type: 'advanced' },
  { id: 'outer_thigh', displayName: 'خارج ران', filterNames: ['خارج ران'], imageName: 'outer_thigh.webp', type: 'advanced' },
  { id: 'hamstrings', displayName: 'همسترینگ', filterNames: ['همسترینگ'], imageName: 'hamstrings.webp', type: 'advanced' },
  { id: 'glutes', displayName: 'باسن', filterNames: ['باسن'], imageName: 'glutes.webp', type: 'advanced' },
  { id: 'calves', displayName: 'ساق پا', filterNames: ['ساق پا'], imageName: 'calves.webp', type: 'advanced' },

];

// Mapping to define insertion points for advanced muscles
const parentToChildMapping: { [key: string]: string[] } = {
  'shoulder': ['anterior_deltoid', 'lateral_deltoid', 'posterior_deltoid'],
  'chest': ['lower_chest', 'upper_chest'],
  'abs': ['upper_abs', 'lower_abs', 'obliques'],
  'back': ['lats', 'traps', 'upper_traps', 'lower_back'],
  'legs': ['quadriceps', 'inner_thigh', 'outer_thigh', 'hamstrings', 'glutes', 'calves'],
};

interface MuscleFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: FilterRule[];
  onApplyFilters: (filters: FilterRule[]) => void;
}

export function MuscleFilterModal({ isOpen, onClose, currentFilters, onApplyFilters }: MuscleFilterModalProps) {
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [selectedMuscleIds, setSelectedMuscleIds] = useState<string[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  // Dynamically build displayedMuscles based on isAdvancedMode and parentToChildMapping
  const displayedMuscles = useMemo(() => {
    const result: MuscleOption[] = [];
    const normalMuscles = muscleOptions.filter(m => m.type === 'normal');
    const advancedMusclesMap = new Map<string, MuscleOption>(
      muscleOptions.filter(m => m.type === 'advanced').map(m => [m.id, m])
    );

    normalMuscles.forEach(normalMuscle => {
      result.push(normalMuscle);

      if (isAdvancedMode) {
        const childrenIds = parentToChildMapping[normalMuscle.id];
        if (childrenIds) {
          childrenIds.forEach(childId => {
            const childMuscle = advancedMusclesMap.get(childId);
            if (childMuscle) {
              result.push(childMuscle);
            }
          });
        }
      }
    });
    return result;
  }, [isAdvancedMode]);

  // Effect to initialize selected muscles when modal opens
  useEffect(() => {
    if (isOpen) {
      const muscleFilter = currentFilters.find(f => f.field === 'targetMuscles');
      if (muscleFilter) {
        // Map current filter values back to their exact MuscleOption IDs.
        // This ensures that only explicitly filtered muscles are selected.
        const initialSelected = muscleOptions.filter(option =>
          // We assume filterNames[0] is the primary name for matching
          option.filterNames.some(name => muscleFilter.values.includes(name))
        ).map(option => option.id);
        setSelectedMuscleIds(initialSelected);
      } else {
        setSelectedMuscleIds([]);
      }
    }
  }, [isOpen, currentFilters]);

  // Effect to handle closing modal on escape key or outside click
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
      document.body.style.overflow = 'hidden'; // Disable background scrolling
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.body.style.overflow = ''; // Re-enable scrolling on cleanup
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // If modal is not open, return null to prevent rendering
  if (!isOpen) return null;

  // Handler for toggling muscle selection
  const toggleMuscleSelection = (muscleId: string) => {
    setSelectedMuscleIds(prev =>
      prev.includes(muscleId) ? prev.filter(id => id !== muscleId) : [...prev, muscleId]
    );
  };

  // Handler for confirming and applying selected filters
  const handleConfirm = () => {
    const newFilterValues: string[] = [];
    // Collect all filterNames from selected muscle IDs
    selectedMuscleIds.forEach(id => {
      const option = muscleOptions.find(mo => mo.id === id);
      if (option) {
        newFilterValues.push(...option.filterNames);
      }
    });

    // Remove duplicate filter names
    const uniqueFilterValues = Array.from(new Set(newFilterValues));

    // Create a new array of filter rules, removing any existing 'targetMuscles' filter
    const newFilterRules: FilterRule[] = currentFilters.filter(f => f.field !== 'targetMuscles');
    if (uniqueFilterValues.length > 0) {
      newFilterRules.push({
        id: 'muscle-filter', // A static ID for the muscle filter rule
        field: 'targetMuscles',
        values: uniqueFilterValues,
      });
    }
    onApplyFilters(newFilterRules); // Apply the new filter rules
    onClose(); // Close the modal
  };

  // Handler for clearing all muscle selections without applying changes immediately
  const handleClearAll = () => {
    setSelectedMuscleIds([]); // Clear selected IDs in modal state
    // Do NOT apply filters here. Changes will only be applied on "تایید" click.
  };

  // Handler for canceling and closing the modal without applying changes
  const handleCancel = () => {
    onClose(); // Just close the modal
  };

  // Function to get image URL for muscle options
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

  // Determine if the "پاک کردن همه" button should be disabled
  const isClearAllDisabled = selectedMuscleIds.length === 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        // Main modal container: uses flex-col to stack children vertically
        // Adjusted max-height for desktop to force scroll earlier
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-xl md:max-w-4xl lg:max-w-5xl w-full mx-4 max-h-[80vh] md:max-h-[80vh] lg:max-h-[75vh] flex flex-col"
      >
        {/* Header - flex-shrink-0 ensures it doesn't shrink */}
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">فیلتر عضلات</h3>
          {/* <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button> */}
        </div>

        {/* Toggle Button for Normal/Advanced Mode and new "پاک کردن همه" button - flex-shrink-0 ensures it doesn't shrink */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div className="flex flex-col items-center">
            <div
              dir="ltr"
              className={`relative inline-flex flex-shrink-0 h-8 w-14 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                ${isAdvancedMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
              onClick={() => setIsAdvancedMode(prev => !prev)}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-7 w-7 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200
                  ${isAdvancedMode ? 'translate-x-6' : 'translate-x-0'}`}
              />
            </div>
            <span className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              پیشرفته
            </span>
          </div>

          {/* New "پاک کردن همه" button */}
          <button
            onClick={handleClearAll}
            disabled={isClearAllDisabled} // Disable button when no muscles are selected
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

        {/* Scrollable Muscle Grid Section - flex-grow allows it to take available space, overflow-y-auto enables scrolling */}
        {/* pr-2 -mr-2 is added to prevent content from being pushed by the scrollbar */}
        <div className="flex-grow overflow-y-auto px-2 -mr-2">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-4 mb-6">
            {displayedMuscles.map(muscle => (
              <div
                key={muscle.id}
                className={`relative flex flex-col items-center p-2 border rounded-lg cursor-pointer transition-all duration-200
                  ${selectedMuscleIds.includes(muscle.id)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40'
                    : muscle.type === 'advanced'
                      ? 'border border-dashed border-gray-400 dark:border-gray-500 bg-gray-50 dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                onClick={() => toggleMuscleSelection(muscle.id)}
              >
                <img
                  src={getImageUrl(muscle.imageName)}
                  alt={muscle.displayName}
                  className="w-20 h-20 object-contain mb-2 rounded-lg bg-gray-200 dark:bg-gray-600 p-1"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/e0e0e0/000000?text=No+Image'; // Fallback
                  }}
                />
                <span className="text-sm font-medium text-center text-gray-900 dark:text-white">
                  {muscle.displayName}
                </span>
                {selectedMuscleIds.includes(muscle.id) && (
                  <div className="absolute top-1 right-1 bg-blue-600 rounded-full p-0.5">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Buttons - flex-shrink-0 ensures it doesn't shrink */}
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