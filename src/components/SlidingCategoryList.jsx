import React from 'react';
import { ChevronRight } from 'lucide-react';
import SlidingInput from './SlidingInput';

const SlidingCategoryList = ({
  categories = [],
  activeCategory,
  onCategorySelect,
  onAddCategory,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="w-72 bg-white rounded-lg p-4 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden border border-gray-200">
      <div className="p-4 border-b">
        <SlidingInput
          onSubmit={onAddCategory}
          placeholder="Enter category name"
          buttonText="New Category"
        />
      </div>

      <div className="p-2 space-y-1 max-h-[calc(100vh-16rem)] overflow-y-auto">
        {categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No categories yet
          </div>
        ) : (
          categories.map(category => (
            <div
              key={category.id}
              onClick={() => onCategorySelect(category)}
              className={`
                group p-4 rounded-xl cursor-pointer transition-all duration-300
                ${activeCategory?.id === category.id 
                  ? 'bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] border-2 border-purple-200 transform -translate-y-1' 
                  : 'bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:-translate-y-1 border border-gray-200'}
              `}
            >
              <div className="flex items-center gap-3">
                <ChevronRight
                  className={`h-5 w-5 transition-transform duration-300 text-gray-400
                    ${activeCategory?.id === category.id ? 'rotate-90' : ''}`}
                />
                <div className="flex-1">
                  <h3 className={`font-medium transition-colors
                    ${activeCategory?.id === category.id 
                      ? 'text-purple-700' 
                      : 'text-gray-700'}`}
                  >
                    {category.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500">
                      {category.questions?.length || 0} questions
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SlidingCategoryList;
