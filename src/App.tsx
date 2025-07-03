// src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ExerciseDetailPage } from './pages/ExerciseDetailPage';
import { MyWorkoutsPage } from './pages/MyWorkoutsPage';
import { AIGenWorkoutPage } from './pages/AIGenWorkoutPage'; // مسیر جدید برای صفحه AI
import { getUserData, saveUserData } from './utils/storage';
import { UserData } from './types';

function App() {
  const [userData, setUserData] = useState<UserData>({ sessions: [] });
  const [dataVersion, setDataVersion] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const data = getUserData();
    setUserData(data);

    const redirectPath = sessionStorage.getItem('redirect');
    if (redirectPath) {
      sessionStorage.removeItem('redirect');
      navigate(redirectPath, { replace: true });
    }
  }, [dataVersion, navigate]);

  const handleUpdateUserData = (newData: UserData) => {
    saveUserData(newData);
    setUserData(newData);
  };

  const handleDataChange = () => {
    setDataVersion(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* userData و onUpdateUserData دیگر به Header ارسال نمی‌شوند */}
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
          {/* مسیر جدید برای صفحه AI */}
          <Route 
            path="/ai-workout-generator" 
            element={<AIGenWorkoutPage />} 
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

function RootApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default RootApp;
