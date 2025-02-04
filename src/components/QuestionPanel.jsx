import React from 'react';
import { ChevronDown, Mic, Plus } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import AudioRecorder from './AudioRecorder';

const SlidingInput = ({ onSubmit, placeholder, buttonText }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [value, setValue] = React.useState('');

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (value.trim()) {
      onSubmit(value);
      setValue('');
      setIsEditing(false);
    }
  };

  if (!isEditing) {
    return (
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => setIsEditing(true)}
      >
        <Plus className="mr-2 h-4 w-4" />
        {buttonText}
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1"
        autoFocus
      />
      <Button type="submit" disabled={!value.trim()}>
        Add
      </Button>
      <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
        Cancel
      </Button>
    </form>
  );
};

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

  return (
    <Card className="flex-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{category.name}</CardTitle>
          <SlidingInput
            onSubmit={(text) => onAddQuestion(category.id, text)}
            placeholder="Enter new question"
            buttonText="New Question"
          />
        </div>
      </CardHeader>

      <ScrollArea className="h-[calc(100vh-16rem)]">
        <CardContent className="p-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="questions">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {(!category.questions || category.questions.length === 0) ? (
                    <div className="text-center py-8 text-muted-foreground">
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
                              rounded-lg border border-slate-200
                              transition-all duration-200
                              ${activeQuestionId === question.id 
                                ? 'bg-purple-100 shadow-md border-purple-300' 
                                : 'bg-white hover:bg-red-200 hover:shadow-sm hover:-translate-y-[2px]'}
                              ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-lg border-purple-100' : ''}
                            `}
                            style={provided.draggableProps.style}
                          >
                            <div className="p-4">
                              <div className="flex items-center gap-3">
                                <ChevronDown
                                  className={`h-5 w-5 transition-transform duration-200 cursor-pointer
                                    ${activeQuestionId === question.id ? 'rotate-180 text-purple-500' : 'text-slate-400'}`}
                                  onClick={() => onQuestionToggle(question.id)}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-4">
                                    <h3
                                      className={`font-medium truncate cursor-pointer
                                        ${activeQuestionId === question.id ? 'text-purple-700' : 'text-slate-700'}`}
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

                              {/* Expandable Content */}
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
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </CardContent>
      </ScrollArea>
    </Card>
  );
};

export default QuestionPanel;