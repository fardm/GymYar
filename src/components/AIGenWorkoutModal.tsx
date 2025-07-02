import React, { useRef, useEffect, useState } from 'react';
import { X, Copy, Bot } from 'lucide-react'; // Import Bot icon

interface AIGenWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIGenWorkoutModal({ isOpen, onClose }: AIGenWorkoutModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const promptTextRef = useRef<HTMLTextAreaElement>(null); // Ref for the textarea to copy its content
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle'); // State for copy button text/status

  const promptText = `یک برنامه بدنسازی برام بنویس که ۴ جلسه در هفته باشد.
هر جلسه شامل تمرین‌هایی برای گروه عضلانی مشخص شده باشد، به‌طوری که هر گروه به طور کامل و متعادل درگیر شود. مثل این:
- جلسه ۱: سینه + جلو بازو
- جلسه ۲: پشت + لت + ساعد
- جلسه ۳: سرشانه + پشت بازو
- جلسه ۴: پا + شکم

برای هر جلسه:
- تمرینات به اندازه کافی باشند تا تمامی بخش‌ها و عضلات مهم گروه عضلانی درگیر شوند.
- تعداد تمرین‌ها در هر جلسه حداقل ۵ تا ۷ حرکت باشد.
- تعداد ست‌ها و تکرارها متناسب با اصول هایپرتروفی باشد(مثلاً ۳ تا ۴ ست، ۸ تا ۱۵ تکرار).
- در تمریناتی مثل پلانک که تکرار معنا ندارد از توضیح مناسب استفاده کن(مثلا ۳ * ۱ دقیقه).

تمرینات را فقط از لیست موجود در فایل exercises.ts که ارسال کردم انتخاب کن.

خروجی را در قالب یک فایل JSON طبق ساختار زیر بساز:

{
  "sessions": [
    {
      "id": "1751438995832",
      "name": "جلسه 1",
      "exercises": [
        { "exerciseId": "46", "completed": false, "notes": "12*4" },
        { "exerciseId": "84", "completed": false, "notes": "15*3" }
      ],
      "createdAt": "2025-07-02T06:49:55.832Z"
    },
    {
      "id": "1751439812805",
      "name": "جلسه 2",
      "exercises": [
        { "exerciseId": "17", "completed": false, "notes": "12*4" },
        { "exerciseId": "15", "completed": false, "notes": "12*3" }
      ],
      "createdAt": "2025-07-02T07:03:32.805Z"
    }
  ]
}
`;

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

  // Handle copy to clipboard
  const handleCopy = () => {
    if (promptTextRef.current) {
      promptTextRef.current.select();
      document.execCommand('copy');
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000); // Revert to idle after 2 seconds
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col"
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2 space-x-reverse">
            <Bot className="h-5 w-5 text-gray-700 dark:text-gray-300" /> {/* Bot icon added */}
            <span>ایجاد برنامه با AI</span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4 text-right leading-relaxed">
        برای ساخت برنامه می‌توانید از هوش مصنوعی کمک بگیرید. با دستور زیر یک کد JSON دریافت می‌کنید که از بخش "وارد کردن برنامه" می‌توانید آن را به سایت اضافه کنید.
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-right leading-relaxed">
          1. ابتدا فایل <a href="https://github.com/fardm/tamrinsaz/blob/main/src/data/exercises.ts" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300" target="_blank" rel="noopener noreferrer"> exercises.ts </a> را دانلود کرده و در محیط چت آپلود کنید.
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-right leading-relaxed">
          2. سپس از پرامپت زیر استفاده کنید
        </p>

        <div className="relative flex-grow overflow-y-auto rounded-lg bg-gray-100 dark:bg-gray-700 p-4 mb-4">
          <textarea
            ref={promptTextRef}
            readOnly
            value={promptText}
            className="w-full h-full bg-transparent text-gray-900 dark:text-white text-sm leading-relaxed resize-none outline-none border-none overflow-auto pr-10" // Added pr-10 for button
            style={{ minHeight: '200px' }} // Ensure a minimum height
          />
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 p-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            aria-label={copyStatus === 'copied' ? 'کپی شد!' : 'کپی به کلیپ بورد'}
          >
            {copyStatus === 'copied' ? (
              <span className="text-xs">کپی شد!</span> // Display "کپی شد!" text
            ) : (
              <Copy className="h-4 w-4" /> // Display Copy icon
            )}
          </button>
        </div>

        {/* New text added after the prompt box */}
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-right leading-relaxed">
          ℹ️ بر اساس نیاز خود می‌توانید تعداد جلسات، تمرین‌ها و تکرارها را در پرامپت تغییر دهید. اما ساختار خروجی حتما باید مانند کد نمونه باشد تا تمرین ساخته شده به درستی به سایت اضافه شود.
        </p>
        {/* <p className="text-gray-600 dark:text-gray-400 mb-4 text-right leading-relaxed">
          ⚠️ حتما حالت سرچ را در هوش مصنوعی فعال کنید. اگر به درستی اطلاعات از لینک استخراج نشد خودتان فایل exercises.ts را از همان لینک دانلود کرده و در محیط چت آپلود کنید.
        </p> */}

        <div className="flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}