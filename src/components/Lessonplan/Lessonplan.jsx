<<<<<<< HEAD
// LessonPlan.jsx
import { useState } from 'react';
import axios from 'axios';
import DOMPurify from 'dompurify';
import './LessonPlan.css';

const Lessonplan = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [classDuration, setClassDuration] = useState('');
  const [teachingStyle, setTeachingStyle] = useState('');
  const [homeworkPreference, setHomeworkPreference] = useState('');
  const [numberOfClasses, setNumberOfClasses] = useState('');
  const [lessonPlan, setLessonPlan] = useState('');

  const classDurations = ['30 min', '45 min', '60 min', 'Custom'];
  const teachingStyles = [
    'Lecture-Based',
    'Interactive',
    'Inquiry-Based',
    'Project-Based',
    'Flipped Classroom',
    'Hybrid',
    'Gamified Learning',
  ];
  const homeworkPreferences = ['Problem-Solving', 'Creative', 'Research-Based'];
  const classNumbers = Array.from({ length: 50 }, (_, i) => i + 1);

  const handleFileChange = (event) => {
    setPdfFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = {
      data: pdfFile ? pdfFile.name : '',
      Classes: numberOfClasses,
      'Class Duration': classDuration,
      'Teaching Style': teachingStyle,
      'Homework Preference': homeworkPreference,
    };

    try {
      const response = await axios.post('https://apis.earlyagedevelopment.com/api/lesson-plan/generate', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const sanitizedLessonPlan = DOMPurify.sanitize(response.data.data.lessonPlan);
      setLessonPlan(sanitizedLessonPlan);
      console.log('Response from API:', response.data);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="lesson-plan-container">
      <div className="content">
        <h1>Create Your Lesson Plan</h1>

        <form onSubmit={handleSubmit}>
          <div className="dropdown-section">
            <label htmlFor="pdf-upload">Upload term syllabus:</label>
            <div className="file-input-wrapper">
              <input 
                type="file" 
                id="pdf-upload" 
                accept="application/pdf" 
                onChange={handleFileChange}
                required 
              />
            </div>
          </div>

          <div className="dropdown-section">
            <label htmlFor="number-of-classes">Number of Classes:</label>
            <select
              id="number-of-classes"
              value={numberOfClasses}
              onChange={(e) => setNumberOfClasses(e.target.value)}
              required
            >
              <option value="">Select Number of Classes</option>
              {classNumbers.map((number) => (
                <option key={number} value={number}>
                  {number} {number === 1 ? 'Class' : 'Classes'}
                </option>
              ))}
            </select>
          </div>

          <div className="dropdown-section">
            <label htmlFor="class-duration">Class Duration:</label>
            <select
              id="class-duration"
              value={classDuration}
              onChange={(e) => setClassDuration(e.target.value)}
              required
            >
              <option value="">Select Duration</option>
              {classDurations.map((duration) => (
                <option key={duration} value={duration}>
                  {duration}
                </option>
              ))}
            </select>
          </div>

          <div className="dropdown-section">
            <label htmlFor="teaching-style">Teaching Styles:</label>
            <select
              id="teaching-style"
              value={teachingStyle}
              onChange={(e) => setTeachingStyle(e.target.value)}
              required
            >
              <option value="">Select Teaching Style</option>
              {teachingStyles.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </div>

          <div className="dropdown-section">
            <label htmlFor="homework-preference">Homework Preference:</label>
            <select
              id="homework-preference"
              value={homeworkPreference}
              onChange={(e) => setHomeworkPreference(e.target.value)}
              required
            >
              <option value="">Select Homework Type</option>
              {homeworkPreferences.map((preference) => (
                <option key={preference} value={preference}>
                  {preference}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="submit-button">
            Generate Lesson Plan
          </button>
        </form>

        {lessonPlan && (
          <div className="lesson-plan-output">
            <h2>Generated Lesson Plan</h2>
            <div dangerouslySetInnerHTML={{ __html: lessonPlan }} />
          </div>
        )}
      </div>
=======
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Lessonplan.css';

const LessonPlan = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const mcqData = location.state?.mcqData;

  console.log('Received MCQ Data:', mcqData); // For debugging

  if (!mcqData || !mcqData.mcqs) {
    return (
      <div className="lesson-plan">
        <div className="error-message">
          No assessment data available. Please go back and start a new assessment.
        </div>
        <button onClick={() => navigate('/terms')} className="back-button">
          Go Back
        </button>
      </div>
    );
  }

  // Parse MCQs into an array of questions
  const parseMCQs = (mcqString) => {
    try {
      const questions = mcqString.split(/Q\d+\./).filter(q => q.trim());
      return questions.map(question => {
        const lines = question.split('\n').filter(line => line.trim());
        return {
          question: lines[0],
          options: lines.slice(1, -1),
          correctAnswer: lines[lines.length - 1]
        };
      });
    } catch (error) {
      console.error('Error parsing MCQs:', error);
      return [];
    }
  };

  const questions = parseMCQs(mcqData.mcqs);

  return (
    <div className="lesson-plan">
      <div className="assessment-header">
        <h2>{mcqData.projectName}</h2>
        <p className="criteria">Assessment Criteria: {mcqData.assessmentCriteria}</p>
      </div>

      <div className="mcq-container">
        {questions.map((question, index) => (
          <div key={index} className="mcq-question">
            <h3>Question {index + 1}</h3>
            <div className="question-content">
              <p className="question-text">{question.question}</p>
              {question.options.map((option, optIndex) => (
                <p key={optIndex} className="option">
                  {option}
                </p>
              ))}
              <div className="correct-answer">
                {question.correctAnswer}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => navigate('/terms')} className="back-button">
        Start New Assessment
      </button>
>>>>>>> origin/main
    </div>
  );
};

<<<<<<< HEAD
export default Lessonplan;
=======
export default LessonPlan;
>>>>>>> origin/main
