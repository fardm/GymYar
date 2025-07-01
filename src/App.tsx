import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'; // useNavigate را اضافه کنید
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ExerciseDetailPage } from './pages/ExerciseDetailPage';
import { MyWorkoutsPage } from './pages/MyWorkoutsPage';
import { getUserData, saveUserData } from './utils/storage';
import { UserData } from './types';

function App() {
  const [userData, setUserData] = useState<UserData>({ sessions: [] });
  const [dataVersion, setDataVersion] = useState(0);

  // از useNavigate برای ناوبری برنامه‌ای استفاده می‌کنیم.
  const navigate = useNavigate(); 

  useEffect(() => {
    const data = getUserData();
    setUserData(data);

    // منطق بازیابی مسیر از sessionStorage و ناوبری به آن
    const redirectPath = sessionStorage.getItem('redirect');
    if (redirectPath) {
      sessionStorage.removeItem('redirect'); // مسیر را پاک می‌کنیم تا در بارگذاری‌های بعدی تکرار نشود
      // با replace: true، ورودی فعلی در تاریخچه مرورگر را جایگزین می‌کنیم
      // تا کاربر با دکمه بازگشت به صفحه‌ی ریشه نرود.
      navigate(redirectPath, { replace: true }); 
    }
  }, [dataVersion, navigate]); // navigate را به dependency array اضافه کنید

  const handleUpdateUserData = (newData: UserData) => {
    saveUserData(newData);
    setUserData(newData);
  };

  const handleDataChange = () => {
    setDataVersion(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header onDataChange={handleDataChange} />
      
      <main className="flex-1">
        <Routes>
          <Route 
            path="/" 
            element={<HomePage userData={userData} />} 
          />
          <Route 
            path="/exercise/:id" 
            element={
              <ExerciseDetailPage 
                userData={userData} 
                onUpdateUserData={handleUpdateUserData} 
              />
            } 
          />
          <Route 
            path="/my-workouts" 
            element={
              <MyWorkoutsPage 
                userData={userData} 
                onUpdateUserData={handleUpdateUserData} 
              />
            } 
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

// کامپوننت App را در داخل BrowserRouter قرار می‌دهیم.
// این کار به useNavigate اجازه می‌دهد تا به context روتر دسترسی داشته باشد.
function RootApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default RootApp;
