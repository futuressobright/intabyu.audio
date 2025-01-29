import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

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

export default SlidingInput;