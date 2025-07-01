import React, { useState, useMemo, useEffect, useRef } from 'react';
import { SearchBar } from '../components/SearchBar';
import { SortPanel } from '../components/SortPanel'; // Keep if needed for future, currently commented out
import { ExerciseGrid } from '../components/ExerciseGrid';
import { exercisesData } from '../data/exercises';
import { FilterRule, SortRule, UserData } from '../types';
import { MuscleFilterModal } from '../components/MuscleFilterModal';
import { EquipmentFilterModal } from '../components/EquipmentFilterModal';
import { Filter } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useSearchParams } from 'react-router-dom'; // Import useSearchParams

interface HomePageProps {
  userData: UserData;
}

const EXERCISES_PER_PAGE = 20; // تعداد تمرینات برای بارگذاری در هر مرحله

export function HomePage({ userData }: HomePageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useLocalStorage<FilterRule[]>('tamrinsaz-filters', []);
  const [sortRules, setSortRules] = useState<SortRule[]>([]); // Keep if needed for future, currently commented out
  const [visibleExerciseCount, setVisibleExerciseCount] = useState(EXERCISES_PER_PAGE);
  const [isLoading, setIsLoading] = useState(false); // وضعیت بارگذاری
  const loaderRef = useRef<HTMLDivElement>(null); // رفرنس برای تشخیص رسیدن به انتهای صفحه

  const [showMuscleFilterModal, setShowMuscleFilterModal] = useState(false);
  const [showEquipmentFilterModal, setShowEquipmentFilterModal] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams(); // Initialize useSearchParams

  // Effect to read URL parameters and apply filters
  useEffect(() => {
    const filterField = searchParams.get('filterField');
    const filterValue = searchParams.get('filterValue');

    if (filterField && filterValue) {
      // Create a new filter rule based on URL parameters
      const newFilter: FilterRule = {
        id: Date.now().toString(), // Unique ID for the filter rule
        field: filterField,
        values: [decodeURIComponent(filterValue)],
      };

      // *** تغییر اصلی: جایگزینی فیلترهای قبلی با فیلتر جدید ***
      setFilters([newFilter]); // فقط فیلتر جدید را اعمال کن و فیلترهای قبلی را پاک کن

      // Clear the URL parameters after applying the filter
      // This prevents the filter from being re-applied on refresh
      setSearchParams({}); 
    }
  }, [searchParams, setFilters, setSearchParams]); // 'filters' از dependencies حذف شد چون دیگر به حالت قبلی آن نیازی نداریم


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

    // اعمال فیلتر جستجو
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(exercise =>
        exercise.name.toLowerCase().includes(searchLower) ||
        exercise.targetMuscles.some(muscle => muscle.toLowerCase().includes(searchLower)) ||
        exercise.equipment.toLowerCase().includes(searchLower) ||
        (exercise.otherNames && exercise.otherNames.toLowerCase().includes(searchLower))
      );
    }

    // اعمال فیلترها از هر دو مدال (و از URL اگر اعمال شده باشند)
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

    // اعمال مرتب‌سازی (در صورت فعال بودن)
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

    // هر زمان که فیلترها یا عبارت جستجو تغییر کنند، تعداد تمرینات قابل مشاهده را بازنشانی کنید
    // این کار تضمین می‌کند که اسکرول بی‌نهایت از ابتدا شروع می‌شود
    setVisibleExerciseCount(EXERCISES_PER_PAGE);

    return result;
  }, [searchTerm, filters, sortRules]);
  
  const exercisesToShow = filteredAndSortedExercises.slice(0, visibleExerciseCount);
  const hasMoreExercises = filteredAndSortedExercises.length > exercisesToShow.length;

  // useEffect برای پیاده‌سازی Infinite Scrolling با IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // اگر عنصر loaderRef در حال حاضر در viewport قابل مشاهده است
        if (entries[0].isIntersecting && hasMoreExercises && !isLoading) {
          setIsLoading(true); // شروع بارگذاری
          setTimeout(() => { // شبیه‌سازی تاخیر بارگذاری
            setVisibleExerciseCount(prevCount => prevCount + EXERCISES_PER_PAGE);
            setIsLoading(false); // پایان بارگذاری
          }, 500); // تاخیر 500 میلی‌ثانیه
        }
      },
      { threshold: 1.0 } // وقتی 100% عنصر قابل مشاهده باشد
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasMoreExercises, isLoading]); // وابستگی‌ها: زمانی که تعداد تمرینات بیشتر می‌شود یا وضعیت بارگذاری تغییر می‌کند

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

      {/* Loading indicator and IntersectionObserver target */}
      {hasMoreExercises && (
        <div ref={loaderRef} className="flex justify-center mt-8">
          {isLoading ? (
            <div className="flex items-center space-x-2 space-x-reverse text-gray-600 dark:text-gray-400">
              <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>در حال بارگذاری...</span>
            </div>
          ) : (
            // این بخش می‌تواند خالی باشد یا یک پیام "به پایین اسکرول کنید" داشته باشد
            // در حالت اسکرول بی‌نهایت، دکمه "بارگذاری بیشتر" حذف می‌شود
            <div className="text-gray-500 dark:text-gray-400"></div> 
          )}
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
