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
  onAddQuestion 
}) => {
  return (
    <div className="space-y-4">
      {/* Add Category Button */}
      <SlidingInput
        onSubmit={onAddCategory}
        placeholder="Enter category name"
        buttonText="New Category"
      />

      {/* Categories */}
      <div className="space-y-2">
        {categories.map(category => (
          <div key={category.id} className="rounded-lg overflow-hidden">
            {/* Category Header */}
            <div 
              onClick={() => onCategorySelect(category)}
              className={`
                flex items-center justify-between p-3 cursor-pointer transition-all
                ${activeCategory?.id === category.id 
                  ? 'bg-blue-50' 
                  : 'hover:bg-gray-50'
                }
              `}
            >
              <div>
                <h3 className="font-medium">{category.name}</h3>
                <p className="text-sm text-gray-500">
                  {category.questions?.length || 0} questions
                </p>
              </div>
              <ChevronRight 
                className={`h-5 w-5 text-gray-400 transition-transform
                  ${activeCategory?.id === category.id ? 'rotate-90' : ''}`}
              />
            </div>

            {/* Questions Section */}
            {activeCategory?.id === category.id && (
              <div className="p-3 bg-gray-50 border-t animate-slideDown">
                <SlidingInput
                  onSubmit={(text) => onAddQuestion(category.id, text)}
                  placeholder="Enter question"
                  buttonText="New Question"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;
