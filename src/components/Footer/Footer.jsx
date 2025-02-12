import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-section">
            <h3>About Ontario Curriculum</h3>
            <p>Empowering educators with modern tools to create, manage, and deliver exceptional learning experiences across Ontario.</p>
          </div>

          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="#curriculum">Curriculum</a></li>
              <li><a href="#assessment">Assessment</a></li>
              <li><a href="#resources">Resources</a></li>
              <li><a href="#contact">Contact Us</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Resources</h3>
            <ul>
              <li><a href="#help">Help Center</a></li>
              <li><a href="#guides">Teacher Guides</a></li>
              <li><a href="#updates">Latest Updates</a></li>
              <li><a href="#community">Community</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Connect With Us</h3>
            <div className="social-links">
              <a href="#twitter" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#linkedin" aria-label="LinkedIn">
                <i className="fab fa-linkedin"></i>
              </a>
              <a href="#youtube" aria-label="YouTube">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
            <div className="newsletter">
              <h4>Stay Updated</h4>
              <div className="newsletter-input">
                <input type="email" placeholder="Enter your email" />
                <button type="button">
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-info">
            <p>&copy; 2024 Early Age Development. All rights reserved.</p>
            <div className="footer-links">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Use</a>
              <a href="#accessibility">Accessibility</a>
            </div>
          </div>
          <div className="ontario-brand">
            <span className="ontario-text">Ontario.ca</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 