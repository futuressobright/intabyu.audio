import React, { useState, useEffect } from 'react';
import dbService from '../services/dbService';
import AudioRecorder from './AudioRecorder/AudioRecorder';

const CategoryTile = ({ category, onAddQuestion }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    onAddQuestion(category.id, newQuestion);
    setNewQuestion('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddQuestion();
    }
  };

  return (
    <div className="border rounded-lg shadow-sm hover:shadow-md transition-shadow mb-4">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 cursor-pointer bg-white rounded-t-lg flex justify-between items-center"
      >
        <h2 className="text-xl font-semibold">{category.name}</h2>
        <span className="text-gray-500">{isExpanded ? '▼' : '▶'}</span>
      </div>

      {isExpanded && (
        <div className="p-4 border-t bg-gray-50">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="New Question"
              className="flex-1 p-2 border rounded bg-white"
            />
            <button
              onClick={handleAddQuestion}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Add
            </button>
          </div>

          <div className="space-y-2">
            {category.questions.map(question => (
              <QuestionItem
                key={question.id}
                question={question}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const QuestionItem = ({ question }) => {
  const [showRecorder, setShowRecorder] = useState(false);

  return (
    <div className="mb-4">
      <div
        onClick={() => setShowRecorder(!showRecorder)}
        className="p-3 rounded cursor-pointer bg-white hover:bg-gray-100"
      >
        <div className="flex justify-between items-center">
          <span>{question.text}</span>
          <span className="text-gray-500">{showRecorder ? '▼' : '▶'}</span>
        </div>
      </div>

      <div className={`mt-2 pl-4 border-l-2 border-blue-200 ${showRecorder ? '' : 'hidden'}`}>
        <AudioRecorder questionId={question.id} />
      </div>
    </div>
  );
};

const QuestionManager = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    const loadCategories = async () => {
      const savedCategories = await dbService.getCategories();
      setCategories(savedCategories || []);
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const saveCategories = async () => {
      await dbService.saveCategories(categories);
    };
    saveCategories();
  }, [categories]);

  const addCategory = () => {
    if (!newCategory.trim()) return;
    setCategories([...categories, {
      id: Date.now(),
      name: newCategory,
      questions: []
    }]);
    setNewCategory('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addCategory();
    }
  };


  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="New Category"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={addCategory}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add
          </button>
        </div>
      </div>

      <div>
        {categories.map(category => (
          <CategoryTile
            key={category.id}
            category={category}
            onAddQuestion={addQuestion}
          />
        ))}
      </div>
    </div>
  );
};

export default QuestionManager;