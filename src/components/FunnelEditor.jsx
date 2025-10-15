import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Type, Image, MousePointer, Square, Video, Clock, Trash2, Eye, Save } from 'lucide-react';

const ElementTypes = {
    heading: { icon: Type, label: 'Heading', defaultContent: 'Your Heading Here' },
    paragraph: { icon: Type, label: 'Text', defaultContent: 'Your text content here...' },
    button: { icon: MousePointer, label: 'Button', defaultContent: 'Click Me' },
    image: { icon: Image, label: 'Image', defaultContent: '' },
    video: { icon: Video, label: 'Video', defaultContent: '' },
    countdown: { icon: Clock, label: 'Countdown', defaultContent: '' },
    form: { icon: Square, label: 'Form', defaultContent: '' }
};

const SortableElement = ({ element, onUpdate, onDelete }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: element.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const ElementIcon = ElementTypes[element.type]?.icon || Type;

    const renderElement = () => {
        switch (element.type) {
            case 'heading':
                return (
                    <h2
                        contentEditable
                        onBlur={(e) => onUpdate({ ...element, content: e.target.textContent })}
                        style={{ fontSize: element.styles?.fontSize || '24px', textAlign: element.styles?.textAlign || 'left' }}
                        className="outline-none"
                    >
                        {element.content}
                    </h2>
                );
            case 'paragraph':
                return (
                    <p
                        contentEditable
                        onBlur={(e) => onUpdate({ ...element, content: e.target.textContent })}
                        style={{ textAlign: element.styles?.textAlign || 'left', color: element.styles?.color || '#666666' }}
                        className="outline-none"
                    >
                        {element.content}
                    </p>
                );
            case 'button':
                return (
                    <button
                        style={{
                            backgroundColor: element.styles?.backgroundColor || '#3B82F6',
                            color: element.styles?.color || 'white',
                            padding: element.styles?.padding || '12px 24px',
                            borderRadius: element.styles?.borderRadius || '8px',
                            border: 'none',
                            fontSize: '16px'
                        }}
                        className="w-full"
                    >
                        {element.content}
                    </button>
                );
            case 'image':
                return (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <div style={{
                            width: element.styles?.width || '100%',
                            height: element.styles?.height || '200px',
                            backgroundColor: '#F3F4F6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '8px'
                        }}>
                            <Image size={32} color="#9CA3AF" />
                        </div>
                        <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '8px' }}>Image Placeholder</p>
                    </div>
                );
            case 'countdown':
                return (
                    <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#FEF3C7', borderRadius: '8px' }}>
                        <Clock size={24} style={{ marginBottom: '8px' }} />
                        <p style={{ fontSize: '14px', color: '#92400E' }}>Countdown Timer</p>
                    </div>
                );
            case 'form':
                return (
                    <div style={{ padding: '20px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            style={{
                                width: '100%',
                                padding: '12px',
                                marginBottom: '8px',
                                border: '1px solid #D1D5DB',
                                borderRadius: '4px'
                            }}
                        />
                        <button style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: '#10B981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px'
                        }}>
                            Submit
                        </button>
                    </div>
                );
            default:
                return <div>Unknown element type</div>;
        }
    };

    return (
        <div ref={setNodeRef} style={style} className="element-wrapper">
            <div className="element-toolbar">
                <div {...attributes} {...listeners} className="drag-handle">
                    <GripVertical size={16} />
                </div>
                <ElementIcon size={16} />
                <span className="element-label">{ElementTypes[element.type]?.label}</span>
                <button onClick={() => onDelete(element.id)} className="delete-btn">
                    <Trash2 size={14} />
                </button>
            </div>
            <div className="element-content">
                {renderElement()}
            </div>
        </div>
    );
};

const FunnelEditor = ({ funnel, onSave, onExit }) => {
    const [elements, setElements] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        // Load initial elements or start with empty
        setElements([
            {
                id: 'element-1',
                type: 'heading',
                content: 'Welcome to Your Funnel',
                styles: { fontSize: '32px', textAlign: 'center' }
            },
            {
                id: 'element-2',
                type: 'paragraph',
                content: 'Start building your amazing funnel by adding elements from the left panel.',
                styles: { textAlign: 'center', color: '#666666' }
            }
        ]);
    }, []);

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setElements((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                const newItems = [...items];
                const [movedItem] = newItems.splice(oldIndex, 1);
                newItems.splice(newIndex, 0, movedItem);
                return newItems;
            });
        }
    };

    const addElement = (type) => {
        const newElement = {
            id: `element-${Date.now()}`,
            type,
            content: ElementTypes[type].defaultContent,
            styles: {}
        };
        setElements([...elements, newElement]);
    };

    const updateElement = (updatedElement) => {
        setElements(elements.map(el =>
            el.id === updatedElement.id ? updatedElement : el
        ));
    };

    const deleteElement = (elementId) => {
        setElements(elements.filter(el => el.id !== elementId));
    };

    const saveFunnel = async () => {
        setIsSaving(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            onSave && onSave();
        } catch (error) {
            console.error('Error saving funnel:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--tg-theme-secondary-bg-color)'
        }}>
            {/* Header */}
            <div style={{
                padding: '16px',
                borderBottom: '1px solid var(--tg-theme-border-color)',
                background: 'var(--tg-theme-bg-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--tg-theme-text-color)' }}>
                        {funnel?.name || 'Funnel Editor'}
                    </h2>
                    <p style={{ fontSize: '12px', color: 'var(--tg-theme-hint-color)' }}>
                        Drag and drop to build your page
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={saveFunnel}
                        disabled={isSaving}
                        style={{
                            padding: '8px 16px',
                            background: 'var(--tg-theme-button-color)',
                            color: 'var(--tg-theme-button-text-color)',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <Save size={16} />
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                        onClick={onExit}
                        style={{
                            padding: '8px 16px',
                            background: 'var(--tg-theme-secondary-bg-color)',
                            color: 'var(--tg-theme-text-color)',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px'
                        }}
                    >
                        Exit
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Element Library */}
                <div style={{
                    width: '80px',
                    background: 'var(--tg-theme-bg-color)',
                    borderRight: '1px solid var(--tg-theme-border-color)',
                    padding: '16px 8px',
                    overflowY: 'auto'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {Object.entries(ElementTypes).map(([type, { icon: Icon, label }]) => (
                            <button
                                key={type}
                                onClick={() => addElement(type)}
                                style={{
                                    padding: '12px',
                                    background: 'var(--tg-theme-secondary-bg-color)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '10px',
                                    color: 'var(--tg-theme-text-color)'
                                }}
                            >
                                <Icon size={20} />
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Editor Canvas */}
                <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                    <div style={{
                        maxWidth: '400px',
                        margin: '0 auto',
                        background: 'white',
                        minHeight: '600px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        padding: '20px'
                    }}>
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext items={elements} strategy={verticalListSortingStrategy}>
                                {elements.map((element) => (
                                    <SortableElement
                                        key={element.id}
                                        element={element}
                                        onUpdate={updateElement}
                                        onDelete={deleteElement}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>

                        {elements.length === 0 && (
                            <div style={{
                                textAlign: 'center',
                                padding: '40px 20px',
                                color: '#9CA3AF'
                            }}>
                                <Eye size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                                <p>Drag elements from the left to start building your page</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
        .element-wrapper {
          margin-bottom: 16px;
          border: 2px solid transparent;
          border-radius: 8px;
          transition: border-color 0.2s;
        }
        .element-wrapper:hover {
          border-color: var(--tg-theme-button-color);
        }
        .element-toolbar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          background: #F9FAFB;
          border-bottom: 1px solid #E5E7EB;
          font-size: 12px;
          color: #6B7280;
        }
        .drag-handle {
          cursor: grab;
          padding: 4px;
        }
        .drag-handle:active {
          cursor: grabbing;
        }
        .element-label {
          flex: 1;
          font-weight: 500;
        }
        .delete-btn {
          background: none;
          border: none;
          color: #EF4444;
          cursor: pointer;
          padding: 4px;
        }
        .element-content {
          padding: 16px;
        }
      `}</style>
        </div>
    );
};

export default FunnelEditor;