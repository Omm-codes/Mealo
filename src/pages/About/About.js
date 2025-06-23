import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';
import teamImage from '../../assets/team.jpg'; // You'll need to add this image to your assets folder
import founderImage from '../../assets/founder.jpg'; // Add founder image to assets folder

function About() {
  return (
    <div className="about-page">
      <div className="about-header">
        <h2 className="page-title">About MEALO</h2>
        <p className="about-subtitle">
          Discover our story, mission, and the team behind your favorite recipe platform
        </p>
      </div>
      
      <div className="about-section">
        <div className="about-content">
          <h3>Our Story</h3>
          <p>
            MEALO began in 2025 with a simple idea: make cooking accessible and enjoyable for everyone. 
            As food enthusiasts ourselves, we found that existing recipe platforms were either too complex 
            or too basic for everyday use.
          </p>
          <p>
            We set out to create an intuitive, feature-rich platform that combines traditional recipes 
            with modern AI technology, helping everyone from beginners to experienced chefs find 
            inspiration in the kitchen.
          </p>
          <div className="about-highlight">
            <svg viewBox="0 0 24 24" width="24" height="24" className="quote-icon">
              <path fill="currentColor" d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/>
            </svg>
            <p className="highlight-text">
              We believe that cooking should be accessible, enjoyable, and tailored to your unique tastes and dietary needs.
            </p>
          </div>
        </div>
        <div className="about-image-container">
          <img src={teamImage} alt="MEALO Team" className="about-image" />
        </div>
      </div>
      
      <div className="about-section reverse">
        <div className="about-content">
          <h3>Our Mission</h3>
          <p>
            We believe good food brings people together. Our mission is to empower users to explore 
            global cuisines, discover new recipes tailored to their preferences, and build confidence 
            in their cooking skills.
          </p>
          <p>
            By combining traditional recipes with cutting-edge AI technology, we're creating a cooking 
            experience that's both educational and personalized to each user's needs and tastes.
          </p>
        </div>
        <div className="about-features">
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" width="28" height="28">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <h4>Global Cuisines</h4>
            <p>Explore dishes from around the world with our extensive recipe database</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" width="28" height="28">
                <path fill="currentColor" d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
              </svg>
            </div>
            <h4>AI Powered</h4>
            <p>Custom recipes generated based on ingredients you already have</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" width="28" height="28">
                <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
              </svg>
            </div>
            <h4>Nutrition Focus</h4>
            <p>Detailed nutritional information for health-conscious cooking</p>
          </div>
        </div>
      </div>
      
      <div className="founder-section">
        <h3>Meet the Founder</h3>
        <div className="founder-container">
          <div className="founder-image-container">
            <img src={founderImage} alt="Om Chavan - Founder of MEALO" className="founder-image" />
          </div>
          <div className="founder-content">
            <h4>Om Chavan</h4>
            <p className="founder-title">Founder & Developer</p>
            <p className="founder-description">
              As a passionate food enthusiast and software developer, Om combined his two interests to create MEALO. 
              With a background in computer science and a lifelong love for culinary exploration, 
              he developed this platform to make cooking more accessible and enjoyable for everyone.
            </p>
            <div className="founder-links">
              <a href="https://www.linkedin.com/in/om-chavan003" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="founder-link">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span>LinkedIn</span>
              </a>
              <a href="https://github.com/Omm-codes" target="_blank" rel="noreferrer" aria-label="GitHub" className="founder-link">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="values-section">
        <h3>Our Values</h3>
        <div className="values-container">
          <div className="value-item">
            <div className="value-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
              </svg>
            </div>
            <h4>Accessibility</h4>
            <p>Making cooking approachable for all skill levels</p>
          </div>
          <div className="value-item">
            <div className="value-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-.61.08-1.21.21-1.78L8.99 15v1c0 1.1.9 2 2 2v1.93C7.06 19.43 4 16.07 4 12zm13.89 5.4c-.26-.81-1-1.4-1.9-1.4h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41C17.92 5.77 20 8.65 20 12c0 2.08-.81 3.98-2.11 5.4z"/>
              </svg>
            </div>
            <h4>Diversity</h4>
            <p>Celebrating food cultures from around the world</p>
          </div>
          <div className="value-item">
            <div className="value-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M17.66 9.53l-7.07 7.07-4.24-4.24 1.41-1.41 2.83 2.83 5.66-5.66 1.41 1.41zM4 12c0-2.33 1.02-4.42 2.62-5.88L9 8.5v-6H3l2.2 2.2C3.24 6.52 2 9.11 2 12c0 5.19 3.95 9.45 9 9.95v-2.02c-3.94-.49-7-3.86-7-7.93zm18 0c0-5.19-3.95-9.45-9-9.95v2.02c3.94.49 7 3.86 7 7.93 0 2.33-1.02 4.42-2.62 5.88L15 15.5v6h6l-2.2-2.2c1.96-1.82 3.2-4.41 3.2-7.3z"/>
              </svg>
            </div>
            <h4>Innovation</h4>
            <p>Using technology to enhance the cooking experience</p>
          </div>
          <div className="value-item">
            <div className="value-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
            </div>
            <h4>Community</h4>
            <p>Building connections through shared food experiences</p>
          </div>
        </div>
      </div>
      
      <div className="cta-section">
        <h3>Ready to start cooking?</h3>
        <p>Explore our collection of delicious recipes or generate your own custom recipes with AI</p>
        <div className="cta-buttons">
          <Link to="/search" className="cta-button primary">Find Recipes</Link>
          <Link to="/ai-recipe-generator" className="cta-button secondary">Try AI Generator</Link>
        </div>
      </div>
    </div>
  );
}

export default About;
