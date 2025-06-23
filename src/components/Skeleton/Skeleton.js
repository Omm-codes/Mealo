import React from 'react';
import './Skeleton.css';

function Skeleton({ type = 'text-line', count = 1 }) {
  const renderSkeletonItems = () => {
    const items = [];
    for (let i = 0; i < count; i++) {
      switch (type) {
        case 'meal-card':
          items.push(
            <div key={i} className="skeleton-meal-card">
              <div className="skeleton-image"></div>
              <div className="skeleton-content">
                <div className="skeleton-title"></div>
                <div className="skeleton-meta"></div>
                <div className="skeleton-button"></div>
              </div>
            </div>
          );
          break;
        
        case 'category-card':
          items.push(
            <div key={i} className="skeleton-category-card">
              <div className="skeleton-category-image"></div>
              <div className="skeleton-category-title"></div>
              <div className="skeleton-category-description"></div>
            </div>
          );
          break;
        
        case 'cuisine-card':
          items.push(
            <div key={i} className="skeleton-cuisine-card">
              <div className="skeleton-cuisine-image">
                <div className="skeleton-cuisine-icon"></div>
              </div>
              <div className="skeleton-cuisine-content">
                <div className="skeleton-cuisine-title"></div>
                <div className="skeleton-cuisine-description"></div>
              </div>
            </div>
          );
          break;
          
        case 'ingredient':
          items.push(
            <div key={i} className="skeleton-ingredient">
              <div className="skeleton-measure"></div>
              <div className="skeleton-ingredient-name"></div>
            </div>
          );
          break;
          
        case 'text-line':
        default:
          items.push(<div key={i} className="skeleton-text-line"></div>);
          break;
      }
    }
    
    return items;
  };
  
  // Use the type to determine the container class
  const containerClass = `skeleton-container ${type}-container`;
  
  return (
    <div className={containerClass}>
      {renderSkeletonItems()}
    </div>
  );
}

export default Skeleton;
