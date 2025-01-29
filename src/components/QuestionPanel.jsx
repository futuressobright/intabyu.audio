import React from 'react';
import { ChevronDown, Mic } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import SlidingInput from './SlidingInput';
import AudioRecorder from './AudioRecorder';

const QuestionPanel = ({
  category,
  onAddQuestion,
  activeQuestionId,
  onQuestionToggle,
  onReorderQuestions,
  isLoading,
  error
}) => {
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const questions = Array.from(category.questions || []);
    const [movedQuestion] = questions.splice(result.source.index, 1);
    questions.splice(result.destination.index, 0, movedQuestion);

    onReorderQuestions(category.id, questions);
  };

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
    <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{category.name}</h2>
          <SlidingInput
            onSubmit={(text) => onAddQuestion(category.id, text)}
            placeholder="Enter new question"
            buttonText="New Question"
          />
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="questions">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`flex-1 p-4 space-y-3 overflow-y-auto
                ${snapshot.isDraggingOver ? 'bg-blue-100/50' : ''}`}
            >
              {(!category.questions || category.questions.length === 0) ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No questions yet
                </div>
              ) : (
                category.questions.map((question, index) => (
                  <Draggable
                    key={question.id}
                    draggableId={question.id.toString()}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`
                          group rounded-xl cursor-pointer
                          transform transition-all duration-300 ease-out
                          ${snapshot.isDragging ? 'rotate-2 scale-105' : ''}
                          ${activeQuestionId === question.id 
                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 -translate-y-1 scale-[1.02]' 
                            : 'bg-gradient-to-br from-blue-100 to-indigo-100 hover:-translate-y-1 hover:scale-[1.01] hover:from-blue-200 hover:to-indigo-200'}
                          border-2
                          ${activeQuestionId === question.id
                            ? 'border-blue-300 shadow-[0_20px_40px_-15px_rgba(59,130,246,0.5)]'
                            : 'border-blue-200/50 shadow-[0_15px_30px_-15px_rgba(59,130,246,0.3)] hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.4)]'}
                          ${snapshot.isDragging ? 'shadow-[0_30px_60px_-15px_rgba(59,130,246,0.6)]' : ''}
                          backdrop-blur-sm
                        `}
                      >
                        <div className="p-4">
                          <div className="flex items-center gap-3">
                            <ChevronDown
                              className={`h-5 w-5 transition-transform duration-300
                                ${activeQuestionId === question.id 
                                  ? 'text-white rotate-180' 
                                  : 'text-blue-400 group-hover:text-blue-500'}`}
                              onClick={() => onQuestionToggle(question.id)}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-4">
                                <h3 className={`font-medium transition-colors truncate
                                  ${activeQuestionId === question.id 
                                    ? 'text-white' 
                                    : 'text-blue-700 group-hover:text-blue-800'}`}
                                  onClick={() => onQuestionToggle(question.id)}
                                >
                                  {question.text}
                                </h3>
                                {activeQuestionId !== question.id && (
                                  <button
                                    onClick={() => onQuestionToggle(question.id)}
                                    className="flex items-center gap-1 px-3 py-1 text-sm rounded-lg
                                      bg-white/10 hover:bg-white/20 transition-colors
                                      text-blue-500 hover:text-blue-600"
                                  >
                                    <Mic className="h-3 w-3" />
                                    <span className="hidden sm:inline">Record</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Expandable Content */}
                          <div
                            className={`
                              overflow-hidden transition-all duration-200 ease-in-out
                              ${activeQuestionId === question.id 
                                ? 'max-h-[500px] opacity-100 mt-4' 
                                : 'max-h-0 opacity-0'}
                            `}
                          >
                            <div className="pl-8 pr-2">
                              <AudioRecorder questionId={question.id} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default QuestionPanel;