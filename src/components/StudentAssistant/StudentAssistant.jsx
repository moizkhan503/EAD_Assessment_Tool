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
      const speech = new SpeechSynthesisUtterance(plainText);
      speech.lang = 'en-US';
      speech.rate = 1;
      speech.pitch = 1;
      
      speech.onend = () => {
        setIsSpeaking(false);
      };

      speech.onerror = () => {
        setIsSpeaking(false);
        setError('Speech synthesis failed. Please try again.');
      };

      setUtterance(speech);
      setIsSpeaking(true);
      speechSynthesis.speak(speech);
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
  React.useEffect(() => {
    return () => {
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  const generateResponse = async (question) => {
    try {
      const prompt = `As a student learning assistant for ${selectedSubject} Grade ${selectedGrade} in the ${selectedCurriculum} curriculum, I'd be happy to help with your question. Please provide a clear and concise response that addresses the student's query. 

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

Please ensure your response is visually appealing, easy to read, and addresses the student's question directly.

Here is the student's question: ${question}`;

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

Make your responses visually appealing and easy to read. Break down complex concepts into clear, well-organized sections with appropriate headings and structure.

Please ensure your response is formatted with a white background, black text, headings, and tables.
`
            },
            {
              role: 'assistant',
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
    // For now, just return true
    return true;
  };

  const formatResponse = (response) => {
    // Logic to format response
    return DOMPurify.sanitize(response);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCurriculum || !selectedSubject || !selectedGrade) {
      alert('Please select the curriculum, subject, and grade before asking a question. I am here to assist you!');
      return;
    }

    const greetingKeywords = ['hello', 'hi', 'hey'];
    const isGreeting = greetingKeywords.some(keyword => question.toLowerCase().includes(keyword));

    if (isGreeting) {
      setAnswer('Welcome! How can I assist you today? Feel free to ask any questions.');
      return;
    }

    const specificKeywords = ['course', 'project', 'assignment'];
    const isSpecificRequest = specificKeywords.some(keyword => question.toLowerCase().includes(keyword));

    if (isSpecificRequest) {
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
    } else {
      setAnswer('Please ask about specific courses or projects, and I will be happy to help!');
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
          <button onClick={handleVoiceInput} className="voice-button">
            {isVoiceInput ? "Listening..." : "Ask Question by Voice"}
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
