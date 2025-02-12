import { useEffect, useState, Component } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import axios from 'axios';
import DOMPurify from 'dompurify';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import './Terms.css';

// Register the font
Font.register({
  family: 'Helvetica',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf',
    },
    {
      src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfB.ttf',
      fontWeight: 'bold',
    },
  ],
});

// Update PDF Styles
const pdfStyles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  section: {
    margin: 10,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 30,
  },
  content: {
    fontSize: 12,
    lineHeight: 1.5,
    textAlign: 'justify',
  }
});

// Update PDF Document Component
const PDFDocument = ({ data }) => {
  const processContent = (htmlString) => {
    const div = document.createElement('div');
    div.innerHTML = htmlString;
    return div.innerText || div.textContent || '';
  };

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.title}>{data.title}</Text>
          <Text style={pdfStyles.content}>
            {processContent(data.terms[0].content)}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

PDFDocument.propTypes = {
  data: PropTypes.shape({
    title: PropTypes.string,
    terms: PropTypes.arrayOf(PropTypes.shape({
      content: PropTypes.string,
    }))
  }).isRequired
};

// Update the PDFErrorBoundary component
class PDFErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(_error, errorInfo) {
    console.error('PDF Error:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="pdf-error">
          <p>Unable to generate PDF. Please try again later.</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

PDFErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

const Terms = () => {
  const navigate = useNavigate();
  const [termPlan, setTermPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfData, setPdfData] = useState(null);

  useEffect(() => {
    const fetchTermPlan = async () => {
      try {
        // Get the selected project from localStorage
        const selectedProject = localStorage.getItem('selectedProject');
        if (!selectedProject) {
          throw new Error('No project selected');
        }

        const projectData = JSON.parse(selectedProject);
        console.log('Project Data:', projectData);

        // Make POST request to the lesson-terms generate API
        const response = await axios.post('https://apis.earlyagedevelopment.com/api/lesson-terms/generate', {
          curriculum: projectData.curriculum,
          subject: projectData.subject,
          grade: projectData.grade,
          numberOfTerms: projectData.numberOfTerms
        });
        
        if (!response.data || !response.data.success) {
          throw new Error(response.data?.message || 'Failed to generate term plan');
        }

        // Add detailed logging of the API response
        console.log('Complete API Response:', JSON.stringify(response.data, null, 2));
        console.log('Terms Data:', response.data.data);

        // Instead of formatting to markdown, directly use the HTML content
        const termsData = response.data.data;
        
        // Sanitize the HTML content
        const sanitizedHtml = DOMPurify.sanitize(termsData.termPlan);
        setTermPlan(sanitizedHtml);
        
        // Simplify PDF data structure
        setPdfData({
          title: `${projectData.subject.charAt(0).toUpperCase() + projectData.subject.slice(1)} Grade ${projectData.grade} - ${projectData.curriculum.charAt(0).toUpperCase() + projectData.curriculum.slice(1)} Curriculum`,
          terms: [{
            content: sanitizedHtml
          }]
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching term plan:', err);
        setError(err.message || 'Failed to load term plan');
        setLoading(false);
      }
    };

    fetchTermPlan();
  }, []);

  if (loading) {
    return (
      <div>
        <Header />
        <div className="terms-container loading">
          <div className="loader">Loading your lesson plan...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !termPlan) {
    return (
      <div>
        <Header />
        <div className="terms-container error">
          <div className="error-message">
            <h2>Error Loading Terms</h2>
            <p>{error || 'Failed to load term plan data'}</p>
            <button onClick={() => navigate('/')} className="back-button">
              Go Back
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="terms-container">
        <div className="terms-content">
          {pdfData && (
            <PDFErrorBoundary>
              <div className="pdf-download-button">
                <PDFDownloadLink
                  document={<PDFDocument data={pdfData} />}
                  fileName="term_plan.pdf"
                  className="pdf-button"
                >
                  {({ loading: pdfLoading }) => 
                    pdfLoading ? 'Loading document...' : 'Download PDF'
                  }
                </PDFDownloadLink>
              </div>
            </PDFErrorBoundary>
          )}
          <div className="html-scroll-container">
            <div 
              className="html-content"
              dangerouslySetInnerHTML={{ __html: termPlan }}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Terms; 