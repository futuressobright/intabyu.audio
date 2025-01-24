import React, { useState } from 'react';
import AudioRecorder from '../AudioRecorder/index.js';

const CategoryCard = ({ category, onSelect, onAddQuestion }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const addQuestion = () => {
    const text = prompt("Enter your question:");
    if (!text?.trim()) return;
    onAddQuestion(category.id, text);  // Use passed handler instead of creating newQuestion object
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
      <div onClick={() => setIsExpanded(!isExpanded)} className="cursor-pointer">
        <h3 className="text-lg font-semibold">{category.name}</h3>
        <p className="text-sm text-gray-600">{category.questions?.length || 0} questions</p>
      </div>

      {isExpanded && (
        <>
          <button
            onClick={addQuestion}
            className="mt-4 px-3 py-1 bg-green-500 text-white rounded-lg text-sm"
          >
            Add Question
          </button>
          {category.questions?.map(question => (
            <div key={question.id} className="mt-4 border-t pt-4">
              <p className="mb-2">{question.text}</p>
              <AudioRecorder questionId={question.id} />
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default CategoryCard;
