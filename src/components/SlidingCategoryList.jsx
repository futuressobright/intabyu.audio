import React from 'react';
import { ChevronRight } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import SlidingInput from './SlidingInput';

const SlidingCategoryList = ({
  categories = [],
  activeCategory,
  onCategorySelect,
  onAddCategory,
  onReorder,  // New prop for handling reordering
  isLoading = false
}) => {
  const handleDragEnd = (result) => {
    if (!result.destination) return; // Dropped outside the list

    const items = Array.from(categories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onReorder(items); // Update parent state with new order
  };

  if (isLoading) {
    return (
      <div className="w-72 bg-white rounded-lg p-4 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden border border-gray-200">
      <div className="p-4 border-b bg-white/80 backdrop-blur-sm">
        <SlidingInput
          onSubmit={onAddCategory}
          placeholder="Enter category name"
          buttonText="New Category"
        />
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="categories" key="categories">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="p-2 space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto"
            >
              {categories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No categories yet
                </div>
              ) : (
                categories.map((category, index) => (
                  <Draggable
                    key={category.id}
                    draggableId={category.id.toString()}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`
                          group p-4 rounded-xl cursor-pointer
                          transform transition-all duration-300 ease-out
                          ${activeCategory?.id === category.id 
                            ? 'bg-gradient-to-br from-purple-500 to-indigo-600 -translate-y-2 scale-105' 
                            : 'bg-gradient-to-br from-purple-100 to-indigo-100 hover:-translate-y-1 hover:scale-[1.02] hover:from-purple-200 hover:to-indigo-200'}
                          border-2
                          ${activeCategory?.id === category.id
                            ? 'border-purple-300 shadow-[0_20px_40px_-15px_rgba(139,92,246,0.5)]'
                            : 'border-purple-200/50 shadow-[0_15px_30px_-15px_rgba(139,92,246,0.3)] hover:shadow-[0_20px_40px_-15px_rgba(139,92,246,0.4)]'}
                          ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-[0_30px_60px_-15px_rgba(139,92,246,0.6)]' : ''}
                          backdrop-blur-sm
                        `}
                        onClick={() => onCategorySelect(category)}
                      >
                        <div className="flex items-center gap-3">
                          <ChevronRight
                            className={`h-5 w-5 transition-transform duration-300
                              ${activeCategory?.id === category.id 
                                ? 'text-white rotate-90' 
                                : 'text-purple-400 group-hover:text-purple-500'}`}
                          />
                          <div className="flex-1">
                            <h3 className={`font-medium transition-colors text-lg
                              ${activeCategory?.id === category.id 
                                ? 'text-white' 
                                : 'text-purple-700 group-hover:text-purple-800'}`}
                            >
                              {category.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-sm
                                ${activeCategory?.id === category.id 
                                  ? 'text-purple-100' 
                                  : 'text-purple-600 group-hover:text-purple-700'}`}
                              >
                                {category.questions?.length || 0} questions
                              </span>
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

export default SlidingCategoryList;