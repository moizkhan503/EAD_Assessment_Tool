import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();

  return (
    <header>
      <div className="top-header">
        <div className="header-container">
          <Link to="/" className="logo-link">
            <span className="ontario-text">Ontario</span>
          </Link>
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
            <li>
              <Link 
                to="/terms" 
                className={location.pathname === '/terms' ? 'active' : ''}
              >
                Terms
              </Link>
            </li>
            <li>
              <Link 
                to="/lessonplan" 
                className={location.pathname === '/lessonplan' ? 'active' : ''}
              >
                Lesson Plan
              </Link>
            </li>
            <li>
              <Link 
                to="/assessment" 
                className={location.pathname === '/assessment' ? 'active' : ''}
              >
                Assessment
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;