import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, X, Type, Image, MousePointer, Square, Video, Clock, HelpCircle, Play, Check, ArrowRight, Plus } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const CompleteFunnelBuilder = ({ funnel, onSave, onClose, tg }) => {
    const [elements, setElements] = useState([]);
    const [selectedElement, setSelectedElement] = useState(null);
    const [showTutorial, setShowTutorial] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);
    const [funnelName, setFunnelName] = useState(funnel?.name || 'My Funnel');
    const [showNameEditor, setShowNameEditor] = useState(!funnel?.name);

    const elementTypes = [
        {
            type: 'heading',
            icon: Type,
            label: 'Heading',
            default: 'Your Amazing Headline',
            description: 'Add a compelling headline to grab attention'
        },
        {
            type: 'paragraph',
            icon: Type,
            label: 'Text',
            default: 'Describe your offer and why it\'s valuable...',
            description: 'Add descriptive text to explain your offer'
        },
        {
            type: 'button',
            icon: MousePointer,
            label: 'Button',
            default: 'Get Started Now',
            description: 'Add a call-to-action button'
        },
        {
            type: 'image',
            icon: Image,
            label: 'Image',
            default: '',
            description: 'Add an engaging image or product photo'
        },
        {
            type: 'form',
            icon: Square,
            label: 'Lead Form',
            default: '',
            description: 'Collect emails and leads from visitors'
        },
        {
            type: 'countdown',
            icon: Clock,
            label: 'Countdown',
            default: '',
            description: 'Create urgency with a timer'
        }
    ];

    const tutorialSteps = [
        {
            title: "Welcome to Funnel Builder!",
            message: "Let's build your first high-converting funnel together. I'll guide you through each step.",
            action: "Start Building"
        },
        {
            title: "Step 1: Name Your Funnel",
            message: "Give your funnel a clear name so you can find it later.",
            action: "Got It"
        },
        {
            title: "Step 2: Add Elements",
            message: "Tap the + buttons to add headings, text, buttons, and forms to your page.",
            action: "Show Me"
        },
        {
            title: "Step 3: Edit Content",
            message: "Tap any element to edit its text, style, and settings.",
            action: "Let's Edit"
        },
        {
            title: "Step 4: Save & Publish",
            message: "When you're done, save your funnel and get a shareable link!",
            action: "Start Building!"
        }
    ];

    // Initialize with sample content for new funnels

    // Note: handleSave is declared below; to ensure it's available for MainButton callback
    useEffect(() => {
        if (elements.length === 0 && !funnel?.id) {
            setElements([
                {
                    id: '1',
                    type: 'heading',
                    content: 'Welcome to Your New Funnel!',
                    styles: {
                        fontSize: '32px',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        color: '#1f2937'
                    }
                },
                {
                    id: '2',
                    type: 'paragraph',
                    content: 'This is where you\'ll build your amazing offer. Start by editing this text or adding new elements below.',
                    styles: {
                        textAlign: 'center',
                        color: '#6b7280',
                        fontSize: '18px',
                        lineHeight: '1.6'
                    }
                },
                {
                    id: '3',
                    type: 'button',
                    content: 'Get Started Today',
                    styles: {
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '16px 32px',
                        borderRadius: '8px',
                        fontSize: '18px',
                        fontWeight: '600'
                    }
                }
            ]);
        } else if (funnel?.elements) {
            setElements(funnel.elements);
        }
    }, [funnel]);

    const addElement = (type) => {
        const template = elementTypes.find(t => t.type === type);
        const newElement = {
            id: Date.now().toString(),
            type,
            content: template.default,
            styles: getDefaultStyles(type)
        };

        setElements([...elements, newElement]);
        setSelectedElement(newElement);

        toast.success(`Added ${template.label}! Tap to edit it.`, {
            duration: 3000,
            icon: '🎉'
        });
    };

    const getDefaultStyles = (type) => {
        const styles = {
            heading: {
                fontSize: '32px',
                textAlign: 'center',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '16px'
            },
            paragraph: {
                fontSize: '18px',
                textAlign: 'center',
                color: '#6b7280',
                lineHeight: '1.6',
                marginBottom: '16px'
            },
            button: {
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '16px 32px',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: '600',
                border: 'none',
                width: '100%',
                marginBottom: '16px'
            },
            image: {
                width: '100%',
                borderRadius: '12px',
                marginBottom: '16px'
            },
            form: {
                padding: '24px',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                border: '2px dashed #d1d5db',
                marginBottom: '16px'
            },
            countdown: {
                padding: '20px',
                backgroundColor: '#fef3c7',
                borderRadius: '12px',
                textAlign: 'center',
                marginBottom: '16px'
            }
        };
        return styles[type] || {};
    };

    const updateElement = (id, updates) => {
        setElements(elements.map(el =>
            el.id === id ? { ...el, ...updates } : el
        ));
    };

    const deleteElement = (id) => {
        setElements(elements.filter(el => el.id !== id));
        if (selectedElement?.id === id) {
            setSelectedElement(null);
        }
        toast.success('Element deleted');
    };

    const moveElement = (id, direction) => {
        const index = elements.findIndex(el => el.id === id);
        if ((direction === 'up' && index > 0) || (direction === 'down' && index < elements.length - 1)) {
            const newElements = [...elements];
            const newIndex = direction === 'up' ? index - 1 : index + 1;
            [newElements[index], newElements[newIndex]] = [newElements[newIndex], newElements[index]];
            setElements(newElements);
        }
    };

    const handleSave = () => {
        const funnelData = {
            ...funnel,
            name: funnelName,
            elements: elements,
            updatedAt: new Date().toISOString()
        };
        // Support async onSave (e.g. calling API). Prevent double-saves via isSaving flag.
        if (handleSaveRef.saving) return;
        setIsSaving(true);
        const done = () => {
            setIsSaving(false);
            toast.success('Funnel saved successfully! 🎉');
            if (tg) {
                try { tg.showAlert('✅ Funnel saved! You can now share it with your audience.'); } catch (e) { }
            }
            // briefly show 'Saved' on MainButton
            try {
                if (tg && tg.MainButton) {
                    tg.MainButton.setText('Saved');
                    setTimeout(() => {
                        try { tg.MainButton.setText('Save'); } catch (e) { }
                    }, 1200);
                }
            } catch (e) { }
        };

        try {
            const res = onSave(funnelData);
            if (res && typeof res.then === 'function') {
                handleSaveRef.saving = true;
                res.then(() => {
                    handleSaveRef.saving = false;
                    done();
                }).catch((err) => {
                    handleSaveRef.saving = false;
                    setIsSaving(false);
                    toast.error('Save failed. Please try again.');
                    console.error('save error', err);
                });
            } else {
                done();
            }
        } catch (err) {
            setIsSaving(false);
            toast.error('Save failed.');
            console.error(err);
        }
    };

    const [isSaving, setIsSaving] = React.useState(false);

    // Stable ref to the latest handleSave so MainButton callback isn't stale
    const handleSaveRef = useRef(handleSave);
    useEffect(() => { handleSaveRef.current = handleSave; }, [handleSave, elements, funnelName]);

    // Register Telegram MainButton safely after handleSave is defined and keep it in sync
    useEffect(() => {
        let mainButtonHandler = null;
        try {
            if (tg && tg.MainButton) {
                tg.MainButton.setText(isSaving ? 'Saving...' : 'Save');
                if (isSaving && tg.MainButton.disable) tg.MainButton.disable();
                else if (!isSaving && tg.MainButton.enable) tg.MainButton.enable();
                tg.MainButton.show();
                mainButtonHandler = () => {
                    try {
                        handleSaveRef.current && handleSaveRef.current();
                    } catch (err) {
                        console.error('Error in MainButton handler', err);
                    }
                };
                if (tg.MainButton.onClick) {
                    tg.MainButton.onClick(mainButtonHandler);
                }
            }
        } catch (e) {
            // ignore if MainButton API not present
        }

        return () => {
            try {
                if (tg && tg.MainButton) {
                    if (mainButtonHandler && tg.MainButton.offClick) tg.MainButton.offClick(mainButtonHandler);
                    tg.MainButton.hide();
                }
            } catch (e) {
                // ignore
            }
        };
    }, [tg, isSaving]);

    const nextTutorialStep = () => {
        if (currentStep < tutorialSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            setShowTutorial(false);
            setShowNameEditor(true);
            toast('🎯 Tutorial complete! Start building your funnel.', {
                duration: 4000,
                icon: '🚀'
            });
        }
    };

    const renderElement = (element) => {
        const baseStyle = {
            position: 'relative',
            padding: '16px',
            marginBottom: '16px',
            borderRadius: '12px',
            border: selectedElement?.id === element.id ? '3px solid #3b82f6' : '2px solid #e5e7eb',
            background: 'white',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
        };

        switch (element.type) {
            case 'heading':
                return (
                    <motion.div
                        style={baseStyle}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedElement(element)}
                    >
                        <h1 style={element.styles}>
                            {element.content}
                        </h1>
                    </motion.div>
                );

            case 'paragraph':
                return (
                    <motion.div
                        style={baseStyle}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedElement(element)}
                    >
                        <p style={element.styles}>
                            {element.content}
                        </p>
                    </motion.div>
                );

            case 'button':
                return (
                    <motion.div
                        style={baseStyle}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedElement(element)}
                    >
                        <button style={element.styles}>
                            {element.content}
                        </button>
                    </motion.div>
                );

            case 'image':
                return (
                    <motion.div
                        style={baseStyle}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedElement(element)}
                    >
                        <div style={{
                            width: '100%',
                            height: '200px',
                            backgroundColor: '#f3f4f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '8px',
                            border: '2px dashed #d1d5db'
                        }}>
                            <Image size={48} color="#9ca3af" />
                        </div>
                        <p style={{
                            textAlign: 'center',
                            color: '#6b7280',
                            marginTop: '8px',
                            fontSize: '14px'
                        }}>
                            📸 Image Placeholder - Add your product photo
                        </p>
                    </motion.div>
                );

            case 'form':
                return (
                    <motion.div
                        style={baseStyle}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedElement(element)}
                    >
                        <div style={element.styles}>
                            <h3 style={{ marginBottom: '16px', textAlign: 'center' }}>Get Started</h3>
                            <input
                                type="text"
                                placeholder="Your Name"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    marginBottom: '8px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '16px'
                                }}
                            />
                            <input
                                type="email"
                                placeholder="Your Email"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    marginBottom: '12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '16px'
                                }}
                            />
                            <button style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '16px',
                                fontWeight: '600'
                            }}>
                                Submit
                            </button>
                        </div>
                    </motion.div>
                );

            case 'countdown':
                return (
                    <motion.div
                        style={baseStyle}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedElement(element)}
                    >
                        <div style={element.styles}>
                            <Clock size={32} style={{ margin: '0 auto 8px', display: 'block' }} />
                            <p style={{
                                textAlign: 'center',
                                fontWeight: 'bold',
                                color: '#92400e',
                                margin: 0
                            }}>
                                ⏰ Limited Time Offer
                            </p>
                            <p style={{
                                textAlign: 'center',
                                color: '#92400e',
                                margin: 0,
                                fontSize: '14px'
                            }}>
                                Offer ends in: 24:00:00
                            </p>
                        </div>
                    </motion.div>
                );

            default:
                return <div style={baseStyle}>Unknown element</div>;
        }
    };

    return (
        <div style={{
            height: '100vh',
            background: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
        }}>
            <Toaster position="top-center" />

            {/* Tutorial Overlay */}
            <AnimatePresence>
                {showTutorial && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0.8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px',
                            zIndex: 1000
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{
                                background: 'white',
                                padding: '24px',
                                borderRadius: '16px',
                                textAlign: 'center',
                                maxWidth: '400px',
                                width: '100%'
                            }}
                        >
                            <div style={{
                                background: '#3b82f6',
                                color: 'white',
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px',
                                fontSize: '20px',
                                fontWeight: 'bold'
                            }}>
                                {currentStep + 1}
                            </div>

                            <h2 style={{ marginBottom: '12px', color: '#1f2937' }}>
                                {tutorialSteps[currentStep].title}
                            </h2>

                            <p style={{
                                marginBottom: '24px',
                                color: '#6b7280',
                                lineHeight: '1.5',
                                fontSize: '16px'
                            }}>
                                {tutorialSteps[currentStep].message}
                            </p>

                            <button
                                onClick={nextTutorialStep}
                                style={{
                                    padding: '12px 24px',
                                    background: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    margin: '0 auto'
                                }}
                            >
                                {tutorialSteps[currentStep].action}
                                <ArrowRight size={16} />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div style={{
                padding: '16px',
                background: 'white',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={() => setShowNameEditor(true)}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: '#1f2937',
                            cursor: 'pointer'
                        }}
                    >
                        {funnelName} ✏️
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setShowTutorial(true)}
                        style={{
                            padding: '8px 12px',
                            background: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <HelpCircle size={16} />
                        Help
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        style={{
                            padding: '8px 16px',
                            background: isSaving ? '#059669' : '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: '600',
                            opacity: isSaving ? 0.9 : 1,
                            cursor: isSaving ? 'default' : 'pointer'
                        }}
                    >
                        <Save size={16} />
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>

                    <button
                        onClick={onClose}
                        style={{
                            padding: '8px 12px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px'
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Funnel Name Editor */}
            <AnimatePresence>
                {showNameEditor && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                            padding: '16px',
                            background: '#f0f9ff',
                            borderBottom: '1px solid #bae6fd'
                        }}
                    >
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                                type="text"
                                value={funnelName}
                                onChange={(e) => setFunnelName(e.target.value)}
                                placeholder="Enter funnel name..."
                                style={{
                                    flex: 1,
                                    padding: '8px 12px',
                                    border: '1px solid #bae6fd',
                                    borderRadius: '6px',
                                    fontSize: '16px'
                                }}
                            />
                            <button
                                onClick={() => setShowNameEditor(false)}
                                style={{
                                    padding: '8px 16px',
                                    background: '#0ea5e9',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px'
                                }}
                            >
                                <Check size={16} />
                            </button>
                        </div>
                        <p style={{ margin: '8px 0 0', color: '#0369a1', fontSize: '14px' }}>
                            💡 Give your funnel a clear name like "Lead Magnet Funnel" or "Product Launch"
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Element Picker */}
            <div style={{
                padding: '16px',
                background: 'white',
                borderBottom: '1px solid #e5e7eb'
            }}>
                <h3 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={20} />
                    Add Elements to Your Page
                </h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px'
                }}>
                    {elementTypes.map(({ type, icon: Icon, label, description }) => (
                        <motion.button
                            key={type}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => addElement(type)}
                            style={{
                                padding: '12px 8px',
                                background: '#f8fafc',
                                border: '2px solid #e5e7eb',
                                borderRadius: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.borderColor = '#3b82f6';
                                e.target.style.background = '#f0f9ff';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.borderColor = '#e5e7eb';
                                e.target.style.background = '#f8fafc';
                            }}
                        >
                            <Icon size={20} color="#3b82f6" />
                            <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                                {label}
                            </span>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Editor Area */}
            <div style={{
                flex: 1,
                padding: '16px',
                overflowY: 'auto',
                background: '#f8fafc'
            }}>
                <div style={{
                    maxWidth: '100%',
                    margin: '0 auto'
                }}>
                    {/* Empty State */}
                    {elements.length === 0 && !showTutorial && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                textAlign: 'center',
                                padding: '60px 20px',
                                background: 'white',
                                borderRadius: '12px',
                                border: '2px dashed #d1d5db'
                            }}
                        >
                            <Type size={48} color="#9ca3af" style={{ marginBottom: '16px' }} />
                            <h3 style={{ marginBottom: '8px', color: '#374151' }}>
                                Your funnel is empty
                            </h3>
                            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                                Start building by adding elements above! 🚀
                            </p>
                            <button
                                onClick={() => addElement('heading')}
                                style={{
                                    padding: '12px 24px',
                                    background: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }}
                            >
                                Add Your First Element
                            </button>
                        </motion.div>
                    )}

                    {/* Elements List */}
                    {elements.map((element, index) => (
                        <motion.div
                            key={element.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            {renderElement(element)}

                            {/* Element Controls */}
                            {selectedElement?.id === element.id && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{
                                        background: 'white',
                                        padding: '16px',
                                        borderRadius: '8px',
                                        border: '2px solid #3b82f6',
                                        marginBottom: '16px'
                                    }}
                                >
                                    <h4 style={{ marginBottom: '12px' }}>Edit {element.type.charAt(0).toUpperCase() + element.type.slice(1)}</h4>

                                    <textarea
                                        value={element.content}
                                        onChange={(e) => updateElement(element.id, { content: e.target.value })}
                                        placeholder={`Enter your ${element.type} text...`}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            fontSize: '16px',
                                            minHeight: '80px',
                                            marginBottom: '12px'
                                        }}
                                    />

                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        <button
                                            onClick={() => deleteElement(element.id)}
                                            style={{
                                                padding: '8px 12px',
                                                background: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontSize: '14px'
                                            }}
                                        >
                                            Delete
                                        </button>

                                        {index > 0 && (
                                            <button
                                                onClick={() => moveElement(element.id, 'up')}
                                                style={{
                                                    padding: '8px 12px',
                                                    background: '#6b7280',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                Move Up
                                            </button>
                                        )}

                                        {index < elements.length - 1 && (
                                            <button
                                                onClick={() => moveElement(element.id, 'down')}
                                                style={{
                                                    padding: '8px 12px',
                                                    background: '#6b7280',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                Move Down
                                            </button>
                                        )}

                                        <button
                                            onClick={() => setSelectedElement(null)}
                                            style={{
                                                padding: '8px 12px',
                                                background: '#6b7280',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontSize: '14px'
                                            }}
                                        >
                                            Done Editing
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Bottom Help Bar */}
            <div style={{
                padding: '12px 16px',
                background: '#fffbeb',
                borderTop: '1px solid #fcd34d',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: '#92400e'
            }}>
                <HelpCircle size={16} />
                <span>
                    💡 <strong>Tip:</strong> {selectedElement
                        ? `Editing ${selectedElement.type} - Change text and tap "Done Editing" when finished`
                        : 'Tap any element to edit it, or add new elements above'
                    }
                </span>
            </div>
        </div>
    );
};

export default CompleteFunnelBuilder;