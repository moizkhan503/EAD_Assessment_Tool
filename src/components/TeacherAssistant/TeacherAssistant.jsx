import React, { useState, useCallback, useEffect } from 'react';
import DOMPurify from 'dompurify';
import './TeacherAssistant.css';

const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const TeacherAssistant = () => {
  const [selectedCurriculum, setSelectedCurriculum] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceInput, setIsVoiceInput] = useState(false);
  const speechSynthesis = window.speechSynthesis;
  const [utterance, setUtterance] = useState(null);

  const handleSpeak = useCallback(() => {
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (answer) {
      // Strip HTML tags from the answer
      const plainText = answer.replace(/<[^>]+>/g, '');
      const newUtterance = new SpeechSynthesisUtterance(plainText);
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

  const handleVoiceInput = () => {
    setIsVoiceInput(true);
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuestion(transcript);
      handleSubmit(); // Submit the question after capturing voice input
      setIsVoiceInput(false);
    };
    recognition.start();
  };

  // Cancel speech when component unmounts
  useEffect(() => {
    return () => {
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  const generateResponse = async (question) => {
    try {
      const prompt = `As a teacher assistant for ${selectedSubject} Grade ${selectedGrade} in the ${selectedCurriculum} curriculum, please help with this question: ${question}`;

      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-specdec',
          messages: [
            {
              role: 'system',
              content: `You are an AI teacher assistant. Help teachers create effective lesson plans, provide teaching strategies, and suggest educational resources.

Format your responses using HTML tags for better readability:
- Use <h1> for main topics
- Use <h2> for subtopics
- Use <h3> for section headings
- Use <p> for paragraphs
              `
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

      return data.choices[0].message.content;
    } catch (err) {
      setError(err.message || 'Failed to get response');
      return null;
    }
  };

  const isValidResponse = (response) => {
    // Logic to check if response is related to selected curriculum, subject, and grade
    return true; // For now, just return true
  };

  const formatResponse = (response) => {
    const sanitizedAnswer = DOMPurify.sanitize(response);
    return `<div style="background-color: white; color: black;">${sanitizedAnswer}</div>`;
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }

    if (!selectedCurriculum || !selectedSubject || !selectedGrade) {
      alert('Please select curriculum, subject, and grade before asking a question.');
      return;
    }

    setLoading(true);
    setError('');
    setAnswer('');

    const response = await generateResponse(question);
    if (!response) {
      setLoading(false);
      return;
    }

    if (!isValidResponse(response)) {
      alert('This question is not related to the selected curriculum, subject, or grade.');
      setLoading(false);
      return;
    }

    setAnswer(formatResponse(response));
    setLoading(false);
  };

  return (
    <div className="lesson-plan-container">
      <div className="content">
        <h1>Teacher Assistant</h1>
        <p className="description">Get help with lesson planning, teaching strategies, and educational resources</p>

        <form onSubmit={handleSubmit} className="form-content">
          <div className="dropdown-section">
            <div className="form-group">
              <label>Select Curriculum</label>
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
              <label>Select Subject</label>
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
              <label>Select Grade</label>
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
              placeholder="Ask about lesson planning, teaching strategies, or any other teaching-related questions..."
              required
              rows="4"
              className="question-input"
              disabled={isVoiceInput}
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Getting Answer...' : 'Ask Question'}
          </button>
          <button 
            onClick={handleVoiceInput} 
            className="voice-button"
            title="Ask Question by Voice"
          >
            Ask by Voice
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

export default TeacherAssistant;