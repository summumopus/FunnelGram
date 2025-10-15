import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, X, Type, Image, MousePointer, Square, Video } from 'lucide-react';

const SimpleFunnelEditor = ({ funnel, onSave, onClose }) => {
    const [elements, setElements] = useState([
        {
            id: '1',
            type: 'heading',
            content: 'Welcome to Your Funnel',
            styles: { fontSize: '28px', textAlign: 'center', fontWeight: 'bold' }
        },
        {
            id: '2',
            type: 'paragraph',
            content: 'Start building your amazing funnel! Tap elements to edit.',
            styles: { textAlign: 'center', color: '#666', fontSize: '16px' }
        }
    ]);

    const [editingElement, setEditingElement] = useState(null);

    const elementTypes = [
        { type: 'heading', icon: Type, label: 'Heading', default: 'Your Heading' },
        { type: 'paragraph', icon: Type, label: 'Text', default: 'Your text here...' },
        { type: 'button', icon: MousePointer, label: 'Button', default: 'Click Me' },
        { type: 'image', icon: Image, label: 'Image', default: '' },
        { type: 'form', icon: Square, label: 'Form', default: '' }
    ];

    const addElement = (type) => {
        const newElement = {
            id: Date.now().toString(),
            type,
            content: elementTypes.find(t => t.type === type)?.default || '',
            styles: {}
        };
        setElements([...elements, newElement]);
    };

    const updateElement = (id, updates) => {
        setElements(elements.map(el =>
            el.id === id ? { ...el, ...updates } : el
        ));
    };

    const deleteElement = (id) => {
        setElements(elements.filter(el => el.id !== id));
    };

    const moveElement = (fromIndex, toIndex) => {
        const newElements = [...elements];
        const [moved] = newElements.splice(fromIndex, 1);
        newElements.splice(toIndex, 0, moved);
        setElements(newElements);
    };

    const renderElement = (element, index) => {
        const commonProps = {
            key: element.id,
            className: "element-item",
            onClick: () => setEditingElement(element),
            style: {
                touchAction: 'none',
                cursor: 'pointer',
                marginBottom: '16px',
                padding: '16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                background: 'white'
            }
        };

        switch (element.type) {
            case 'heading':
                return (
                    <motion.div {...commonProps} whileTap={{ scale: 0.98 }}>
                        <h1 style={{
                            fontSize: element.styles?.fontSize || '28px',
                            textAlign: element.styles?.textAlign || 'center',
                            fontWeight: 'bold',
                            margin: 0
                        }}>
                            {element.content}
                        </h1>
                    </motion.div>
                );

            case 'paragraph':
                return (
                    <motion.div {...commonProps} whileTap={{ scale: 0.98 }}>
                        <p style={{
                            fontSize: element.styles?.fontSize || '16px',
                            textAlign: element.styles?.textAlign || 'left',
                            color: element.styles?.color || '#374151',
                            margin: 0,
                            lineHeight: '1.5'
                        }}>
                            {element.content}
                        </p>
                    </motion.div>
                );

            case 'button':
                return (
                    <motion.div {...commonProps} whileTap={{ scale: 0.95 }}>
                        <button style={{
                            width: '100%',
                            padding: '16px 24px',
                            backgroundColor: element.styles?.backgroundColor || '#3B82F6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600'
                        }}>
                            {element.content}
                        </button>
                    </motion.div>
                );

            case 'image':
                return (
                    <motion.div {...commonProps} whileTap={{ scale: 0.98 }}>
                        <div style={{
                            width: '100%',
                            height: '200px',
                            backgroundColor: '#F3F4F6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '8px',
                            border: '2px dashed #D1D5DB'
                        }}>
                            <Image size={32} color="#9CA3AF" />
                        </div>
                        <p style={{ textAlign: 'center', color: '#6B7280', marginTop: '8px', fontSize: '14px' }}>
                            Image Placeholder
                        </p>
                    </motion.div>
                );

            case 'form':
                return (
                    <motion.div {...commonProps} whileTap={{ scale: 0.98 }}>
                        <div style={{
                            padding: '20px',
                            backgroundColor: '#F9FAFB',
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB'
                        }}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    marginBottom: '8px',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '6px',
                                    fontSize: '16px'
                                }}
                            />
                            <button style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: '#10B981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '16px'
                            }}>
                                Submit
                            </button>
                        </div>
                    </motion.div>
                );

            default:
                return <div {...commonProps}>Unknown element</div>;
        }
    };

    return (
        <div style={{
            height: '100vh',
            background: '#f8fafc',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{
                padding: '16px',
                background: 'white',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                    Page Builder
                </h1>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => onSave(elements)}
                        style={{
                            padding: '8px 16px',
                            background: '#10B981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <Save size={16} />
                        Save
                    </button>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '8px 12px',
                            background: '#6B7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px'
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Element Picker */}
            <div style={{
                padding: '12px 16px',
                background: 'white',
                borderBottom: '1px solid #e5e7eb',
                overflowX: 'auto'
            }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {elementTypes.map(({ type, icon: Icon, label }) => (
                        <button
                            key={type}
                            onClick={() => addElement(type)}
                            style={{
                                padding: '12px 16px',
                                background: '#3B82F6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '14px',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <Icon size={16} />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Editor Area */}
            <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
                <div style={{
                    maxWidth: '100%',
                    margin: '0 auto'
                }}>
                    {elements.map((element, index) => (
                        <div key={element.id} style={{ position: 'relative' }}>
                            {renderElement(element, index)}
                            <button
                                onClick={() => deleteElement(element.id)}
                                style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '8px',
                                    background: '#EF4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    width: '24px',
                                    height: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px'
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ))}

                    {elements.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            color: '#6B7280'
                        }}>
                            <Type size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                            <p style={{ fontSize: '18px', marginBottom: '8px' }}>No elements yet</p>
                            <p>Tap buttons above to add elements to your page</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Element Editor Modal */}
            {editingElement && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '12px',
                        width: '100%',
                        maxWidth: '400px'
                    }}>
                        <h3 style={{ marginBottom: '16px' }}>Edit {editingElement.type}</h3>

                        <textarea
                            value={editingElement.content}
                            onChange={(e) => setEditingElement({
                                ...editingElement,
                                content: e.target.value
                            })}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #D1D5DB',
                                borderRadius: '6px',
                                fontSize: '16px',
                                minHeight: '80px',
                                marginBottom: '16px'
                            }}
                        />

                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setEditingElement(null)}
                                style={{
                                    padding: '8px 16px',
                                    background: '#6B7280',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    updateElement(editingElement.id, editingElement);
                                    setEditingElement(null);
                                }}
                                style={{
                                    padding: '8px 16px',
                                    background: '#10B981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px'
                                }}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SimpleFunnelEditor;