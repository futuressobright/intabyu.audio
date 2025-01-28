import React from 'react';
import { ChevronDown, Mic } from 'lucide-react';
import { SlidingInput } from '../SlidingInputs/SlidingInputs';
import AudioRecorder from '../AudioRecorder/AudioRecorder';

const QuestionPanel = ({
  category,
  onAddQuestion,
  activeQuestionId,
  onQuestionToggle,
  isLoading,
  error
}) => {
  if (isLoading) {
    return (
      <div className="flex-1 bg-white p-3">
        <div className="animate-pulse space-y-2">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-white p-4 flex items-center justify-center">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex-1 bg-white p-4 flex items-center justify-center">
        <div className="text-center text-gray-500">
          Select a category to view questions
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white overflow-hidden flex flex-col">
      {/* Header - Category name and New Question on same line */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{category.name}</h2>
        <SlidingInput
          onSubmit={(text) => onAddQuestion(category.id, text)}
          placeholder="Enter new question"
          buttonText="New Question"
        />
      </div>

      {/* Questions List */}
      <div className="flex-1 overflow-y-auto">
        {category.questions?.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            No questions yet
          </div>
        ) : (
          <div className="divide-y">
            {category.questions?.map(question => (
              <div key={question.id}>
                {/* Question Header with inline Record button */}
                <div className="px-4 py-2 hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <ChevronDown
                      className={`h-4 w-4 text-gray-400 transition-transform duration-200
                        ${activeQuestionId === question.id ? 'rotate-180' : ''}`}
                      onClick={() => onQuestionToggle(question.id)}
                    />
                    <div className="flex-1 flex items-center justify-between">
                      <span
                        className="text-gray-900 cursor-pointer"
                        onClick={() => onQuestionToggle(question.id)}
                      >
                        {question.text}
                      </span>
                      {activeQuestionId !== question.id && (
                        <button
                          onClick={() => onQuestionToggle(question.id)}
                          className="flex items-center gap-1 px-2 py-1 text-sm text-blue-500 hover:bg-blue-50 rounded"
                        >
                          <Mic className="h-3 w-3" />
                          Record
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expandable Content */}
                  <div
                    className={`transition-all duration-200 ease-in-out overflow-hidden
                      ${activeQuestionId === question.id ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="pl-6">
                      <AudioRecorder questionId={question.id} />

                      {/* Recording History - More compact */}
                      <div className="mt-2 space-y-1">
                        {/* Previous recordings would go here */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionPanel;