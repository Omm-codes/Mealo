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
  
  return (
    <div className="skeleton-container">
      {renderSkeletonItems()}
    </div>
  );
}

export default Skeleton;
