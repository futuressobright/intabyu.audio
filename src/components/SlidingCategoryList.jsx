import React from 'react';
import { ChevronRight, Plus, ListPlus, Folder } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import SlidingInput from './SlidingInput';

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
      <div className="w-80 bg-white/80 backdrop-blur-sm rounded-2xl p-4 space-y-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-200/50 shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-br from-white to-gray-50">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Categories</h2>
        <SlidingInput
          onSubmit={onAddCategory}
          placeholder="Enter category name"
          buttonText="New Category"
          icon={<ListPlus className="w-4 h-4" />}
        />
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="categories">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`p-3 space-y-2 max-h-[calc(100vh-16rem)] overflow-y-auto
                ${snapshot.isDraggingOver ? 'bg-blue-50/50' : ''}`}
            >
              {categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <Folder className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-sm">No categories yet</p>
                  <button
                    onClick={() => document.querySelector('.sliding-input-trigger')?.click()}
                    className="mt-2 text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add your first category
                  </button>
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
                        onClick={() => onCategorySelect(category)}
                        className={`
                          group relative rounded-xl cursor-pointer select-none
                          transform transition-all duration-300 ease-out
                          ${activeCategory?.id === category.id 
                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 -translate-y-1 scale-[1.02]' 
                            : 'bg-white hover:-translate-y-1 hover:scale-[1.01]'}
                          ${snapshot.isDragging ? 'rotate-2 scale-105' : ''}
                          border
                          ${activeCategory?.id === category.id
                            ? 'border-blue-400/30 shadow-[0_12px_24px_-6px_rgba(37,99,235,0.25)]'
                            : 'border-gray-200 shadow-md hover:shadow-lg hover:border-blue-200'}
                        `}
                      >
                        {/* Drag Handle Indicator */}
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl bg-gradient-to-b from-gray-200/50 to-gray-300/50 group-hover:from-blue-200/50 group-hover:to-blue-300/50"></div>

                        <div className="p-4">
                          <div className="flex items-center gap-3">
                            <ChevronRight
                              className={`h-5 w-5 transition-transform duration-300
                                ${activeCategory?.id === category.id 
                                  ? 'text-white rotate-90' 
                                  : 'text-blue-500 group-hover:text-blue-600'}`}
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className={`font-semibold text-lg truncate
                                ${activeCategory?.id === category.id 
                                  ? 'text-white' 
                                  : 'text-gray-700'}`}
                              >
                                {category.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-sm
                                  ${activeCategory?.id === category.id 
                                    ? 'text-blue-100' 
                                    : 'text-gray-500'}`}
                                >
                                  {category.questions?.length || 0} questions
                                </span>
                                {/* Progress Indicator */}
                                {category.questions?.length > 0 && (
                                  <div className={`h-1.5 flex-1 rounded-full overflow-hidden
                                    ${activeCategory?.id === category.id 
                                      ? 'bg-blue-400/30' 
                                      : 'bg-gray-100'}`}
                                  >
                                    <div
                                      className={`h-full rounded-full
                                        ${activeCategory?.id === category.id 
                                          ? 'bg-blue-200' 
                                          : 'bg-blue-500'}`}
                                      style={{ width: '60%' }} // TODO: Calculate actual progress
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
    </div>
  );
};

export default SlidingCategoryList;