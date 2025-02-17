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
    </div>
  );
};

export default LessonPlan;