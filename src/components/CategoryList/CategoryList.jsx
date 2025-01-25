import React, { useState } from 'react';
import CategoryCard from '../CategoryCard/CategoryCard';

const CategoryList = ({ categories, onSelectCategory, onAddQuestion }) => {
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);
  const [activeQuestionId, setActiveQuestionId] = useState(null);

  return (
    <div className="space-y-2">
      {categories.map(category => (
        <CategoryCard
          key={category.id}
          category={category}
          isExpanded={expandedCategoryId === category.id}
          onToggle={() => setExpandedCategoryId(
            expandedCategoryId === category.id ? null : category.id
          )}
          activeQuestionId={activeQuestionId}
          onQuestionToggle={(qId) => setActiveQuestionId(
            activeQuestionId === qId ? null : qId
          )}
          onAddQuestion={onAddQuestion}
        />
      ))}
    </div>
  );
};

export default CategoryList;