import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { ChevronDown, Mic, Plus, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

const NewQuestionFAB = ({ onSubmit, isVisible }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [value, setValue] = React.useState('');
  const inputRef = React.useRef(null);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (value.trim()) {
      onSubmit(value);
      setValue('');
      setIsEditing(false);
    }
  };

  return (
    <div className={`fixed bottom-8 right-8 transition-all duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-24'}`}>
      {!isEditing ? (
        <Button
          onClick={() => setIsEditing(true)}
          className="rounded-full p-4 shadow-lg bg-primary hover:bg-primary/90 text-white"
        >
          <Plus className="h-6 w-6" />
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2 bg-white p-2 rounded-full shadow-lg">
          <Input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter new question"
            className="min-w-[300px] rounded-full"
            autoFocus
          />
          <Button type="submit" className="rounded-full" disabled={!value.trim()}>
            Add
          </Button>
        </form>
      )}
    </div>
  );
};

const ModernQuestionPanel = ({
  category,
  onAddQuestion,
  activeQuestionId,
  onQuestionToggle,
  onReorderQuestions,
  isLoading,
  error
}) => {
  const [showFAB, setShowFAB] = React.useState(true);
  const scrollRef = React.useRef(null);

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    setShowFAB(!bottom);
  };

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
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!category) {
    return (
      <Card className="flex-1">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
            <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
              <ChevronDown className="w-8 h-8" />
            </div>
            <p className="text-lg font-medium">Select a category to view questions</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex-1 relative">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{category.name}</span>
        </CardTitle>
      </CardHeader>

      <ScrollArea
        className="h-[calc(100vh-16rem)]"
        onScroll={handleScroll}
        ref={scrollRef}
      >
        <CardContent className="p-6">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="questions">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {(!category.questions || category.questions.length === 0) ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p className="text-lg font-medium">No questions yet</p>
                      <p className="mt-2">Add your first question to get started</p>
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
                              rounded-xl border bg-card transition-all duration-300
                              ${activeQuestionId === question.id 
                                ? 'ring-2 ring-primary shadow-lg scale-[1.02]' 
                                : 'hover:shadow-md'}
                              ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-xl' : ''}
                            `}
                          >
                            <div className="p-4">
                              <div className="flex items-center gap-3">
                                <ChevronDown
                                  className={`h-5 w-5 transition-transform duration-300
                                    ${activeQuestionId === question.id ? 'rotate-180' : ''}`}
                                  onClick={() => onQuestionToggle(question.id)}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-4">
                                    <h3
                                      className="font-medium truncate cursor-pointer"
                                      onClick={() => onQuestionToggle(question.id)}
                                    >
                                      {question.text}
                                    </h3>
                                    {activeQuestionId !== question.id && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="group relative"
                                        onClick={() => onQuestionToggle(question.id)}
                                      >
                                        <Mic className="h-4 w-4 group-hover:hidden" />
                                        <Activity className="h-4 w-4 hidden group-hover:block animate-pulse" />
                                        <div className="absolute -bottom-8 right-0 hidden group-hover:block whitespace-nowrap rounded bg-primary px-2 py-1 text-xs text-white">
                                          Start Recording
                                        </div>
                                      </Button>
                                    )}
                                  </div>
                                  {question.recordings?.length > 0 && (
                                    <div className="mt-2 flex items-center gap-2">
                                      <div className="text-xs text-muted-foreground">
                                        {question.recordings.length} recording{question.recordings.length !== 1 ? 's' : ''}
                                      </div>
                                      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-primary/50 rounded-full transition-all duration-300"
                                          style={{ width: `${Math.min(100, question.recordings.length * 20)}%` }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Expandable Content */}
                              <div
                                className={`
                                  overflow-hidden transition-all duration-300
                                  ${activeQuestionId === question.id 
                                    ? 'max-h-[500px] opacity-100 mt-4' 
                                    : 'max-h-0 opacity-0'}
                                `}
                              >
                                <div className="pl-8">
                                  {/* Maintain existing AudioRecorder component */}
                                  <div className="rounded-lg bg-accent/50 p-4">
                                    {React.createElement(require('./AudioRecorder').default, {
                                      questionId: question.id
                                    })}
                                  </div>
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

      <NewQuestionFAB
        onSubmit={(text) => onAddQuestion(category.id, text)}
        isVisible={showFAB}
      />
    </Card>
  );
};

export default ModernQuestionPanel;