import React from 'react';
import './PrintButton.css';

function PrintButton({ meal }) {
  const printRecipe = () => {
    // Extract ingredients and measurements
    let ingredients = [];
    
    // Handle Spoonacular format
    if (meal.extendedIngredients && Array.isArray(meal.extendedIngredients)) {
      ingredients = meal.extendedIngredients.map(ing => ({
        name: ing.name,
        measure: `${ing.amount} ${ing.unit}`
      }));
    } else {
      // Handle TheMealDB format
      for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        
        if (ingredient && ingredient.trim()) {
          ingredients.push({
            name: ingredient,
            measure: measure || ''
          });
        }
      }
    }
    
    // Get instructions
    let instructions = meal.strInstructions || '';
    
    // Split instructions by line breaks or handle as a single paragraph
    let instructionParagraphs = instructions.split('\r\n')
      .filter(para => para.trim());
      
    if (instructionParagraphs.length === 0) {
      instructionParagraphs = [instructions];
    }
    
    // Create printable content
    const printContent = `
      <html>
        <head>
          <title>${meal.strMeal} - Recipe</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #a0430a; }
            h2 { color: #a0430a; margin-top: 20px; }
            .meta { margin-bottom: 20px; color: #666; }
            .ingredients { background: #f7f7f7; padding: 15px; border-radius: 5px; }
            .ingredient-item { margin-bottom: 5px; }
            img { max-width: 300px; display: block; margin: 0 auto 20px; border-radius: 5px; }
            hr { border: 0; border-top: 1px solid #eee; margin: 20px 0; }
            .footer { font-size: 0.8rem; color: #888; text-align: center; margin-top: 30px; }
          </style>
        </head>
        <body>
          <h1>${meal.strMeal}</h1>
          <div class="meta">
            ${meal.strCategory ? `<p><strong>Category:</strong> ${meal.strCategory}</p>` : ''}
            ${meal.strArea ? `<p><strong>Cuisine:</strong> ${meal.strArea}</p>` : ''}
          </div>
          <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
          <h2>Ingredients</h2>
          <div class="ingredients">
            ${ingredients.map(ing => `
              <div class="ingredient-item">
                ${ing.measure ? `<strong>${ing.measure}</strong> ` : ''}${ing.name}
              </div>
            `).join('')}
          </div>
          <h2>Instructions</h2>
          ${instructionParagraphs
            .map(para => `<p>${para}</p>`)
            .join('')}
          <hr>
          <div class="footer">
            Recipe from My Food Journal - Printed on ${new Date().toLocaleDateString()}
          </div>
        </body>
      </html>
    `;
    
    // Open a new window and print it
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };
  
  return (
    <button 
      className="print-button"
      onClick={printRecipe}
      aria-label="Print recipe"
    >
      <span className="print-icon">🖨️</span>
      <span className="print-text">Print</span>
    </button>
  );
}

export default PrintButton;
