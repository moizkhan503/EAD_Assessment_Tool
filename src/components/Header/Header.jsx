// import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header>
      <div className="top-header">
        <div className="header-container">
          <a href="/" className="logo-link">
            <span className="ontario-text">Ontario</span>
          </a>
          <div className="header-right">
            <a href="#francais" className="language-toggle">Français</a>
            <button className="sign-in">
              <i className="fas fa-user-circle"></i>
            </button>
            <button className="help-button">
              <i className="fas fa-question-circle"></i>
            </button>
          </div>
        </div>
      </div>
      
      <div className="main-header">
        <div className="header-container">
          <h1 className="site-title">Lesson planning through curriculum</h1>
        </div>
      </div>

      <nav className="main-nav">
        <div className="header-container">
          <ul className="nav-list">
            {/* <li><a href="#curriculum" className="active">Curriculum</a></li> */}
            {/* <li><a href="#assessment">Assessment and Evaluation</a></li> */}
            {/* <li><a href="#resources">Resources</a></li> */}
            {/* <li><a href="#parents">Parents</a></li> */}
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header; 