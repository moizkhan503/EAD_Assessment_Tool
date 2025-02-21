import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChatGroq } from '@langchain/groq';
import * as pdfjsLib from 'pdfjs-dist';
import './Assessment.css';
import AssessmentCharts from './AssessmentCharts';

// Manually implemented Card components
const Card = ({ children, className = '', ...props }) => (
  <div className={`border rounded-lg shadow-sm p-4 ${className}`} {...props}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`border-b pb-2 mb-2 ${className}`} {...props}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`text-lg font-semibold ${className}`} {...props}>
    {children}
  </h3>
);

const CardContent = ({ children, className = '', ...props }) => (
  <div className={`mt-2 ${className}`} {...props}>
    {children}
  </div>
);

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const model = new ChatGroq({
  model: 'mixtral-8x7b-32768',
  temperature: 0.5,
  apiKey: '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',
});

const Assessment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { project, criteria } = location.state || {};

  const [mcqs, setMcqs] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deliverables, setDeliverables] = useState({});
  const [evaluation, setEvaluation] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [aiOpinion, setAiOpinion] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!project || !criteria) {
      navigate('/terms');
      return;
    }
    generateMCQs();
  }, [project, criteria, navigate]);

  const generateMCQs = async () => {
    try {
      const prompt = `Generate 10 multiple choice questions (MCQs) for assessing knowledge of ${project.title}. 
        The assessment criteria is: ${criteria.name}.

        Return the MCQs in the following JSON format:
        {
          "mcqs": [
            {
              "question": "Question text here",
              "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
              "correctAnswer": 0,
              "explanation": "Explanation for the correct answer"
            }
          ]
        }`;

      const response = await model.call([
        { role: 'system', content: prompt },
        { role: 'user', content: 'Generate MCQs in the specified JSON format.' }
      ]);

      const jsonStr = response.content.trim().replace(/^[^{]*/, '').replace(/[^}]*$/, '');
      const parsedResponse = JSON.parse(jsonStr);

      if (!parsedResponse.mcqs || !Array.isArray(parsedResponse.mcqs)) {
        throw new Error('Invalid MCQ format: mcqs array not found');
      }

      const validatedMcqs = parsedResponse.mcqs.map((mcq, index) => {
        const sanitizeStr = (str) => String(str).replace(/[\x00-\x1F\x7F-\x9F]/g, '');
        
        return {
          id: index + 1,
          question: sanitizeStr(mcq.question) || `Question ${index + 1}`,
          options: Array.isArray(mcq.options) 
            ? mcq.options.map(sanitizeStr).slice(0, 4) 
            : ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: typeof mcq.correctAnswer === 'number' && mcq.correctAnswer >= 0 && mcq.correctAnswer <= 3 
            ? mcq.correctAnswer 
            : 0,
          explanation: sanitizeStr(mcq.explanation) || 'No explanation provided'
        };
      });

      setMcqs(validatedMcqs);
      setError(null);
    } catch (error) {
      console.error('Error generating MCQs:', error);
      setError('Failed to generate questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
      throw new Error('Failed to read PDF content');
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleDeliverableUpload = async (deliverableType, file) => {
    try {
      const text = await extractTextFromPdf(file);
      setDeliverables(prev => ({
        ...prev,
        [deliverableType]: { file, text }
      }));
    } catch (error) {
      setError('Error reading PDF file. Please try again.');
    }
  };

  const evaluateSubmission = async () => {
    setIsEvaluating(true);
    try {
      const deliverableTexts = Object.values(deliverables).map(d => d.text).join('\n\n');
      
      const prompt = `
        You are an expert assessment evaluator. Evaluate this submission based on:

        Project: ${project.title}
        Assessment Criteria: ${criteria.name}
        Objective: ${criteria.objective}
        Tasks: ${criteria.tasks}
        Rubrics: ${JSON.stringify(criteria.rubrics)}

        MCQ Answers: ${JSON.stringify(selectedAnswers)}
        Deliverable Content: ${deliverableTexts}

        Provide evaluation in this JSON format:
        {
          "mcq_evaluation": {
            "score": "X/10",
            "feedback": "Detailed feedback"
          },
          "rubric_evaluation": [
            {
              "criteria": "Criteria Name",
              "level": "Achieved Level",
              "score": "X/10",
              "feedback": "Detailed feedback"
            }
          ],
          "total_score": "X/30",
          "improvement_suggestions": [
            "Detailed suggestions"
          ],
          "ai_opinion": "Comprehensive analysis and recommendations"
        }`;

      const response = await model.call([
        { role: 'system', content: prompt },
        { role: 'user', content: 'Evaluate the submission now.' }
      ]);

      const result = JSON.parse(response.content);
      setEvaluation(result);
      setAiOpinion(result.ai_opinion);
      setShowResults(true);
    } catch (err) {
      setError('Error evaluating submission. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const playAiOpinion = () => {
    if ('speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance(aiOpinion);
      speech.onend = () => setIsPlaying(false);
      setIsPlaying(true);
      window.speechSynthesis.speak(speech);
    }
  };

  const stopAiOpinion = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  if (loading) {
    return <div className="loading">Generating assessment questions...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (showResults) {
    return (
      <div className="assessment-container">
        <div className="results-header">
          <h2>Assessment Results</h2>
          <h3>{project.title}</h3>
          <p className="criteria-name">{criteria.name}</p>
        </div>

        <div className="results-content">
          <div className="results-container">
            <AssessmentCharts evaluation={evaluation} />

            <div className="score-overview">
              <h3>Total Score: {evaluation.total_score}</h3>
            </div>

            <div className="evaluation-section">
              <h3>MCQ Evaluation</h3>
              <Card>
                <CardContent>
                  <p className="score">Score: {evaluation.mcq_evaluation.score}</p>
                  <p className="feedback">{evaluation.mcq_evaluation.feedback}</p>
                </CardContent>
              </Card>
            </div>

            <div className="evaluation-section">
              <h3>Rubric Evaluation</h3>
              <div className="rubric-table">
                <table>
                  <thead>
                    <tr>
                      <th>Criteria</th>
                      <th>Level</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluation.rubric_evaluation.map((item, index) => (
                      <tr key={index}>
                        <td>{item.criteria}</td>
                        <td>{item.level}</td>
                        <td>{item.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="improvement-section">
              <h3>Areas for Improvement</h3>
              <ul>
                {evaluation.improvement_suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>

            <div className="ai-opinion-section">
              <h3>AI Opinion</h3>
              <Card>
                <CardContent>
                  <p>{aiOpinion}</p>
                  <button 
                    className="voice-button"
                    onClick={isPlaying ? stopAiOpinion : playAiOpinion}
                  >
                    {isPlaying ? 'Stop AI Voice' : 'Play AI Voice'}
                  </button>
                </CardContent>
              </Card>
            </div>

            <button 
              className="new-assessment-button"
              onClick={() => navigate('/terms')}
            >
              Start New Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="assessment-container">
      <div className="assessment-header">
        <h2>{project.title}</h2>
        <p className="criteria-name">{criteria.name}</p>
      </div>

      <div className="assessment-content">
        <div className="mcq-section">
          <h3>Multiple Choice Questions</h3>
          {mcqs.map((mcq, index) => (
            <Card key={mcq.id} className="question-card">
              <CardHeader>
                <CardTitle>Question {index + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{mcq.question}</p>
                <div className="options">
                  {mcq.options.map((option, optIndex) => (
                    <label key={optIndex} className="option-label">
                      <input
                        type="radio"
                        name={`question-${mcq.id}`}
                        value={optIndex}
                        checked={selectedAnswers[mcq.id] === optIndex}
                        onChange={() => handleAnswerSelect(mcq.id, optIndex)}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="deliverables-section">
          <h3>Upload Deliverables</h3>
          {criteria.deliverables.map((deliverable, index) => (
            <Card key={index} className="deliverable-item">
              <CardContent>
                <p>{deliverable}</p>
                <input
                  type="file"
                  onChange={(e) => handleDeliverableUpload(index, e.target.files[0])}
                  accept=".pdf"
                />
              </CardContent>
            </Card>
          ))}
        </div>

        <button 
          className="submit-button"
          onClick={evaluateSubmission}
          disabled={
            isEvaluating || 
            Object.keys(selectedAnswers).length !== mcqs.length ||
            Object.keys(deliverables).length !== criteria.deliverables.length
          }
        >
          {isEvaluating ? 'Evaluating...' : 'Submit for Evaluation'}
        </button>
      </div>
    </div>
  );
};

export default Assessment;