// LessonPlan.jsx
import { useState } from 'react';
import axios from 'axios';
import DOMPurify from 'dompurify';
import './LessonPlan.css'; // Ensure this file exists and is properly linked

const LessonPlan = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [classDuration, setClassDuration] = useState('');
  const [teachingStyle, setTeachingStyle] = useState('');
  const [homeworkPreference, setHomeworkPreference] = useState('');
  const [terms, setTerms] = useState(1);
  const [lessonPlan, setLessonPlan] = useState(''); // State to hold the lesson plan response

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

  const handleTermsChange = (event) => {
    setTerms(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission

    // Prepare the data to be sent to the API
    const formData = {
      data: pdfFile ? pdfFile.name : '', // Send the file name as data
      Classes: terms, // Number of classes
      'Class Duration': classDuration, // Selected class duration
      'Teaching Style': teachingStyle, // Selected teaching style
      'Homework Preference': homeworkPreference, // Selected homework preference
    };

    try {
      const response = await axios.post('https://apis.earlyagedevelopment.com/api/lesson-plan/generate', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Sanitize the HTML response
      const sanitizedLessonPlan = DOMPurify.sanitize(response.data.data.lessonPlan);
      setLessonPlan(sanitizedLessonPlan); // Store the sanitized lesson plan from the response
      console.log('Response from API:', response.data); // Log the response for debugging
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="lesson-plan-container">
      <div className="content">
        <h1>Create Your Lesson Plan</h1>

        <form onSubmit={handleSubmit}>
          <div className="upload-section">
            <label htmlFor="pdf-upload">Upload PDF:</label>
            <input type="file" id="pdf-upload" accept="application/pdf" onChange={handleFileChange} />
          </div>

          <div className="dropdown-section">
            <label htmlFor="class-duration">Class Duration:</label>
            <select
              id="class-duration"
              value={classDuration}
              onChange={(e) => setClassDuration(e.target.value)}
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
            <label htmlFor="homework-preference">Homework Preferences:</label>
            <select
              id="homework-preference"
              value={homeworkPreference}
              onChange={(e) => setHomeworkPreference(e.target.value)}
            >
              <option value="">Select Homework Preference</option>
              {homeworkPreferences.map((preference) => (
                <option key={preference} value={preference}>
                  {preference}
                </option>
              ))}
            </select>
          </div>

          <div className="terms-section">
            <h2>Number of Classes</h2>
            <input
              type="range"
              min="1"
              max="50"
              value={terms}
              onChange={handleTermsChange}
              className="terms-range"
            />
            <span>{terms} classes</span>
          </div>

          <button type="submit" className="submit-button">Submit</button>
        </form>

        {lessonPlan && (
          <div className="response-section">
            <h2>Generated Lesson Plan:</h2>
            <div dangerouslySetInnerHTML={{ __html: lessonPlan }} /> {/* Render the sanitized HTML */}
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonPlan;