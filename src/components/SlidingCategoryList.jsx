import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { ChevronRight, Plus, Folder } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

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
      <Button
        type="button"
        variant="ghost"
        onClick={() => setIsEditing(false)}
      >
        Cancel
      </Button>
    </form>
  );
};

const SlidingCategoryList = ({
  categories = [],
  activeCategory,
  onCategorySelect,
  onAddCategory,
  onReorder,
  isLoading = false
}) => {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(categories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    onReorder(items);
  };

  if (isLoading) {
    return (
      <Card className="w-80">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-80">
      <CardHeader className="pb-2">
        <CardTitle>Categories</CardTitle>
        <SlidingInput
          onSubmit={onAddCategory}
          placeholder="Enter category name"
          buttonText="New Category"
        />
      </CardHeader>

      <ScrollArea className="h-[calc(100vh-16rem)]">
        <CardContent className="p-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="list">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-2"
                >
                  {categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <Folder className="w-12 h-12 mb-2" />
                      <p className="text-sm">No categories yet</p>
                    </div>
                  ) : (
                    categories.map((category, index) => (
                      <Draggable
                        key={category.id}
                        draggableId={String(category.id)}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`
                              relative rounded-lg select-none
                              transition-all duration-200
                              ${activeCategory?.id === category.id 
                                ? 'bg-primary text-primary-foreground shadow-lg scale-[1.02]' 
                                : 'bg-card hover:bg-accent'}
                              ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-xl' : ''}
                              border border-input
                            `}
                            style={provided.draggableProps.style}
                            onClick={() => onCategorySelect(category)}
                          >
                            <div className="p-3">
                              <div className="flex items-center gap-2">
                                <ChevronRight
                                  className={`h-4 w-4 transition-transform duration-200
                                    ${activeCategory?.id === category.id ? 'rotate-90' : ''}`}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate">{category.name}</div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm opacity-80">
                                      {category.questions?.length || 0} questions
                                    </span>
                                    {category.questions?.length > 0 && (
                                      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                                        <div
                                          className="h-full bg-primary/50 rounded-full transition-all duration-300"
                                          style={{
                                            width: `${Math.round((category.questions.filter(q => q.recordings?.length > 0).length / category.questions.length) * 100)}%`
                                          }}
                                        />
                                      </div>
                                    )}
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
    </Card>
  );
};

export default SlidingCategoryList;