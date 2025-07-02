// tamrin/src/components/ImportProgramModal.tsx
import React, { useRef, useEffect, useState } from 'react';
import { X, Upload, Trash2 } from 'lucide-react'; // Import Trash2 icon for clearing file
import { importUserData, saveUserData } from '../utils/storage';
import { UserData } from '../types';

interface ImportProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateUserData: (data: UserData) => void;
  showToast: (message: string, type: 'success' | 'delete') => void;
}

export function ImportProgramModal({ isOpen, onClose, onUpdateUserData, showToast }: ImportProgramModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [jsonInput, setJsonInput] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setJsonInput('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clear file input
      }
    }
  }, [isOpen]);

  const handleJsonInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
    if (e.target.value && selectedFile) {
      setSelectedFile(null); // Clear file if JSON input is used
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file && jsonInput) {
      setJsonInput(''); // Clear JSON input if file is selected
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the file input visually
    }
  };

  // New function to clear JSON input
  const handleClearJsonInput = () => {
    setJsonInput('');
    // If a file was selected and JSON input was disabled, re-enable file input
    if (selectedFile) {
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const confirmImport = async () => {
    let dataToImport: UserData | null = null;

    if (jsonInput.trim()) {
      try {
        dataToImport = JSON.parse(jsonInput);
        // Basic validation for sessions structure
        if (!dataToImport || !Array.isArray(dataToImport.sessions)) {
          throw new Error('ساختار JSON نامعتبر است.');
        }
        // Convert date strings back to Date objects
        dataToImport.sessions = dataToImport.sessions.map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt || Date.now())
        }));
      } catch (error) {
        showToast('خطا در تجزیه JSON: ' + (error as Error).message, 'delete');
        return;
      }
    } else if (selectedFile) {
      try {
        dataToImport = await importUserData(selectedFile);
      } catch (error) {
        showToast('خطا در وارد کردن فایل: ' + (error as Error).message, 'delete');
        return;
      }
    } else {
      showToast('لطفاً کد JSON را وارد کنید یا یک فایل انتخاب کنید.', 'delete');
      return;
    }

    if (dataToImport) {
      saveUserData(dataToImport);
      onUpdateUserData(dataToImport);
      showToast('داده‌ها با موفقیت وارد شدند', 'success');
      onClose();
    }
  };

  const isImportDisabled = !jsonInput.trim() && !selectedFile;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] flex flex-col" // Increased max-w to lg
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2 space-x-reverse">
            <Upload className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            <span>وارد کردن برنامه</span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4 text-right">
          می‌توانید کد JSON برنامه را مستقیماً وارد کنید یا یک فایل JSON را آپلود کنید.
        </p>

        {/* JSON Input */}
        <div className="mb-4 relative"> {/* Added relative for positioning the clear button */}
          <label htmlFor="json-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            ورود مستقیم کد JSON:
          </label>
          <textarea
            id="json-input"
            value={jsonInput}
            onChange={handleJsonInputChange}
            placeholder='{ "sessions": [...] }'
            rows={8}
            dir="ltr"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none pr-10" // Added pr-10 for button spacing
            disabled={!!selectedFile} // Disable if file is selected
          />
          {jsonInput.trim().length > 0 && ( // Only show button if there's text
            <button
              onClick={handleClearJsonInput}
              className="absolute top-9 right-3 p-1 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
              aria-label="پاک کردن کد JSON"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            آپلود فایل JSON:
          </label>
          <div className="flex items-center space-x-2 space-x-reverse bg-gray-100 dark:bg-gray-700 rounded-md" dir="ltr">
            <input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="flex-grow p-2 text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 dark:file:bg-blue-800 dark:file:text-white dark:hover:file:bg-blue-900" // Changed file:bg-blue-50 to file:bg-blue-600 and adjusted text color
              disabled={!!jsonInput.trim()} // Disable if JSON input is used
            />
            {selectedFile && (
              <button
                onClick={handleClearFile}
                className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors flex-shrink-0"
                aria-label="حذف فایل انتخاب شده"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        <p className="text-sm text-blue-500 dark:text-blue-400 mb-6 text-right">
          ℹ️ داده‌های فعلی با داده‌های وارد شده جایگزین می‌شوند. این عملیات قابل بازگشت نیست.
        </p>

        <div className="flex space-x-3 space-x-reverse flex-shrink-0">
          <button
            onClick={confirmImport}
            disabled={isImportDisabled}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
              isImportDisabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            تأیید
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            لغو
          </button>
        </div>
      </div>
    </div>
  );
}
