import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();
<<<<<<< HEAD

  const pages = [
    { name: 'Terms', path: '/terms' },
    { name: 'Lesson Plan', path: '/lessonplan' },
    { name: 'Assessment', path: '/assessment' },
=======
  const navItems = [
    { name: 'Assessment', path: '/terms' },
>>>>>>> origin/main
    { name: 'Teacher Assistant', path: '/teacher-assistant' },
    { name: 'Student Assistant', path: '/student-assistant' }
  ];

<<<<<<< HEAD
=======


>>>>>>> origin/main
  return (
    <header>
      <div className="top-header">
        <div className="header-container">
          <Link to="/" className="logo-link">
            <span className="ontario-text">Ontario</span>
          </Link>
<<<<<<< HEAD
=======
          <nav className="assistant-nav">
            <ul className="nav-list">
              {navItems.map((item, index) => (
                <li key={index}>
                  <Link 
                    to={item.path} 
                    className={location.pathname === item.path ? 'active' : ''}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
>>>>>>> origin/main
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
<<<<<<< HEAD
      
      <div className="main-header">
        <div className="header-container">
          <h1 className="site-title">Lesson planning through curriculum</h1>
        </div>
      </div>

      <nav className="main-nav">
        <div className="header-container">
          <ul className="nav-list">
            {pages.map((page, index) => (
              <li key={index}>
                <Link 
                  to={page.path} 
                  className={location.pathname === page.path ? 'active' : ''}
                >
                  {page.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
=======
>>>>>>> origin/main
    </header>
  );
};

export default Header;