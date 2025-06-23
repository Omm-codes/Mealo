import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Skeleton from '../../components/Skeleton/Skeleton';
import { fetchCategories } from '../../services/api';
import './Categories.css';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(8);
  
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await fetchCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
      setLoading(false);
    };

    loadCategories();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setVisibleCount(8); // Reset visible count when searching
  };

  const filteredCategories = categories.filter(category => 
    category.strCategory.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loadMoreCategories = () => {
    setVisibleCount(prevCount => prevCount + 8);
  };

  const displayedCategories = filteredCategories.slice(0, visibleCount);

  return (
    <div className="categories-container">
      <div className="categories-header">
        <h2 className="page-title">Explore Meal Categories</h2>
        <p className="categories-subtitle">
          Discover recipes organized by food categories - from appetizers to desserts
        </p>
      </div>
      
      <div className="search-bar-container">
        <input 
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={handleSearch}
          className="category-search"
        />
      </div>
      
      {loading ? (
        <div className="categories-grid">
          <Skeleton type="category-card" count={8} />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="no-categories-found">
          <p>No categories found matching "{searchTerm}"</p>
          <button onClick={() => setSearchTerm('')} className="clear-search-btn">
            Clear Search
          </button>
        </div>
      ) : (
        <>
          <div className="categories-grid">
            {displayedCategories.map(category => (
              <div key={category.idCategory} className="category-card">
                <div className="category-image-wrapper">
                  <img 
                    src={category.strCategoryThumb} 
                    alt={category.strCategory}
                    loading="lazy"
                  />
                </div>
                <div className="category-content">
                  <div>
                    <h3>{category.strCategory}</h3>
                    <p className="category-description">
                      {category.strCategoryDescription.length > 120 
                        ? `${category.strCategoryDescription.substring(0, 120)}...` 
                        : category.strCategoryDescription}
                    </p>
                  </div>
                  <Link to={`/category/${category.strCategory}`} className="view-button">
                    Explore Recipes
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          {visibleCount < filteredCategories.length && (
            <div className="load-more-container">
              <button onClick={loadMoreCategories} className="load-more-button">
                Load More Categories
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Categories;