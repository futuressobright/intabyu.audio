import React, { useState, useEffect } from 'react';
import dbService from '../services/dbService';
import AudioRecorder from './AudioRecorder';

const CategoryTile = ({ category, onAddQuestion, onSelectQuestion, selectedQuestionId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    onAddQuestion(category.id, newQuestion);
    setNewQuestion('');
  };

  return (
    <div className="border rounded-lg shadow-sm hover:shadow-md transition-shadow">
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

          <ul className="space-y-2">
            {category.questions.map(question => (
              <li
                key={question.id}
                onClick={() => onSelectQuestion(question.id)}
                className={`p-3 rounded cursor-pointer ${
                  selectedQuestionId === question.id 
                    ? 'bg-blue-100 border border-blue-300' 
                    : 'bg-white hover:bg-gray-100'
                }`}
              >
                {question.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const QuestionManager = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);

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

  const addQuestion = (categoryId, questionText) => {
    setCategories(categories.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          questions: [...category.questions, {
            id: Date.now(),
            text: questionText,
            recordings: []
          }]
        };
      }
      return category;
    }));
  };

  const handleQuestionSelect = (questionId) => {
    setSelectedQuestionId(questionId);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
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

          <div className="grid gap-4">
            {categories.map(category => (
              <CategoryTile
                key={category.id}
                category={category}
                onAddQuestion={addQuestion}
                onSelectQuestion={handleQuestionSelect}
                selectedQuestionId={selectedQuestionId}
              />
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recording Section</h2>
          {selectedQuestionId ? (
            <AudioRecorder questionId={selectedQuestionId} />
          ) : (
            <div className="text-gray-500 text-center py-8">
              Select a question to start recording
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionManager;