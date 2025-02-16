import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Terms.css';

const Terms = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [assessmentCriteria, setAssessmentCriteria] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedCriteria, setSelectedCriteria] = useState('');
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
      </div>
    </div>
  );
};

export default Terms;