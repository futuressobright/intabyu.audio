import React, { useState, useEffect } from 'react';
import { ChevronDown, Mic, Plus } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  const [isEditing, setIsEditing] = useState(false);
  const [recentQuestions, setRecentQuestions] = useState([]);

  // Track recent questions
  useEffect(() => {
    if (activeQuestionId && category?.questions) {
      const activeQuestion = category.questions.find(q => q.id === activeQuestionId);
      if (activeQuestion) {
        setRecentQuestions(prev => {
          const filtered = prev.filter(q => q.id !== activeQuestionId);
          return [activeQuestion, ...filtered].slice(0, 4);
        });
      }
    }
  }, [activeQuestionId, category?.questions]);

  // Filter out recent questions from main list
  const mainQuestions = (category?.questions || []).filter(
    question => !recentQuestions.find(rq => rq.id === question.id)
  );

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const questions = Array.from(category.questions || []);
    const [movedQuestion] = questions.splice(result.source.index, 1);
    questions.splice(result.destination.index, 0, movedQuestion);
    onReorderQuestions(category.id, questions);
  };

  if (isLoading) {
    return (
      <Card className="flex-1">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex-1">
        <CardContent className="p-4">
          <div className="text-center text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!category) {
    return (
      <Card className="flex-1">
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            Select a category to view questions
          </div>
        </CardContent>
      </Card>
    );
  }

  const QuestionCard = ({ question, provided = null, snapshot = null }) => (
    <div
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
      className={`
        rounded-lg border border-slate-200
        transition-all duration-200
        ${activeQuestionId === question.id 
          ? 'bg-teal-100 shadow-md border-teal-300' 
          : 'bg-white hover:bg-teal-50 hover:shadow-sm hover:-translate-y-[2px]'}
        ${snapshot?.isDragging ? 'rotate-2 scale-105 shadow-lg border-teal-100' : ''}
      `}
      style={provided?.draggableProps.style}
    >
      <div className="p-4">
        <div className="flex items-center gap-3">
          <ChevronDown
            className={`h-5 w-5 transition-transform duration-200 cursor-pointer
              ${activeQuestionId === question.id ? 'rotate-180 text-teal-500' : 'text-slate-400'}`}
            onClick={() => onQuestionToggle(question.id)}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4">
              <h3
                className={`font-medium truncate cursor-pointer
                  ${activeQuestionId === question.id ? 'text-teal-700' : 'text-slate-700'}`}
                onClick={() => onQuestionToggle(question.id)}
              >
                {question.text}
              </h3>
              {activeQuestionId !== question.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => onQuestionToggle(question.id)}
                >
                  <Mic className="h-3 w-3" />
                  <span className="hidden sm:inline">Record</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div
          className={`
            overflow-hidden transition-all duration-200
            ${activeQuestionId === question.id 
              ? 'max-h-[500px] opacity-100 mt-4' 
              : 'max-h-0 opacity-0'}
          `}
        >
          <div className="pl-8">
            <AudioRecorder questionId={question.id} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="flex-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{category.name}</CardTitle>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Question
            </Button>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const input = e.target.elements.questionText;
                if (input.value.trim()) {
                  onAddQuestion(category.id, input.value.trim());
                  input.value = '';
                  setIsEditing(false);
                }
              }}
              className="flex-1 ml-4 relative"
            >
              <Input
                name="questionText"
                placeholder="Enter new question..."
                autoFocus
                className="w-full pr-20"
              />
              <div className="absolute right-1 top-1 flex items-center gap-1">
                <Button type="submit" size="sm" variant="ghost" className="h-7 px-2">
                  Add
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  className="h-7 px-2"
                >
                  ✕
                </Button>
              </div>
            </form>
          )}
        </div>
      </CardHeader>

      <ScrollArea className="h-[calc(100vh-16rem)]">
        <CardContent className="p-4">
          {/* Recent Questions Section */}
          {recentQuestions.length > 0 && (
            <div className="mb-6">
              <div className="text-sm font-medium text-muted-foreground mb-3">Recent Questions</div>
              <div className="space-y-3">
                {recentQuestions.map((question) => (
                  <QuestionCard key={question.id} question={question} />
                ))}
              </div>
            </div>
          )}

          {/* All Questions Section */}
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-3">All Questions</div>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="questions">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3"
                  >
                    {mainQuestions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No questions yet
                      </div>
                    ) : (
                      mainQuestions.map((question, index) => (
                        <Draggable
                          key={question.id}
                          draggableId={question.id.toString()}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <QuestionCard
                              question={question}
                              provided={provided}
                              snapshot={snapshot}
                            />
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
        </CardContent>
      </ScrollArea>
    </Card>
  );
};

export default QuestionPanel;