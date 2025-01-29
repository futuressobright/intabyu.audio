import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Star, Sparkles } from 'lucide-react';
import AudioRecorder from './AudioRecorder.jsx';
import SlidingCategoryList from './SlidingCategoryList.jsx';
import QuestionPanel from './QuestionPanel.jsx';

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
        <SlidingCategoryList
          categories={categories}
          activeCategory={activeCategory}
          onCategorySelect={handleCategorySelect}
          onAddCategory={handleAddCategory}
          onAddQuestion={handleAddQuestion}
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