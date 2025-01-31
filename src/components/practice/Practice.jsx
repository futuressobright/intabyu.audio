import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Star, Sparkles } from 'lucide-react';
import AudioRecorder from '../AudioRecorder/AudioRecorder';

// Consolidate config directly in component for MVP
const API_CONFIG = {
  BASE_URL: 'http://localhost:3002',
  ENDPOINTS: {
    CATEGORIES: '/api/categories',
    QUESTIONS: '/api/questions',
    RECORDINGS: '/api/recordings'
  }
};

const USER_CONFIG = {
  DEFAULT_USER_ID: '6'  // TODO: Replace with actual auth
};

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

const CategoryList = ({
  categories,
  activeCategory,
  onCategorySelect,
  onAddCategory,
  onAddQuestion,
  isLoading,
  error
}) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newQuestionText, setNewQuestionText] = useState('');

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    onAddCategory(newCategoryName);
    setNewCategoryName('');
  };

  const handleAddQuestion = (categoryId) => {
    if (!newQuestionText.trim()) return;
    onAddQuestion(categoryId, newQuestionText);
    setNewQuestionText('');
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="w-1/4 min-w-[250px] bg-orange-50 overflow-y-auto p-4 border-r">
      <div className="mb-4">
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
          placeholder="New Category Name"
          className="w-full p-2 mb-2 border rounded"
        />
        <button
          onClick={handleAddCategory}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Add Category
        </button>
      </div>

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

const QuestionPanel = ({
  category,
  onAddQuestion,
  activeQuestionId,
  onQuestionToggle,
  isLoading,
  error
}) => {
  const [newQuestion, setNewQuestion] = useState('');

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    onAddQuestion(category.id, newQuestion);
    setNewQuestion('');
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-orange-50">
      {category ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{category.name}</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddQuestion()}
                placeholder="New Question"
                className="p-2 border rounded"
              />
              <button
                onClick={handleAddQuestion}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                Add Question
              </button>
            </div>
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
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeQuestionId, setActiveQuestionId] = useState(null);

  // Enhanced error handling and logging for debugging
  const handleAPIError = (error, context) => {
    console.error(`[${context}] Error:`, error);
    const message = error.response?.data?.error || error.message || 'An unexpected error occurred';
    setError(`${context}: ${message}`);
    setIsLoading(false);
  };

  // Fetch categories with enhanced error handling
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('[Practice] Fetching categories');

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIES}?userId=${USER_CONFIG.DEFAULT_USER_ID}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`[Practice] Received ${data.length} categories:`, data);

      setCategories(data);

      // If we had an active category, update it with new data
      if (activeCategory) {
        const updatedActiveCategory = data.find(c => c.id === activeCategory.id);
        if (updatedActiveCategory) {
          setActiveCategory(updatedActiveCategory);
        }
      }

    } catch (error) {
      handleAPIError(error, 'Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCategories();
  }, []);

  // Add category with enhanced error handling
  const handleAddCategory = async (name) => {
    try {
      setError(null);
      console.log(`[Practice] Adding new category: ${name}`);

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIES}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          userId: USER_CONFIG.DEFAULT_USER_ID
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to add category: ${response.statusText}`);
      }

      const newCategory = await response.json();
      console.log('[Practice] Category added:', newCategory);

      // Update categories list and select the new category
      setCategories(prev => [...prev, newCategory]);
      setActiveCategory(newCategory);

    } catch (error) {
      handleAPIError(error, 'Failed to add category');
    }
  };

  // Add question with enhanced error handling
  const handleAddQuestion = async (categoryId, text) => {
    try {
      setError(null);
      console.log(`[Practice] Adding question to category ${categoryId}:`, text);

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.QUESTIONS}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, text })
      });

      if (!response.ok) {
        throw new Error(`Failed to add question: ${response.statusText}`);
      }

      const newQuestion = await response.json();
      console.log('[Practice] Question added:', newQuestion);

      // Update categories and active category
      setCategories(prev => prev.map(category => {
        if (category.id === categoryId) {
          const updatedCategory = {
            ...category,
            questions: [...(category.questions || []), newQuestion]
          };
          // If this is the active category, update it too
          if (activeCategory?.id === category.id) {
            setActiveCategory(updatedCategory);
          }
          return updatedCategory;
        }
        return category;
      }));

    } catch (error) {
      handleAPIError(error, 'Failed to add question');
    }
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    console.log('[Practice] Selected category:', category);
    setActiveCategory(category);
    setActiveQuestionId(null); // Reset active question when changing categories
  };

  // Handle question selection
  const handleQuestionToggle = (questionId) => {
    console.log('[Practice] Toggled question:', questionId);
    setActiveQuestionId(activeQuestionId === questionId ? null : questionId);
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
          onCategorySelect={handleCategorySelect}
          onAddCategory={handleAddCategory}
          onAddQuestion={handleAddQuestion}
          isLoading={isLoading}
          error={error}
        />
        <QuestionPanel
          category={activeCategory}
          onAddQuestion={handleAddQuestion}
          activeQuestionId={activeQuestionId}
          onQuestionToggle={handleQuestionToggle}
          isLoading={isLoading}
          error={error}
        />
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 mt-4 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default Practice;