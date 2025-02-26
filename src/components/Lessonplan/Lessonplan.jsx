// LessonPlan.jsx
import { useState } from 'react';
import axios from 'axios';
import DOMPurify from 'dompurify';
import './Lessonplan.css';

const LessonPlan = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [classDuration, setClassDuration] = useState('');
  const [teachingStyle, setTeachingStyle] = useState('');
  const [homeworkPreference, setHomeworkPreference] = useState('');
  const [numberOfClasses, setNumberOfClasses] = useState(5);
  const [lessonPlan, setLessonPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLessonPlanPopup, setShowLessonPlanPopup] = useState(false);

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

  const handleFileChange = (event) => {
    setPdfFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = {
      data: pdfFile ? pdfFile.name : '',
      Classes: numberOfClasses.toString(),
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
      setShowLessonPlanPopup(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Failed to generate lesson plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lesson-plan-container">
      <div className="content">
        <h1>Create Your Lesson Plan</h1>

        <form onSubmit={handleSubmit} className="lesson-plan-form">
          <div className="form-section">
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

          <div className="form-section">
            <label htmlFor="number-of-classes">
              Number of Classes: <span className="slider-value">{numberOfClasses}</span>
            </label>
            <div className="slider-container">
              <input
                type="range"
                id="number-of-classes"
                min="1"
                max="50"
                value={numberOfClasses}
                onChange={(e) => setNumberOfClasses(parseInt(e.target.value))}
                className="slider"
                required
              />
              <div className="slider-labels">
                <span>1</span>
                <span>25</span>
                <span>50</span>
              </div>
            </div>
          </div>

          <div className="form-section">
            <label htmlFor="class-duration">Class Duration:</label>
            <select
              id="class-duration"
              value={classDuration}
              onChange={(e) => setClassDuration(e.target.value)}
              required
              className="styled-select"
            >
              <option value="">Select Duration</option>
              {classDurations.map((duration) => (
                <option key={duration} value={duration}>
                  {duration}
                </option>
              ))}
            </select>
          </div>

          <div className="form-section">
            <label htmlFor="teaching-style">Teaching Styles:</label>
            <select
              id="teaching-style"
              value={teachingStyle}
              onChange={(e) => setTeachingStyle(e.target.value)}
              required
              className="styled-select"
            >
              <option value="">Select Teaching Style</option>
              {teachingStyles.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </div>

          <div className="form-section">
            <label htmlFor="homework-preference">Homework Preference:</label>
            <select
              id="homework-preference"
              value={homeworkPreference}
              onChange={(e) => setHomeworkPreference(e.target.value)}
              required
              className="styled-select"
            >
              <option value="">Select Homework Type</option>
              {homeworkPreferences.map((preference) => (
                <option key={preference} value={preference}>
                  {preference}
                </option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Lesson Plan'}
          </button>
        </form>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {/* Lesson Plan Popup */}
        {showLessonPlanPopup && lessonPlan && (
          <div className="lesson-plan-popup">
            <div className="lesson-plan-content">
              <div className="lesson-plan-header">
                <h2>Generated Lesson Plan</h2>
                <button 
                  className="close-popup"
                  onClick={() => setShowLessonPlanPopup(false)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="html-scroll-container">
                <div 
                  className="html-content"
                  dangerouslySetInnerHTML={{ __html: lessonPlan }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonPlan;