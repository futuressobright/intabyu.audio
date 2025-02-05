// SlidingCategoryList.jsx
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { ChevronRight, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

const SlidingCategoryList = ({
  categories = [],
  activeCategory,
  onCategorySelect,
  onAddCategory,
  onReorder,
  isLoading = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [recentCategories, setRecentCategories] = useState([]);

  // Track recent categories
  useEffect(() => {
    if (activeCategory) {
      setRecentCategories(prev => {
        const filtered = prev.filter(c => c.id !== activeCategory.id);
        return [activeCategory, ...filtered].slice(0, 2);
      });
    }
  }, [activeCategory]);

  // Filter out recent categories from main list
  const mainCategories = categories.filter(
    cat => !recentCategories.find(rc => rc.id === cat.id)
  );

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
        <div className="flex items-center justify-between">
          <CardTitle>Categories</CardTitle>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
            </Button>
          ) : (
            <div className="space-y-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = e.target.elements.categoryName;
                  if (input.value.trim()) {
                    onAddCategory(input.value.trim());
                    input.value = '';
                    setIsEditing(false);
                  }
                }}
                className="relative"
              >
                <Input
                  name="categoryName"
                  placeholder="New category name..."
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
            </div>
          )}
        </div>
      </CardHeader>

      <div className="px-4 py-2">
        <div className="text-sm font-medium text-muted-foreground mb-2">Recent</div>
        {recentCategories.map((category) => (
          <div
            key={category.id}
            onClick={() => onCategorySelect(category)}
            className={`
              group relative overflow-hidden mb-2
              rounded-lg border transition-all duration-200
              ${activeCategory?.id === category.id 
                ? 'bg-blue-100 shadow-md border-blue-300' 
                : 'bg-white hover:bg-blue-50 hover:shadow-sm hover:-translate-y-[2px]'}
            `}
          >
            <div className="p-3">
              <div className="flex items-center gap-2">
                <ChevronRight
                  className={`h-4 w-4 transition-transform duration-200
                    ${activeCategory?.id === category.id ? 'rotate-90 text-blue-500' : ''}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{category.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">
                      {category.questions?.length || 0} questions
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-2">
        <div className="text-sm font-medium text-muted-foreground mb-2">All Categories</div>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="list">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-3"
              >
                {categories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <p className="text-sm">No categories yet</p>
                  </div>
                ) : (
                  mainCategories.map((category, index) => (
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
                          onClick={() => onCategorySelect(category)}
                          className={`
                            group relative overflow-hidden
                            rounded-lg border transition-all duration-200
                            ${activeCategory?.id === category.id 
                              ? 'bg-blue-100 shadow-md border-blue-300' 
                              : 'bg-white hover:bg-blue-50 hover:shadow-sm hover:-translate-y-[2px]'}
                            ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-xl' : ''}
                          `}
                          style={provided.draggableProps.style}
                        >
                          <div className="p-3">
                            <div className="flex items-center gap-2">
                              <ChevronRight
                                className={`h-4 w-4 transition-transform duration-200
                                  ${activeCategory?.id === category.id ? 'rotate-90 text-blue-500' : ''}`}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{category.name}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-sm text-muted-foreground">
                                    {category.questions?.length || 0} questions
                                  </span>
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
      </div>
    </Card>
  );
};

export default SlidingCategoryList;