import React from 'react';
import FunnelCard from './FunnelCard';

const FunnelList = ({ funnels, onEdit, onPreview, onClone, onDelete }) => {
    if (funnels.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '48px 16px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--tg-theme-text-color)', marginBottom: '8px' }}>No funnels yet</h3>
                <p style={{ color: 'var(--tg-theme-hint-color)', fontSize: '14px' }}>
                    Create your first funnel to start capturing leads and making sales
                </p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {funnels.map(funnel => (
                <FunnelCard
                    key={funnel.id}
                    funnel={funnel}
                    onEdit={onEdit}
                    onPreview={onPreview}
                    onClone={onClone}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};

export default FunnelList;