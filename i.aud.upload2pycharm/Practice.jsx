import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Star, Sparkles } from 'lucide-react';
import AudioRecorder from '../AudioRecorder/AudioRecorder';
import dbService from '../../services/dbService';

const AchievementBanner = () => (
  <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl p-6 mb-8">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="bg-white rounded-3xl p-3">  {/* Changed from rounded-2xl */}
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

const CategoryList = ({ categories, activeCategory, onCategorySelect, onAddCategory }) => (
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

const QuestionPanel = ({ category, onAddQuestion, activeQuestionId, onQuestionToggle }) => (
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

const Practice = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      const savedCategories = await dbService.getCategories();
      setCategories(savedCategories || []);
    };
    loadCategories();
  }, []);

    useEffect(() => {
      if (activeCategory) {
        const updatedCategory = categories.find(c => c.id === activeCategory.id);
        setActiveCategory(updatedCategory);
      }
    }, [categories]);

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

  const addQuestion = (categoryId, text) => {
    setCategories(categories.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          questions: [...(category.questions || []), {
            id: Date.now(),
            text,
            recordings: []
          }]
        };
      }
      return category;
    }));
  };

  return (
    <div className="bg-orange-100">  {/* Remove min-h-screen */}
      <div className="px-6 py-4">    {/* Remove bg-orange-100 and shadow */}
        <AchievementBanner />
        <StatsRow />
      </div>

      <div className="flex">
        <CategoryList
          categories={categories}
          activeCategory={activeCategory}
          onCategorySelect={setActiveCategory}
          onAddCategory={addCategory}
        />
        <QuestionPanel
          category={activeCategory}
          onAddQuestion={addQuestion}
          activeQuestionId={activeQuestionId}
          onQuestionToggle={(qId) => setActiveQuestionId(activeQuestionId === qId ? null : qId)}
        />
      </div>
    </div>
  );
};

export default Practice;