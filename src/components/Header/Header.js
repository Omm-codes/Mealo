import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import './Header.css';
// Import logo from assets directory
import logo from '../../assets/logo.png'; // Update this path to match your actual logo file

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  // Add scroll event listener to add/remove header shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <Link to="/" className="logo">
          <div className="logo-icon">
            <img src={logo} alt="Mealo Logo" className="site-logo" />
          </div>
          <span className="logo-text">Mealo</span>
        </Link>
        
        <button 
          className="mobile-menu-btn" 
          onClick={toggleMenu} 
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span className={`menu-icon ${menuOpen ? 'open' : ''}`}></span>
        </button>
        
        <nav className={`main-nav ${menuOpen ? 'open' : ''}`}>
          <ul className="nav-list">
            <li className="nav-item">
              <NavLink 
                to="/" 
                className={({isActive}) => isActive ? "active" : ""}
                end
              >
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                to="/search" 
                className={({isActive}) => isActive ? "active" : ""}
              >
                Search
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                to="/categories" 
                className={({isActive}) => isActive ? "active" : ""}
              >
                Categories
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                to="/favorites" 
                className={({isActive}) => isActive ? "active" : ""}
              >
                Favorites
              </NavLink>
            </li>
            <li className={`nav-item dropdown ${dropdownOpen ? 'open' : ''}`}>
              <button 
                className="dropdown-title"
                onClick={toggleDropdown}
                aria-expanded={dropdownOpen}
              >
                Tools <span className="dropdown-arrow"></span>
              </button>
              <div className="dropdown-content">
                <NavLink 
                  to="/ai-recipe-generator" 
                  className={({isActive}) => isActive ? "active" : ""}
                >
                  <span className="dropdown-icon"></span>AI Recipe Generator
                </NavLink>
                <NavLink 
                  to="/meal-planner" 
                  className={({isActive}) => isActive ? "active" : ""}
                >
                  <span className="dropdown-icon"></span>Meal Planner
                </NavLink>
                <NavLink 
                  to="/nutrition/659315" 
                  className={({isActive}) => isActive ? "active" : ""}
                >
                  <span className="dropdown-icon"></span>Nutrition Analysis
                </NavLink>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
