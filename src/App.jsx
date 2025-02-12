// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header/Header';
import Introduction from './components/Introduction/Introduction';
import Lessonplan from './components/Lessonplan/Lessonplan';
import Footer from './components/Footer/Footer';
import Terms from './components/Terms/Terms';
import Assessment from './components/Assessment/Assessment';

const App = () => {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/introduction" element={<Introduction />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/lessonplan" element={<Lessonplan />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/" element={<Navigate to="/terms" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;