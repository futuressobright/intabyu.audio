import React from 'react';
import CategoryCard from '../CategoryCard/CategoryCard';

const CategoryList = ({ categories, onSelectCategory, onAddQuestion }) => (
  <div className="grid grid-cols-2 gap-4">
    {categories.map(category => (
// Inside CategoryList.jsx, pass onAddQuestion:
    <CategoryCard
      key={category.id}
      category={category}
      onSelect={onSelectCategory}
      onAddQuestion={onAddQuestion}  // Add this line
    />
    ))}
  </div>
);

export default CategoryList;
