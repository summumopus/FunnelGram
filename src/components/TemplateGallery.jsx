import React, { useState, useEffect } from 'react';
import { Star, Download, Eye } from 'lucide-react';

const TemplateGallery = ({ onTemplateSelect, onClose }) => {
    const [templates, setTemplates] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            const response = await fetch('/api/templates');
            const data = await response.json();
            setTemplates(data.templates || []);
        } catch (error) {
            console.error('Error loading templates:', error);
            // Fallback templates
            setTemplates([
                {
                    id: '1',
                    name: 'Lead Magnet Capture',
                    category: 'lead-magnet',
                    description: 'Perfect for capturing emails with free offers',
                    is_premium: false
                },
                {
                    id: '2',
                    name: 'Product Sales Page',
                    category: 'product-sales',
                    description: 'Sell your products with high-converting pages',
                    is_premium: false
                },
                {
                    id: '3',
                    name: 'Webinar Registration',
                    category: 'webinar',
                    description: 'Build your email list with webinar signups',
                    is_premium: false
                }
            ]);
        }
    };

    const categories = ['all', 'lead-magnet', 'product-sales', 'webinar', 'survey', 'application'];

    const filteredTemplates = selectedCategory === 'all'
        ? templates
        : templates.filter(t => t.category === selectedCategory);

    const getCategoryDisplayName = (category) => {
        return category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxHeight: '90vh' }}>
                <div style={{
                    padding: '16px',
                    borderBottom: '1px solid var(--tg-theme-border-color)',
                    background: 'var(--tg-theme-bg-color)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--tg-theme-text-color)' }}>
                            Choose a Template
                        </h2>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', color: 'var(--tg-theme-hint-color)' }}>
                            ×
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                style={{
                                    padding: '8px 16px',
                                    background: selectedCategory === category ? 'var(--tg-theme-button-color)' : 'var(--tg-theme-secondary-bg-color)',
                                    color: selectedCategory === category ? 'var(--tg-theme-button-text-color)' : 'var(--tg-theme-text-color)',
                                    border: 'none',
                                    borderRadius: '20px',
                                    fontSize: '14px',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {getCategoryDisplayName(category)}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{
                    padding: '16px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '16px',
                    overflowY: 'auto'
                }}>
                    {filteredTemplates.map(template => (
                        <div
                            key={template.id}
                            style={{
                                background: 'var(--tg-theme-bg-color)',
                                border: '1px solid var(--tg-theme-border-color)',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }}
                            onClick={() => onTemplateSelect(template)}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-4px)';
                                e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            <div style={{
                                height: '160px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: 'bold'
                            }}>
                                <Eye size={32} />
                            </div>

                            <div style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--tg-theme-text-color)' }}>
                                        {template.name}
                                    </h3>
                                    {template.is_premium && (
                                        <Star size={16} color="#F59E0B" fill="#F59E0B" />
                                    )}
                                </div>

                                <p style={{ fontSize: '12px', color: 'var(--tg-theme-hint-color)', marginBottom: '12px' }}>
                                    {getCategoryDisplayName(template.category)} Template
                                </p>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <button
                                        style={{
                                            padding: '8px 16px',
                                            background: 'var(--tg-theme-button-color)',
                                            color: 'var(--tg-theme-button-text-color)',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        <Download size={14} />
                                        Use Template
                                    </button>

                                    <span style={{ fontSize: '10px', color: 'var(--tg-theme-hint-color)' }}>
                                        Free
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TemplateGallery;