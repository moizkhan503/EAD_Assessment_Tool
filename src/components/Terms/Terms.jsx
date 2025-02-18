import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
<<<<<<< HEAD
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
  
  // Form states
  const [selectedCurriculum, setSelectedCurriculum] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedTerms, setSelectedTerms] = useState('');
=======
import axios from 'axios';
import './Terms.css';

const Terms = () => {
  const navigate = useNavigate();
>>>>>>> origin/main
  const [projects, setProjects] = useState([]);
  const [assessmentCriteria, setAssessmentCriteria] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedCriteria, setSelectedCriteria] = useState('');
<<<<<<< HEAD

  useEffect(() => {
    const fetchProjects = async () => {
      const response = await fetch('https://apis.earlyagedevelopment.com/api/projects');
      const data = await response.json();
      setProjects(data);
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchAssessmentCriteria = async () => {
      const response = await fetch('https://apis.earlyagedevelopment.com/api/assessment-criteria');
      const data = await response.json();
      setAssessmentCriteria(data);
    };
    fetchAssessmentCriteria();
  }, []);

  const curriculumOptions = [
    { id: 'ontario', name: 'Ontario Curriculum' },
    { id: 'common-core', name: 'US Common Core Curriculum' },
    { id: 'canadian', name: 'Canadian Curriculum' }
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
    } catch (err) {
      console.error('Error generating term plan:', err);
      setError(err.message || 'Failed to generate term plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="terms-page">
      <div className="content">
        <h1>Create Your Curriculum Plan</h1>

        <form onSubmit={handleGeneratePlan}>
          <div className="dropdown-section">
            <label htmlFor="projectSelect">Select Project:</label>
            <select
              id="projectSelect"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              required
            >
              <option value="">Select Project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  <img src={project.project_picture} alt={project.project_title} style={{ borderRadius: '50%', width: '20px', height: '20px', marginRight: '5px' }} />
                  {project.project_title}
                </option>
              ))}
            </select>
          </div>

          <div className="dropdown-section">
            <label htmlFor="criteriaSelect">Select Assessment Criteria:</label>
            <select
              id="criteriaSelect"
              value={selectedCriteria}
              onChange={(e) => setSelectedCriteria(e.target.value)}
              required
            >
              <option value="">Select Criteria</option>
              {assessmentCriteria.map((criteria) => (
                <option key={criteria.id} value={criteria.id}>{criteria.name}</option>
              ))}
            </select>
          </div>

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

        {termPlan && !error && (
          <div className="terms-content">
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
        )}
=======
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch projects
        const projectsResponse = await axios.get('https://apis.earlyagedevelopment.com/api/projects');
        setProjects(projectsResponse.data || []);

        // Fetch assessment criteria
        const criteriaResponse = await axios.get('https://apis.earlyagedevelopment.com/api/assessment-criteria');
        setAssessmentCriteria(criteriaResponse.data?.data || []);
      } catch (err) {
        setError('Failed to fetch data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStartAssessment = async (event) => {
    event.preventDefault();
    
    // Find the selected project and criteria details
    const selectedProjectDetails = projects.find(p => p.id === parseInt(selectedProject));
    const selectedCriteriaDetails = assessmentCriteria.find(c => c.id === parseInt(selectedCriteria));

    if (!selectedProjectDetails || !selectedCriteriaDetails) {
      setError('Please select both project and assessment criteria');
      return;
    }

    // Navigate to assessment page with selected data
    navigate('/assessment', {
      state: {
        project: {
          id: selectedProjectDetails.id,
          title: selectedProjectDetails.project_title
        },
        criteria: selectedCriteriaDetails
      }
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="terms-page">
      <div className="content">
        <form onSubmit={handleStartAssessment}>
          <div className="dropdown-section">
            <div className="form-group">
              <label htmlFor="project">Select Project</label>
              <div className="custom-select">
                <select
                  id="project"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="form-control"
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.project_title}
                    </option>
                  ))}
                </select>
                {selectedProject && (
                  <div className="selected-project">
                    {projects.map((project) => 
                      project.id === parseInt(selectedProject) && (
                        <img 
                          key={project.id}
                          src={project.project_picture} 
                          alt={project.project_title}
                          className="project-thumbnail"
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="criteria">Select Assessment Criteria</label>
              <select
                id="criteria"
                value={selectedCriteria}
                onChange={(e) => setSelectedCriteria(e.target.value)}
                className="form-control"
                required
              >
                <option value="">Select criteria</option>
                {assessmentCriteria.map((criteria) => (
                  <option key={criteria.id} value={criteria.id}>
                    {criteria.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Loading...' : 'Start Assessment'}
          </button>
        </form>
>>>>>>> origin/main
      </div>
    </div>
  );
};

export default Terms;