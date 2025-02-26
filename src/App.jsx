// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header/Header';
import Introduction from './components/Introduction/Introduction';
import Lessonplan from './components/Lessonplan/Lessonplan';
import Footer from './components/Footer/Footer';
import Terms from './components/Terms/Terms';
import Assessment from './components/Assessment/Assessment';
import TeacherAssistant from './components/TeacherAssistant/TeacherAssistant';
import StudentAssistant from './components/StudentAssistant/StudentAssistant';
import Login from './components/Login/Login';
import './App.css';

// Component to check auth on each navigation/route change
const AuthCheck = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [location, navigate]);
  
  return children;
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check login status when the app loads
    const checkAuth = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedIn);
    };

    // Check on initial load
    checkAuth();

    // Set up event listener for storage changes
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (!isLoggedIn) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Router>
      <AuthCheck>
        <div className="app">
          {isLoggedIn && <Header />}
          <main className={`main-content ${!isLoggedIn ? 'full-height' : ''}`}>
            <div className={`${isLoggedIn ? 'container' : ''}`}>
              <Routes>
                <Route path="/login" element={
                  isLoggedIn ? <Navigate to="/terms" replace /> : <Login />
                } />
                <Route path="/introduction" element={
                  <ProtectedRoute>
                    <Introduction />
                  </ProtectedRoute>
                } />
                <Route path="/terms" element={
                  <ProtectedRoute>
                    <Terms />
                  </ProtectedRoute>
                } />
                <Route path="/lessonplan" element={
                  <ProtectedRoute>
                    <Lessonplan />
                  </ProtectedRoute>
                } />
                <Route path="/assessment" element={
                  <ProtectedRoute>
                    <Assessment />
                  </ProtectedRoute>
                } />
                <Route path="/teacher-assistant" element={
                  <ProtectedRoute>
                    <TeacherAssistant />
                  </ProtectedRoute>
                } />
                <Route path="/student-assistant" element={
                  <ProtectedRoute>
                    <StudentAssistant />
                  </ProtectedRoute>
                } />
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </div>
          </main>
          {isLoggedIn && <Footer />}
        </div>
      </AuthCheck>
    </Router>
  );
};

export default App;