import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Skeleton from '../../components/Skeleton/Skeleton';
import { fetchCategories } from '../../services/api';
import './Categories.css';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
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

  return (
    <div className="categories-container">
      <h2 className="page-title">Meal Categories</h2>
      
      {loading ? (
        <div className="categories-grid">
          <Skeleton type="category-card" count={10} />
        </div>
      ) : (
        <div className="categories-grid">
          {categories.map(category => (
            <div key={category.idCategory} className="category-card">
              <img src={category.strCategoryThumb} alt={category.strCategory} />
              <h3>{category.strCategory}</h3>
              <p>{category.strCategoryDescription.substring(0, 100)}...</p>
              <Link to={`/category/${category.strCategory}`} className="view-button">
                View Meals
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Categories;