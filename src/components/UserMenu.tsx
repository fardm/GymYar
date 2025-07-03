// // src/components/UserMenu.tsx
// import React, { useState, useEffect, useRef } from 'react';
// import { Link } from 'react-router-dom';
// import { Menu, Moon, Sun } from 'lucide-react'; // حذف آیکون‌های مربوط به عملیات منتقل شده
// import { useTheme } from '../hooks/useTheme';
// import { UserData } from '../types';
// // حذف ایمپورت مودال‌ها که به MyWorkoutsPage منتقل شدند
// // import { ImportProgramModal } from './ImportProgramModal';
// // import { ExportProgramModal } from './ExportProgramModal';

// interface UserMenuProps {
//   onUpdateUserData: (data: UserData) => void;
//   userData: UserData; // Pass userData to UserMenu
// }

// export function UserMenu({ onUpdateUserData, userData }: UserMenuProps) {
//   const [showUserMenu, setShowUserMenu] = useState(false);
//   // حذف وضعیت‌های مودال‌ها که به MyWorkoutsPage منتقل شدند
//   // const [showClearConfirm, setShowClearConfirm] = useState(false);
//   // const [showHelpModal, setShowHelpModal] = useState(false);
//   // const [showExportProgramModal, setShowExportProgramModal] = useState(false);
//   // const [showImportProgramModal, setShowImportProgramModal] = useState(false);
//   // const [toastMessage, setToastMessage] = useState<string | null>(null);
//   // const [toastType, setToastType] = useState<'success' | 'delete' | null>(null);

//   const menuRef = useRef<HTMLDivElement>(null);
//   // حذف رفرنس‌ها به مودال‌ها
//   // const helpModalRef = useRef<HTMLDivElement>(null);
//   // const clearModalRef = useRef<HTMLDivElement>(null);

//   // مدیریت بستن منو با کلیک بیرون یا کلید Escape
//   useEffect(() => {
//     const handleEscape = (event: KeyboardEvent) => {
//       if (event.key === 'Escape') {
//         setShowUserMenu(false);
//         // اطمینان از بسته شدن مودال‌های قدیمی اگر هنوز در این کامپوننت بودند
//         // setShowClearConfirm(false);
//         // setShowHelpModal(false);
//         // setShowImportProgramModal(false);
//         // setShowExportProgramModal(false);
//       }
//     };

//     const handleClickOutside = (event: MouseEvent) => {
//       if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
//         setShowUserMenu(false);
//       }
//       // مدیریت کلیک بیرون برای مودال‌های قدیمی
//       // if (helpModalRef.current && !helpModalRef.current.contains(event.target as Node)) {
//       //   setShowHelpModal(false);
//       // }
//       // if (clearModalRef.current && !clearModalRef.current.contains(event.target as Node)) {
//       //   setShowClearConfirm(false);
//       // }
//     };

//     // فقط در صورتی که منوی کاربر باز است یا مودال‌های قدیمی در اینجا مدیریت می‌شوند، اسکرول را غیرفعال کن
//     if (showUserMenu /* || showHelpModal || showExportProgramModal || showImportProgramModal || showClearConfirm */) {
//       document.body.style.overflow = 'hidden';
//       document.addEventListener('mousedown', handleClickOutside);
//       document.addEventListener('keydown', handleEscape);
//     }

//     return () => {
//       document.body.style.overflow = '';
//       document.removeEventListener('mousedown', handleClickOutside);
//       document.removeEventListener('keydown', handleEscape);
//     };
//   }, [showUserMenu /* , showHelpModal, showExportProgramModal, showImportProgramModal, showClearConfirm */]);

//   // حذف Toast message effect و توابع مربوط به آن
//   // useEffect(() => {
//   //   if (toastMessage) {
//   //     const timer = setTimeout(() => {
//   //       setToastMessage(null);
//   //       setToastType(null);
//   //     }, 3000);
//   //     return () => clearTimeout(timer);
//   //   }
//   // }, [toastMessage]);

//   // حذف تابع showToast
//   // const showToast = (message: string, type: 'success' | 'delete') => {
//   //   setToastMessage(message);
//   //   setToastType(type);
//   // };

//   // حذف توابع مدیریت داده‌ها و مودال‌ها
//   // const handleClearData = () => {
//   //   clearUserData();
//   //   onUpdateUserData({ sessions: [] });
//   //   setShowClearConfirm(false);
//   //   setShowUserMenu(false);
//   //   showToast('تمام داده‌ها پاک شدند', 'delete');
//   // };

//   // const handleOpenImportProgramModal = () => {
//   //   setShowImportProgramModal(true);
//   //   setShowUserMenu(false);
//   // };

//   // const handleOpenExportProgramModal = () => {
//   //   setShowExportProgramModal(true);
//   //   setShowUserMenu(false);
//   // };

//   return (
//     <div className="relative">
//       <button
//         onClick={() => setShowUserMenu(!showUserMenu)}
//         className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
//         aria-label="منوی کاربر"
//       >
//         <Menu className="h-5 w-5" />
//       </button>

//       {showUserMenu && (
//         <div
//           ref={menuRef}
//           className="absolute left-0 mt-2 w-60 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10"
//         >
//           {/* حذف لینک‌های "برنامه من" و "ایجاد برنامه با AI" از اینجا */}
//           {/* حذف دکمه‌های "دانلود برنامه"، "وارد کردن برنامه"، "حذف برنامه"، "راهنما" از اینجا */}
//           <Link
//             to="/my-workouts" // هنوز لینک به صفحه MyWorkouts وجود دارد اما عملیات داخلی آن منتقل شده
//             onClick={() => setShowUserMenu(false)}
//             className="w-full px-4 py-2 text-right text-base font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 space-x-reverse border-b border-gray-200 dark:border-gray-700"
//           >
//             <span>برنامه‌من</span>
//           </Link>
//           <Link
//             to="/ai-workout-generator"
//             onClick={() => setShowUserMenu(false)}
//             className="w-full px-4 py-2 text-right text-base font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 space-x-reverse"
//           >
//             <span>ایجاد برنامه با AI</span>
//           </Link>
//         </div>
//       )}

//       {/* Toast Notification (اگر هنوز در این کامپوننت لازم باشد) */}
//       {/* {toastMessage && (
//         <div
//           className={`fixed top-6 right-6 z-50 px-4 py-2 rounded-md shadow-lg animate-fade-in-out ${
//             toastType === 'success'
//               ? 'bg-green-200 dark:bg-green-300 text-gray-800 dark:text-gray-900'
//               : 'bg-red-200 dark:bg-red-300 text-gray-800 dark:text-gray-900'
//           }`}
//         >
//           {toastMessage}
//         </div>
//       )} */}

//       {/* مودال‌های قدیمی که اکنون به MyWorkoutsPage منتقل شده‌اند، از اینجا حذف می‌شوند */}
//     </div>
//   );
// }
