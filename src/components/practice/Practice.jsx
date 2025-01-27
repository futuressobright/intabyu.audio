import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Star, Sparkles } from 'lucide-react';
import AudioRecorder from '../AudioRecorder/AudioRecorder';
import dbService from '../../services/dbService';

const API_BASE_URL = 'http://localhost:3002';
const USER_ID = '6'; // TODO: Replace with actual user authentication

// UI Components
const AchievementBanner = () => (
  <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl p-6 mb-8">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="bg-white rounded-3xl p-3">
          <Trophy className="w-8 h-8 text-purple-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Keep Going!</h2>
          <p className="text-white/80">You're making great progress 🎉</p>
        </div>
      </div>
    </div>
  </div>
);

const StatsRow = () => (
  <div className="grid grid-cols-3 gap-4 mb-8">
    <div className="bg-orange-50 rounded-2xl p-4 text-center shadow-sm">
      <Flame className="w-6 h-6 mx-auto mb-2 text-orange-400" />
      <div className="text-2xl font-bold">12</div>
      <div className="text-xs text-gray-600">Day Streak</div>
    </div>
    <div className="bg-orange-50 rounded-2xl p-4 text-center shadow-sm">
      <Star className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
      <div className="text-2xl font-bold">85%</div>
      <div className="text-xs text-gray-600">Accuracy</div>
    </div>
    <div className="bg-orange-50 rounded-2xl p-4 text-center shadow-sm">
      <Sparkles className="w-6 h-6 mx-auto mb-2 text-purple-400" />
      <div className="text-2xl font-bold">24</div>
      <div className="text-xs text-gray-600">Answers</div>
    </div>
  </div>
);

const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

const ErrorMessage = ({ message, onRetry }) => (
  <div className="text-center p-8">
    <p className="text-red-500 mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Retry
      </button>
    )}
  </div>
);

const CategoryList = ({ categories, activeCategory, onCategorySelect, onAddCategory, isLoading, error }) => {
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="w-1/4 min-w-[250px] bg-orange-50 overflow-y-auto p-4 border-r">
      <button
        onClick={onAddCategory}
        className="w-full mb-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        Add Category
      </button>

      <div className="space-y-1">
        {categories.map(category => (
          <div
            key={category.id}
            onClick={() => onCategorySelect(category)}
            className={`p-3 rounded-lg cursor-pointer transition-colors ${
              activeCategory?.id === category.id 
                ? 'bg-blue-100 text-blue-700' 
                : 'hover:bg-orange-100'
            }`}
          >
            <h3 className="font-medium">{category.name}</h3>
            <p className="text-sm text-gray-600">{category.questions?.length || 0} questions</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const QuestionPanel = ({ category, onAddQuestion, activeQuestionId, onQuestionToggle, isLoading, error }) => {
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-orange-50">
      {category ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{category.name}</h2>
            <button
              onClick={() => {
                const text = prompt("Enter your question:");
                if (text?.trim()) onAddQuestion(category.id, text);
              }}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              Add Question
            </button>
          </div>

          <div className="space-y-3">
            {category.questions?.map(q => (
              <div key={q.id} className="border rounded-lg overflow-hidden bg-orange-50">
                <div
                  onClick={() => onQuestionToggle(q.id)}
                  className="p-4 cursor-pointer hover:bg-orange-100 transition-colors"
                >
                  {q.text}
                </div>

                <div className={`transition-all duration-300 ease-in-out ${
                  activeQuestionId === q.id ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                }`}>
                  <div className="p-4 bg-orange-100 border-t">
                    <AudioRecorder questionId={q.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="h-full flex items-center justify-center text-gray-500">
          Select a category to view questions
        </div>
      )}
    </div>
  );
};

const Practice = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Local state with proper error handling
  const [activeCategory, setActiveCategory] = useState(() => {
    try {
      const saved = localStorage.getItem('activeCategory');
      return saved && saved !== 'undefined' ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error parsing activeCategory from localStorage:', error);
      return null;
    }
  });

  const [activeQuestionId, setActiveQuestionId] = useState(() => {
    try {
      const saved = localStorage.getItem('activeQuestionId');
      return saved && saved !== 'undefined' ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error parsing activeQuestionId from localStorage:', error);
      return null;
    }
  });

  // Fetch categories from server
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try server first
      const response = await fetch(`${API_BASE_URL}/api/categories?userId=${USER_ID}`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();

      setCategories(data);

      // Backup to IndexedDB
      await dbService.saveCategories(data);

    } catch (err) {
      console.error('Server API error:', err);
      setError('Failed to load categories. Loading from local storage...');

      try {
        // Fallback to IndexedDB
        const localCategories = await dbService.getCategories();
        if (localCategories?.length) {
          setCategories(localCategories);
          setError(null);
        } else {
          setError('No cached categories available');
        }
      } catch (dbError) {
        console.error('IndexedDB error:', dbError);
        setError('Failed to load categories from both server and local storage');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCategories();
  }, []);

  // Keep active category in sync with categories list
  useEffect(() => {
    if (activeCategory) {
      const updatedCategory = categories.find(c => c.id === activeCategory.id);
      setActiveCategory(updatedCategory || null);
    }
  }, [categories, activeCategory?.id]);

  // Persist selections to localStorage
  useEffect(() => {
    if (activeCategory) {
      localStorage.setItem('activeCategory', JSON.stringify(activeCategory));
    } else {
      localStorage.removeItem('activeCategory');
    }
  }, [activeCategory]);

  useEffect(() => {
    if (activeQuestionId) {
      localStorage.setItem('activeQuestionId', JSON.stringify(activeQuestionId));
    } else {
      localStorage.removeItem('activeQuestionId');
    }
  }, [activeQuestionId]);

  // Server operations with local fallback
  const addCategory = async () => {
    const name = prompt("Enter category name:");
    if (!name?.trim()) return;

    try {
      setError(null);

      // Try server first
      const response = await fetch(`${API_BASE_URL}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, userId: USER_ID })
      });

      if (!response.ok) throw new Error('Failed to add category');
      const newCategory = await response.json();

      setCategories(prev => [...prev, newCategory]);

      // Sync with IndexedDB
      await dbService.saveCategories([...categories, newCategory]);

    } catch (err) {
      console.error('Failed to add category:', err);
      setError('Failed to add category. Please try again.');
    }
  };

  const addQuestion = async (categoryId, text) => {
    if (!text?.trim()) return;

    try {
      setError(null);

      // Try server first
      const response = await fetch(`${API_BASE_URL}/api/questions`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({categoryId, text})
      });

      if (!response.ok) throw new Error('Failed to add question');
      const newQuestion = await response.json();

      const updatedCategories = categories.map(category => {
        if (category.id === categoryId) {
          return {
            ...category,
            questions: [...(category.questions || []), newQuestion]
          };
        }
        return category;
      });

      setCategories(updatedCategories);

      // Sync with IndexedDB
      await dbService.saveCategories(updatedCategories);

    } catch (err) {
      console.error('Failed to add question:', err);
      setError('Failed to add question. Please try again.');
    }
  };

  return (
    <div className="bg-orange-100">
      <div className="px-6 py-4">
        <AchievementBanner />
        <StatsRow />
      </div>

      <div className="flex">
        <CategoryList
          categories={categories}
          activeCategory={activeCategory}
          onCategorySelect={setActiveCategory}
          onAddCategory={addCategory}
          isLoading={isLoading}
          error={error}
        />
        <QuestionPanel
          category={activeCategory}
          onAddQuestion={addQuestion}
          activeQuestionId={activeQuestionId}
          onQuestionToggle={(qId) => setActiveQuestionId(activeQuestionId === qId ? null : qId)}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
};

export default Practice;