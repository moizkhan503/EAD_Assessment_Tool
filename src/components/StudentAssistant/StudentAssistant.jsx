import React, { useState, useCallback } from 'react';
import DOMPurify from 'dompurify';
import './StudentAssistant.css';

const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const StudentAssistant = () => {
  const [selectedCurriculum, setSelectedCurriculum] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSynthesis = window.speechSynthesis;
  const [utterance, setUtterance] = useState(null);

  const handleSpeak = useCallback(() => {
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (answer) {
      const newUtterance = new SpeechSynthesisUtterance(answer);
      newUtterance.lang = 'en-US';
      newUtterance.rate = 1;
      newUtterance.pitch = 1;
      
      newUtterance.onend = () => {
        setIsSpeaking(false);
      };

      newUtterance.onerror = () => {
        setIsSpeaking(false);
        setError('Speech synthesis failed. Please try again.');
      };

      setUtterance(newUtterance);
      setIsSpeaking(true);
      speechSynthesis.speak(newUtterance);
    }
  }, [answer, isSpeaking]);

  // Cancel speech when component unmounts
  React.useEffect(() => {
    return () => {
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAnswer('');

    try {
      const prompt = `As a student learning assistant for ${selectedSubject} Grade ${selectedGrade} in the ${selectedCurriculum} curriculum, please help with this question: ${question}`;

      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are an AI student assistant. Explain concepts clearly and simply, suitable for the student's grade level. Provide step-by-step explanations when needed.

Format your responses using HTML tags for better readability:
- Use <h1> for main topics
- Use <h2> for subtopics
- Use <h3> for section headings
- Use <p> for paragraphs
- Use <strong> for emphasis
- Use <em> for secondary emphasis
- Use <ul> and <li> for unordered lists
- Use <ol> and <li> for ordered lists
- Use <blockquote> for important quotes or key points
- Use <code> for any code or specific terms
- Create tables using <table>, <tr>, <th>, and <td> when presenting structured data
- Wrap tips in <div class="tip">...</div>
- Wrap notes in <div class="note">...</div>

Make your responses visually appealing and easy to read. Break down complex concepts into clear, well-organized sections with appropriate headings and structure.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.5
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to get response');
      }

      const sanitizedAnswer = DOMPurify.sanitize(data.choices[0].message.content);
      setAnswer(sanitizedAnswer);
    } catch (err) {
      setError(err.message || 'Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lesson-plan-container">
      <div className="content">
        <h1>Student Learning Assistant</h1>
        <p className="description">Get help understanding concepts, solving problems, and improving your study skills</p>

        <form onSubmit={handleSubmit} className="form-content">
          <div className="dropdown-section">
            <div className="form-group">
              <label>Select Your Curriculum</label>
              <select
                value={selectedCurriculum}
                onChange={(e) => setSelectedCurriculum(e.target.value)}
                required
              >
                <option value="">Choose Curriculum</option>
                <option value="ontario">Ontario</option>
              </select>
            </div>

            <div className="form-group">
              <label>Select Your Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                required
              >
                <option value="">Choose Subject</option>
                <option value="math">Mathematics</option>
                <option value="english">English</option>
                <option value="science">Science</option>
              </select>
            </div>

            <div className="form-group">
              <label>Select Your Grade</label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                required
              >
                <option value="">Choose Grade</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((grade) => (
                  <option key={grade} value={grade}>
                    Grade {grade}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Your Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about anything you need help with in your studies..."
              required
              rows="4"
              className="question-input"
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Getting Answer...' : 'Ask Question'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {answer && (
          <div className="generated-content">
            <h2>Here's Your Answer</h2>
            <div className="answer-box" dangerouslySetInnerHTML={{ __html: answer }} />
            <button 
              onClick={handleSpeak} 
              className="voice-button"
              title={isSpeaking ? "Stop Speaking" : "Listen to Answer"}
            >
              {isSpeaking ? "Stop" : "Listen"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAssistant;
