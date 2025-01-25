import React from 'react';
import AudioRecorder from '../AudioRecorder/AudioRecorder';

const CategoryCard = ({
  category,
  onAddQuestion,
  isExpanded,
  onToggle,
  activeQuestionId,
  onQuestionToggle
}) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden mb-2">
      {/* Category header */}
      <div
        onClick={onToggle}
        className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">{category.name}</h3>
            <p className="text-sm text-gray-500">{category.questions?.length || 0} questions</p>
          </div>
        </div>
      </div>

      {/* Expandable content */}
      <div className={`transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="p-3 border-t">
          <button
            onClick={() => {
              const text = prompt("Enter your question:");
              if (text?.trim()) onAddQuestion(category.id, text);
            }}
            className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors"
          >
            Add Question
          </button>

          <div className="mt-3 space-y-1">
            {category.questions?.map(q => (
              <div key={q.id} className="border rounded-lg overflow-hidden">
                <div
                  onClick={() => onQuestionToggle(q.id)}
                  className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  {q.text}
                </div>

                <div className={`transition-all duration-300 ease-in-out ${
                  activeQuestionId === q.id ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                }`}>
                  <div className="p-3 bg-gray-50 border-t">
                    <AudioRecorder questionId={q.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;