import React, { useState } from 'react';
import { ChatGroq } from '@langchain/groq';
import './Assessment.css';

// Initialize the ChatGroq model
const model = new ChatGroq({
  model: 'mixtral-8x7b-32768',
  temperature: 0.5,
  apiKey: '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',
});

const Assessment = () => {
  const [inputText, setInputText] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const generateMCQs = async (text) => {
    try {
      const systemPrompt = `
        You are an assessment generator.
        Generate 5 multiple choice questions based on the following text:
        
        ${text}

        Format your response as a valid JSON array with this exact structure:
        [
          {
            "id": 1,
            "question": "What is X?",
            "options": ["A", "B", "C", "D"],
            "correctAnswer": 0
          }
        ]

        Rules:
        1. Generate exactly 5 questions
        2. Each question must have exactly 4 options
        3. correctAnswer must be 0-3 (index of correct option)
        4. Make questions test understanding of key concepts
        5. All options should be plausible but only one correct
        6. Return ONLY the JSON array, no other text
      `;

      const response = await model.call([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate the MCQs now.' }
      ]);

      console.log('API Response:', response);

      try {
        // Parse the JSON response
        let mcqsData;
        try {
          mcqsData = JSON.parse(response.content);
        } catch (e) {
          // If direct parsing fails, try to extract JSON from the response
          const jsonStart = response.content.indexOf('[');
          const jsonEnd = response.content.lastIndexOf(']') + 1;
          if (jsonStart === -1 || jsonEnd === 0) {
            throw new Error('Could not find JSON array in response');
          }
          const jsonStr = response.content.slice(jsonStart, jsonEnd);
          mcqsData = JSON.parse(jsonStr);
        }
        
        // Validate the structure
        if (!Array.isArray(mcqsData) || mcqsData.length !== 5) {
          throw new Error('Invalid MCQ format: Expected array of 5 questions');
        }

        mcqsData.forEach((mcq, index) => {
          if (!mcq.id || !mcq.question || !Array.isArray(mcq.options) || 
              mcq.options.length !== 4 || typeof mcq.correctAnswer !== 'number') {
            throw new Error(`Invalid question format at index ${index}`);
          }
        });

        return mcqsData;
      } catch (err) {
        console.error('Error parsing MCQs:', err);
        throw new Error('Failed to parse generated questions. Please try again.');
      }
    } catch (err) {
      console.error('Error generating MCQs:', err);
      throw new Error('Failed to generate questions. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) {
      setError('Please enter some text');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Generate questions from the input text
      const generatedQuestions = await generateMCQs(inputText);
      setQuestions(generatedQuestions);
      setSelectedAnswers({});
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const getScore = () => {
    if (questions.length === 0) return 0;
    
    let correct = 0;
    Object.keys(selectedAnswers).forEach(id => {
      const question = questions.find(q => q.id === parseInt(id));
      if (question && selectedAnswers[id] === question.correctAnswer) {
        correct++;
      }
    });
    return (correct / questions.length) * 100;
  };

  return (
    <div className="assessment-container">
      <div className="assessment-content">
        <h1>Assessment Generator</h1>
        <div className="input-section">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="text-input">Enter Text Content</label>
              <textarea
                id="text-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter the text content here..."
                rows={10}
                className="text-input"
              />
              {error && <div className="error-message">{error}</div>}
            </div>
            <button 
              type="submit" 
              className="generate-btn"
              disabled={!inputText.trim() || loading}
            >
              {loading ? 'Generating Questions...' : 'Generate Questions'}
            </button>
          </form>
        </div>

        {questions.length > 0 && (
          <div className="questions-section">
            <h2>Assessment Questions</h2>
            <div className="mcqs-container">
              {questions.map((mcq, index) => (
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
                        onClick={() => handleAnswerSelect(mcq.id, optionIndex)}
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
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {Object.keys(selectedAnswers).length === questions.length && (
              <div className="score-section">
                <h2>Your Score</h2>
                <p className="final-score">{getScore().toFixed(1)}%</p>
                <button 
                  className="generate-btn"
                  onClick={() => {
                    setQuestions([]);
                    setSelectedAnswers({});
                    setInputText('');
                  }}
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Assessment;
