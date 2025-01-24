import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Star, Sparkles } from 'lucide-react';
import dbService from '../../services/dbService';
import CategoryCard from '../CategoryCard/CategoryCard.jsx';
import CategoryList from '../CategoryList/CategoryList';

const AchievementBanner = () => (
  <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl p-6 mb-8">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="bg-white rounded-2xl p-3">
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

// In Practice.jsx, update the test data
const testCategories = [
  {
    id: 1,
    name: 'Behavioral',
    questions: [
      { id: 1, text: 'Tell me about yourself' }
    ]
  }
];
const StatsRow = () => (
  <div className="grid grid-cols-3 gap-4 mb-8">
    <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
      <Flame className="w-6 h-6 mx-auto mb-2 text-orange-400" />
      <div className="text-2xl font-bold">12</div>
      <div className="text-xs text-gray-600">Day Streak</div>
    </div>
    <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
      <Star className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
      <div className="text-2xl font-bold">85%</div>
      <div className="text-xs text-gray-600">Accuracy</div>
    </div>
    <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
      <Sparkles className="w-6 h-6 mx-auto mb-2 text-purple-400" />
      <div className="text-2xl font-bold">24</div>
      <div className="text-xs text-gray-600">Answers</div>
    </div>
  </div>
);

const Practice = () => {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);


useEffect(() => {
  const loadCategories = async () => {
    try {
      console.log('Fetching categories...');
      const savedCategories = await dbService.getCategories();
      console.log('Categories:', savedCategories);
      setCategories(savedCategories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };
  loadCategories();
}, []);


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

const addCategory = async () => {
  const name = prompt("Enter category name:");
  if (!name?.trim()) return;

  const newCategory = {
    id: Date.now(),
    name,
    questions: []
  };
  setCategories([...categories, newCategory]);
};

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        <AchievementBanner />
        <StatsRow />
        <button
          onClick={addCategory}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Add Category
        </button>
        <CategoryList
          categories={categories}
          onSelectCategory={setActiveCategory}
          onAddQuestion={addQuestion}
        />      </div>
    </div>
  );
};


export default Practice;
