import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

  useEffect(() => {
    const data = getUserData();
    setUserData(data);
  }, [dataVersion]);

  const handleUpdateUserData = (newData: UserData) => {
    saveUserData(newData);
    setUserData(newData);
  };

  const handleDataChange = () => {
    setDataVersion(prev => prev + 1);
  };

  return (
    <Router>
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
    </Router>
  );
}

export default App;