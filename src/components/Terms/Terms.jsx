import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import axios from 'axios';
import DOMPurify from 'dompurify';
import './Terms.css';

// Register the font
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf' },
    {
      src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfB.ttf',
      fontWeight: 'bold',
    },
  ],
});

const pdfStyles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica' },
  section: { margin: 10 },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 30 },
  content: { fontSize: 12, lineHeight: 1.5, textAlign: 'justify' }
});

const PDFDocument = ({ data }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.title}>{data.title}</Text>
        <Text style={pdfStyles.content}>
          {data.terms[0].content.replace(/<[^>]*>/g, '')}
        </Text>
      </View>
    </Page>
  </Document>
);

const Terms = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfData, setPdfData] = useState(null);
  const [termPlan, setTermPlan] = useState(null);
  const [showLessonPlanPopup, setShowLessonPlanPopup] = useState(false);
  
  // Form states
  const [selectedCurriculum, setSelectedCurriculum] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedTerms, setSelectedTerms] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedCriteria, setSelectedCriteria] = useState('');
  
  // API Key Modal states
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyError, setApiKeyError] = useState('');
  const [apiKeyLoading, setApiKeyLoading] = useState(false);
  
  useEffect(() => {
    // Check if we need to show the API key modal
    const shouldShowModal = localStorage.getItem('showApiKeyModal') === 'true';
    const hasApiKey = localStorage.getItem('groqApiKey');
    
    if (shouldShowModal && !hasApiKey) {
      setShowApiKeyModal(true);
      // Clear the flag
      localStorage.removeItem('showApiKeyModal');
    }
    
    // Fetch terms data
    const fetchProjects = async () => {
      try {
        const response = await fetch('https://apis.earlyagedevelopment.com/api/projects');
        const data = await response.json();
        setSelectedProject(data.projects[0]?.id || '');
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    fetchProjects();

    const fetchAssessmentCriteria = async () => {
      try {
        const response = await fetch('https://apis.earlyagedevelopment.com/api/assessment-criteria');
        const data = await response.json();
        setSelectedCriteria(data.criteria[0]?.id || '');
      } catch (error) {
        console.error('Error fetching assessment criteria:', error);
      }
    };
    fetchAssessmentCriteria();
  }, []);
  
  const handleApiKeySubmit = (e) => {
    e.preventDefault();
    setApiKeyError('');
    
    if (!apiKey.trim()) {
      setApiKeyError('Please enter your GROQ API key');
      return;
    }
    
    setApiKeyLoading(true);
    
    // Simulate API key validation
    setTimeout(() => {
      // Store the API key
      localStorage.setItem('groqApiKey', apiKey.trim());
      setApiKeyLoading(false);
      setShowApiKeyModal(false);
    }, 800);
  };
  
  const handleSkipApiKey = () => {
    setShowApiKeyModal(false);
  };

  const curriculumOptions = [
    { id: 'ontario', name: 'Ontario Curriculum' },
    { id: 'british_columbia', name: 'British Columbia Curriculum' },
    { id: 'alberta', name: 'Alberta Curriculum' }
  ];

  const subjectOptions = [
    { id: 'english', name: 'English' },
    { id: 'maths', name: 'Maths' },
    { id: 'science', name: 'Science' }
  ];

  const gradeOptions = [2, 3, 4, 5];
  const termOptions = [2, 3, 4];

  const handleGeneratePlan = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = {
        curriculum: selectedCurriculum,
        subject: selectedSubject,
        grade: selectedGrade.toString(),
        numberOfTerms: parseInt(selectedTerms)
      };

      localStorage.setItem('selectedProject', JSON.stringify(formData));

      const response = await axios.post('https://apis.earlyagedevelopment.com/api/lesson-terms/generate', formData);
      
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Failed to generate term plan');
      }

      const termsData = response.data.data;
      const sanitizedHtml = DOMPurify.sanitize(termsData.termPlan);
      setTermPlan(sanitizedHtml);
      
      setPdfData({
        title: `${selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1)} Grade ${selectedGrade} - ${selectedCurriculum.charAt(0).toUpperCase() + selectedCurriculum.slice(1)} Curriculum`,
        terms: [{ content: sanitizedHtml }]
      });
      
      // Show the lesson plan popup
      setShowLessonPlanPopup(true);
    } catch (err) {
      console.error('Error generating term plan:', err);
      setError(err.message || 'Failed to generate term plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="terms-page">
      {showApiKeyModal && (
        <div className="api-key-modal">
          <div>
            <h2>Enter your GROQ API key</h2>
            <form onSubmit={handleApiKeySubmit}>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your GROQ API key"
              />
              {apiKeyError && (
                <div className="error-message">
                  <p>{apiKeyError}</p>
                </div>
              )}
              <button type="submit" disabled={apiKeyLoading}>
                {apiKeyLoading ? 'Validating...' : 'Submit'}
              </button>
              <button type="button" onClick={handleSkipApiKey}>
                Skip for now
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Lesson Plan Popup */}
      {showLessonPlanPopup && termPlan && (
        <div className="lesson-plan-popup">
          <div className="lesson-plan-content">
            <div className="lesson-plan-header">
              <h2>Generated Curriculum Plan</h2>
              <button 
                className="close-popup"
                onClick={() => setShowLessonPlanPopup(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            {pdfData && (
              <div className="pdf-download-button">
                <PDFDownloadLink
                  document={<PDFDocument data={pdfData} />}
                  fileName="curriculum_plan.pdf"
                  className="pdf-button"
                >
                  {({ loading }) => (loading ? 'Preparing PDF...' : 'Download PDF')}
                </PDFDownloadLink>
              </div>
            )}
            
            <div className="html-scroll-container">
              <div 
                className="html-content"
                dangerouslySetInnerHTML={{ __html: termPlan }}
              />
            </div>
          </div>
        </div>
      )}
      
      <div className="content">
        <h1>Create Your Curriculum Plan</h1>

        <form onSubmit={handleGeneratePlan} className="terms-form">
          <div className="dropdown-section">
            <label htmlFor="curriculum">Select Curriculum:</label>
            <select
              id="curriculum"
              value={selectedCurriculum}
              onChange={(e) => setSelectedCurriculum(e.target.value)}
              required
            >
              <option value="">Select Curriculum</option>
              {curriculumOptions.map(curriculum => (
                <option key={curriculum.id} value={curriculum.id}>
                  {curriculum.name}
                </option>
              ))}
            </select>
          </div>

          <div className="dropdown-section">
            <label htmlFor="subject">Select Subject:</label>
            <select
              id="subject"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              required
            >
              <option value="">Select Subject</option>
              {subjectOptions.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div className="dropdown-section">
            <label htmlFor="grade">Select Grade:</label>
            <select
              id="grade"
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              required
            >
              <option value="">Select Grade</option>
              {gradeOptions.map(grade => (
                <option key={grade} value={grade}>
                  Grade {grade}
                </option>
              ))}
            </select>
          </div>

          <div className="dropdown-section">
            <label htmlFor="terms">Number of Terms:</label>
            <select
              id="terms"
              value={selectedTerms}
              onChange={(e) => setSelectedTerms(e.target.value)}
              required
            >
              <option value="">Select Number of Terms</option>
              {termOptions.map(term => (
                <option key={term} value={term}>
                  {term} {term === 1 ? 'Term' : 'Terms'}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Curriculum Plan'}
          </button>
        </form>

        {error && (
          <div className="error-message">
            <h2>Error</h2>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Terms;