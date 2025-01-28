import React, { useState } from 'react';
import { Plus, X, ChevronRight } from 'lucide-react';

const SlidingInput = ({ onSubmit, placeholder, buttonText }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value);
      setValue('');
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>{buttonText}</span>
        </button>
      ) : (
        <div className="flex items-center gap-2 animate-slideIn">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />
          <button
            onClick={handleSubmit}
            disabled={!value.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              setValue('');
            }}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

const CategoryList = ({
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
    <div className="w-72 bg-white rounded-lg shadow-lg overflow-hidden">
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
                group p-4 rounded-lg cursor-pointer transition-all duration-200
                ${activeCategory?.id === category.id 
                  ? 'bg-blue-50 shadow-md transform scale-[1.02]' 
                  : 'hover:bg-gray-50 hover:shadow-md hover:transform hover:scale-[1.02]'}
              `}
            >
              <div className="flex items-center gap-3">
                <ChevronRight
                  className={`h-5 w-5 transition-transform text-gray-400
                    ${activeCategory?.id === category.id ? 'rotate-90' : ''}`}
                />
                <div className="flex-1">
                  <h3 className={`font-medium transition-colors
                    ${activeCategory?.id === category.id 
                      ? 'text-blue-700' 
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

// Export both components so they can be used separately
export { SlidingInput };
export default CategoryList;