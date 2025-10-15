import React from 'react';
import { X } from 'lucide-react';

const CreateFunnelModal = ({ isOpen, onClose, onFunnelCreate }) => {
    const funnelTypes = [
        { id: 'lead-magnet', name: 'Lead Magnet', desc: 'Capture leads with valuable content', icon: '📥' },
        { id: 'free-shipping', name: 'Free + Shipping', desc: 'Offer free product, charge shipping', icon: '🚚' },
        { id: 'survey', name: 'Survey', desc: 'Collect data and segment audience', icon: '📊' },
        { id: 'product-sales', name: 'Product Sales', desc: 'Sell products directly', icon: '🛒' },
        { id: 'webinar', name: 'Webinar', desc: 'Host and convert through webinars', icon: '🎥' },
        { id: 'application', name: 'Application', desc: 'Qualify leads through forms', icon: '📝' }
    ];

    const handleFunnelSelect = (funnelType) => {
        onFunnelCreate({
            id: Date.now(),
            name: `New ${funnelType.name}`,
            type: funnelType.name,
            status: 'Draft',
            leads: 0,
            conversions: 0,
            revenue: 0,
            createdAt: new Date().toISOString()
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div style={{
                    position: 'sticky',
                    top: 0,
                    background: 'var(--tg-theme-bg-color)',
                    borderBottom: '1px solid var(--tg-theme-border-color)',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--tg-theme-text-color)' }}>Select Funnel Type</h3>
                    <button
                        onClick={onClose}
                        style={{ color: 'var(--tg-theme-hint-color)', fontSize: '20px', padding: '4px', background: 'none', border: 'none' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {funnelTypes.map(type => (
                            <button
                                key={type.id}
                                onClick={() => handleFunnelSelect(type)}
                                style={{
                                    width: '100%',
                                    background: 'var(--tg-theme-bg-color)',
                                    border: '1px solid var(--tg-theme-border-color)',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    textAlign: 'left',
                                    transition: 'border-color 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.borderColor = 'var(--tg-theme-button-color)'}
                                onMouseOut={(e) => e.target.style.borderColor = 'var(--tg-theme-border-color)'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '24px' }}>{type.icon}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '600', color: 'var(--tg-theme-text-color)', marginBottom: '4px' }}>{type.name}</div>
                                        <div style={{ color: 'var(--tg-theme-hint-color)', fontSize: '12px' }}>{type.desc}</div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateFunnelModal;