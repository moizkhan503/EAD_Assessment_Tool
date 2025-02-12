// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Introduction from './components/Introduction/Introduction';
import Lessonplan from './components/LessonPlan/LessonPlan';
import Footer from './components/Footer/Footer';
import Terms from './components/Terms/Terms';
// import LessonPlan from './components/LessonPlan/LessonPlan';

function App() {
  return (
    <Router>
      <React.Fragment>
        <Header /> {/* Render the Header here */}
        <Routes>
          <Route path="/" element={<Introduction />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/lessonplan" element={<Lessonplan />} />
        </Routes>
        <Footer />
      </React.Fragment>
    </Router>
  );
}

export default App;