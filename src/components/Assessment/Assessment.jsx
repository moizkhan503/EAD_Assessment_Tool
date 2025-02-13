import React, { useState } from 'react';
import { ChatGroq } from '@langchain/groq';
import * as pdfjsLib from 'pdfjs-dist';
import './Assessment.css';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Initialize the ChatGroq model
const model = new ChatGroq({
  model: 'mixtral-8x7b-32768',
  temperature: 0.5,
  apiKey: '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',
});

const Assessment = () => {
  const [inputText, setInputText] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [mcqs, setMcqs] = useState([]);
  const [shortQuestions, setShortQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [shortAnswers, setShortAnswers] = useState({});
  const [shortAnswerFeedback, setShortAnswerFeedback] = useState({});

  const extractTextFromPdf = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + ' ';
      }

      return fullText.trim();
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to read PDF content. Please try a different file.');
    }
  };

  const generateQuestions = async (text) => {
    try {
      // Generate MCQs with focus on concepts
      const mcqPrompt = `
        You are an expert assessment system. Analyze the given text and generate conceptual multiple choice questions.
        Focus on testing understanding of:
        1. Core concepts and principles
        2. Logical relationships between ideas
        3. Application of concepts
        4. Critical thinking and analysis
        5. Cause and effect relationships

        Generate 5 multiple choice questions based on the following text:
        
        ${text}

        Format your response as a valid JSON array with this exact structure:
        [
          {
            "id": 1,
            "question": "What is X?",
            "options": ["A", "B", "C", "D"],
            "correctAnswer": 0,
            "explanation": "Detailed explanation of why this is the correct answer and why others are incorrect"
          }
        ]

        Rules:
        1. Generate exactly 5 questions
        2. Each question must have exactly 4 options
        3. correctAnswer must be 0-3 (index of correct option)
        4. Questions should test deep understanding, not just memorization
        5. Include tricky but plausible incorrect options
        6. Add a detailed explanation for each question
        7. Return ONLY the JSON array, no other text
      `;

      const mcqResponse = await model.call([
        { role: 'system', content: mcqPrompt },
        { role: 'user', content: 'Generate the MCQs now.' }
      ]);

      // Generate conceptual short questions
      const shortPrompt = `
        You are an expert assessment system. Generate in-depth conceptual questions that test deep understanding.
        Focus on:
        1. Core theoretical concepts
        2. Problem-solving abilities
        3. Critical analysis
        4. Application of principles
        5. Cause-effect relationships
        
        Generate 2 short answer questions based on the following text:
        
        ${text}

        Format your response as a valid JSON array with this exact structure:
        [
          {
            "id": 1,
            "question": "What is X?",
            "expectedAnswer": "Detailed model answer that covers all key points",
            "keyPoints": [
              {
                "point": "Key concept or idea that must be present",
                "explanation": "Why this point is important and how it should be explained"
              }
            ],
            "commonMisconceptions": [
              "List common incorrect understandings or partial answers"
            ],
            "gradingCriteria": {
              "excellent": "What constitutes a full score answer",
              "good": "What constitutes a high score answer",
              "fair": "What constitutes a medium score answer",
              "poor": "What constitutes a low score answer",
              "zero": "What constitutes a zero score answer"
            }
          }
        ]

        Rules:
        1. Generate exactly 2 questions
        2. Questions should require detailed explanations
        3. Key points should be specific and measurable
        4. Include common misconceptions to watch for
        5. Provide clear grading criteria
        6. Return ONLY the JSON array, no other text
      `;

      const shortResponse = await model.call([
        { role: 'system', content: shortPrompt },
        { role: 'user', content: 'Generate the short questions now.' }
      ]);

      // Parse MCQs
      let mcqsData;
      try {
        mcqsData = JSON.parse(mcqResponse.content);
      } catch (e) {
        const jsonStart = mcqResponse.content.indexOf('[');
        const jsonEnd = mcqResponse.content.lastIndexOf(']') + 1;
        if (jsonStart === -1 || jsonEnd === 0) {
          throw new Error('Could not find MCQ JSON array in response');
        }
        const jsonStr = mcqResponse.content.slice(jsonStart, jsonEnd);
        mcqsData = JSON.parse(jsonStr);
      }

      // Parse short questions
      let shortData;
      try {
        shortData = JSON.parse(shortResponse.content);
      } catch (e) {
        const jsonStart = shortResponse.content.indexOf('[');
        const jsonEnd = shortResponse.content.lastIndexOf(']') + 1;
        if (jsonStart === -1 || jsonEnd === 0) {
          throw new Error('Could not find short questions JSON array in response');
        }
        const jsonStr = shortResponse.content.slice(jsonStart, jsonEnd);
        shortData = JSON.parse(jsonStr);
      }

      return { mcqs: mcqsData, shortQuestions: shortData };
    } catch (err) {
      console.error('Error generating questions:', err);
      throw new Error('Failed to generate questions. Please try again.');
    }
  };

  const validateShortAnswer = async (questionId, userAnswer, question) => {
    try {
      // Skip validation for empty or "I don't know" answers
      if (!userAnswer?.trim() || /^(i\s+don'?t\s+know|idk)$/i.test(userAnswer.trim())) {
        setShortAnswerFeedback(prev => ({
          ...prev,
          [questionId]: {
            score: 0,
            feedback: "No answer provided or stated 'I don't know'. Please attempt to answer the question.",
            keyPointsCovered: [],
            keyPointsMissing: question.keyPoints.map(kp => kp.point),
            misconceptions: [],
            suggestions: [
              "Review the relevant section in the material",
              "Try to explain the concept in your own words",
              "Connect the concept to real-world examples"
            ]
          }
        }));
        return;
      }

      const validationPrompt = `
        You are an expert grader. Evaluate this answer based on the following criteria:
        
        Question: ${question.question}
        Expected Answer: ${question.expectedAnswer}
        Key Points: ${JSON.stringify(question.keyPoints)}
        Common Misconceptions: ${JSON.stringify(question.commonMisconceptions)}
        Grading Criteria: ${JSON.stringify(question.gradingCriteria)}

        User's answer: "${userAnswer}"

        Provide a detailed evaluation in this JSON format:
        {
          "score": 85,
          "feedback": "Detailed, constructive feedback about the answer's strengths and weaknesses",
          "keyPointsCovered": [
            {
              "point": "Key point that was covered",
              "quality": "How well it was explained"
            }
          ],
          "keyPointsMissing": [
            {
              "point": "Key point that was missing",
              "importance": "Why this point was important"
            }
          ],
          "misconceptions": [
            "Any misconceptions demonstrated in the answer"
          ],
          "suggestions": [
            "Specific suggestions for improvement"
          ]
        }

        Rules:
        1. Be thorough but constructive in feedback
        2. Score should reflect understanding of concepts
        3. Identify both strengths and areas for improvement
        4. Provide actionable suggestions
        5. Return ONLY the JSON object
      `;

      const response = await model.call([
        { role: 'system', content: validationPrompt },
        { role: 'user', content: 'Evaluate the answer now.' }
      ]);

      let feedback;
      try {
        feedback = JSON.parse(response.content);
      } catch (e) {
        const jsonStart = response.content.indexOf('{');
        const jsonEnd = response.content.lastIndexOf('}') + 1;
        if (jsonStart === -1 || jsonEnd === 0) {
          throw new Error('Could not find feedback JSON in response');
        }
        const jsonStr = response.content.slice(jsonStart, jsonEnd);
        feedback = JSON.parse(jsonStr);
      }

      setShortAnswerFeedback(prev => ({
        ...prev,
        [questionId]: feedback
      }));
    } catch (err) {
      console.error('Error validating answer:', err);
      setShortAnswerFeedback(prev => ({
        ...prev,
        [questionId]: { error: 'Failed to validate answer. Please try again.' }
      }));
    }
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setInputText('');
      setError(null);
    } else if (file) {
      setError('Please select a valid PDF file');
      setPdfFile(null);
    }
  };

  const handleTextChange = (e) => {
    setInputText(e.target.value);
    setPdfFile(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText && !pdfFile) {
      setError('Please enter text or upload a PDF file');
      return;
    }

    setLoading(true);
    setError(null);
    setMcqs([]);
    setShortQuestions([]);
    setSelectedAnswers({});
    setShortAnswers({});
    setShortAnswerFeedback({});

    try {
      let textContent = inputText;
      
      if (pdfFile) {
        textContent = await extractTextFromPdf(pdfFile);
        if (!textContent.trim()) {
          throw new Error('Could not extract text from PDF. Please try a different file.');
        }
      }

      const { mcqs: generatedMcqs, shortQuestions: generatedShort } = await generateQuestions(textContent);
      setMcqs(generatedMcqs);
      setShortQuestions(generatedShort);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMcqSelect = (questionId, answerIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleShortAnswerChange = (questionId, answer) => {
    setShortAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleShortAnswerSubmit = (question) => {
    const answer = shortAnswers[question.id];
    if (answer && answer.trim()) {
      validateShortAnswer(question.id, answer, question);
    }
  };

  const getMcqScore = () => {
    if (mcqs.length === 0) return 0;
    
    let correct = 0;
    Object.keys(selectedAnswers).forEach(id => {
      const question = mcqs.find(q => q.id === parseInt(id));
      if (question && selectedAnswers[id] === question.correctAnswer) {
        correct++;
      }
    });
    return (correct / mcqs.length) * 100;
  };

  const getShortAnswerScore = () => {
    if (shortQuestions.length === 0) return 0;
    
    let totalScore = 0;
    let answeredQuestions = 0;
    
    Object.keys(shortAnswerFeedback).forEach(id => {
      const feedback = shortAnswerFeedback[id];
      if (feedback && !feedback.error && feedback.score) {
        totalScore += feedback.score;
        answeredQuestions++;
      }
    });
    
    return answeredQuestions > 0 ? totalScore / answeredQuestions : 0;
  };

  return (
    <div className="assessment-container">
      <div className="assessment-content">
        <h1>Assessment Generator</h1>
        <div className="input-section">
          <form onSubmit={handleSubmit}>
            <div className="input-options">
              <div className="form-group">
                <label htmlFor="text-input">Enter Text Content</label>
                <textarea
                  id="text-input"
                  value={inputText}
                  onChange={handleTextChange}
                  placeholder="Enter the text content here..."
                  rows={6}
                  className="text-input"
                  disabled={pdfFile !== null}
                />
              </div>
              <div className="form-group">
                <label htmlFor="pdf-upload">Or Upload PDF</label>
                <input
                  type="file"
                  id="pdf-upload"
                  accept=".pdf"
                  onChange={handlePdfChange}
                  className="file-input"
                  disabled={inputText.trim() !== ''}
                />
                {pdfFile && (
                  <div className="file-info">
                    Selected file: {pdfFile.name}
                  </div>
                )}
              </div>
              {error && <div className="error-message">{error}</div>}
            </div>
            <button 
              type="submit" 
              className="generate-btn"
              disabled={(!inputText.trim() && !pdfFile) || loading}
            >
              {loading ? 'Generating Questions...' : 'Generate Questions'}
            </button>
          </form>
        </div>

        {mcqs.length > 0 && (
          <div className="questions-section">
            <h2>Conceptual Multiple Choice Questions</h2>
            <div className="mcqs-container">
              {mcqs.map((mcq, index) => (
                <div key={mcq.id} className="question-card">
                  <h3>Question {index + 1}</h3>
                  <p>{mcq.question}</p>
                  <div className="options">
                    {mcq.options.map((option, optionIndex) => (
                      <div 
                        key={optionIndex} 
                        className={`option ${
                          selectedAnswers[mcq.id] !== undefined ? (
                            optionIndex === mcq.correctAnswer ? 
                              'correct' : 
                              selectedAnswers[mcq.id] === optionIndex ? 
                                'incorrect' : ''
                          ) : ''
                        }`}
                        onClick={() => handleMcqSelect(mcq.id, optionIndex)}
                      >
                        <input
                          type="radio"
                          id={`q${mcq.id}-option${optionIndex}`}
                          name={`question${mcq.id}`}
                          checked={selectedAnswers[mcq.id] === optionIndex}
                          onChange={() => {}}
                        />
                        <label htmlFor={`q${mcq.id}-option${optionIndex}`}>
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                  {selectedAnswers[mcq.id] !== undefined && (
                    <div className={`answer-feedback ${
                      selectedAnswers[mcq.id] === mcq.correctAnswer ? 'correct' : 'incorrect'
                    }`}>
                      {selectedAnswers[mcq.id] === mcq.correctAnswer ? 
                        '✓ Correct!' : 
                        `✗ Incorrect. The correct answer is: ${mcq.options[mcq.correctAnswer]}`
                      }
                      <div className="explanation">
                        <strong>Explanation:</strong> {mcq.explanation}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {shortQuestions.length > 0 && (
          <div className="questions-section">
            <h2>Conceptual Short Answer Questions</h2>
            <div className="short-questions-container">
              {shortQuestions.map((question, index) => (
                <div key={question.id} className="question-card">
                  <h3>Question {index + 1}</h3>
                  <p>{question.question}</p>
                  <div className="short-answer">
                    <textarea
                      value={shortAnswers[question.id] || ''}
                      onChange={(e) => handleShortAnswerChange(question.id, e.target.value)}
                      placeholder="Type your answer here..."
                      rows={4}
                      className="short-answer-input"
                    />
                    <button
                      className="submit-answer-btn"
                      onClick={() => handleShortAnswerSubmit(question)}
                      disabled={!shortAnswers[question.id]?.trim()}
                    >
                      Submit Answer
                    </button>
                  </div>
                  {shortAnswerFeedback[question.id] && !shortAnswerFeedback[question.id].error && (
                    <div className="short-answer-feedback">
                      <div className="feedback-score">
                        Score: {shortAnswerFeedback[question.id].score}%
                      </div>
                      <div className="feedback-text">
                        {shortAnswerFeedback[question.id].feedback}
                      </div>
                      <div className="feedback-points">
                        {shortAnswerFeedback[question.id].keyPointsCovered.length > 0 && (
                          <div className="points-covered">
                            <h4>Concepts Well Understood:</h4>
                            <ul>
                              {shortAnswerFeedback[question.id].keyPointsCovered.map((point, i) => (
                                <li key={i}>
                                  <strong>{point.point}</strong>
                                  <p>{point.quality}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {shortAnswerFeedback[question.id].keyPointsMissing.length > 0 && (
                          <div className="points-missing">
                            <h4>Concepts to Review:</h4>
                            <ul>
                              {shortAnswerFeedback[question.id].keyPointsMissing.map((point, i) => (
                                <li key={i}>
                                  <strong>{point.point}</strong>
                                  <p>{point.importance}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      {shortAnswerFeedback[question.id].misconceptions.length > 0 && (
                        <div className="misconceptions">
                          <h4>Common Misconceptions Found:</h4>
                          <ul>
                            {shortAnswerFeedback[question.id].misconceptions.map((misc, i) => (
                              <li key={i}>{misc}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="suggestions">
                        <h4>Suggestions for Improvement:</h4>
                        <ul>
                          {shortAnswerFeedback[question.id].suggestions.map((sugg, i) => (
                            <li key={i}>{sugg}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  {shortAnswerFeedback[question.id]?.error && (
                    <div className="error-message">
                      {shortAnswerFeedback[question.id].error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {(Object.keys(selectedAnswers).length === mcqs.length && 
          Object.keys(shortAnswerFeedback).length === shortQuestions.length) && (
          <div className="score-section">
            <h2>Your Scores</h2>
            <div className="score-details">
              <div className="score-item">
                <h3>Multiple Choice Questions</h3>
                <p className="score">{getMcqScore().toFixed(1)}%</p>
              </div>
              <div className="score-item">
                <h3>Short Answer Questions</h3>
                <p className="score">{getShortAnswerScore().toFixed(1)}%</p>
              </div>
              <div className="score-item">
                <h3>Overall Score</h3>
                <p className="final-score">
                  {((getMcqScore() + getShortAnswerScore()) / 2).toFixed(1)}%
                </p>
              </div>
            </div>
            <button 
              className="generate-btn"
              onClick={() => {
                setMcqs([]);
                setShortQuestions([]);
                setSelectedAnswers({});
                setShortAnswers({});
                setShortAnswerFeedback({});
                setInputText('');
                setPdfFile(null);
              }}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assessment;
