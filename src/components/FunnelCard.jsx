import React from 'react';
import { Edit, Eye, Copy, Trash2 } from 'lucide-react';

const FunnelCard = ({ funnel, onEdit, onPreview, onClone, onDelete }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'Published': return 'bg-green-100 text-green-700';
            case 'Draft': return 'bg-gray-100 text-gray-700';
            case 'Paused': return 'bg-orange-100 text-orange-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="funnel-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: '600', color: 'var(--tg-theme-text-color)' }}>{funnel.name}</h3>
                    <p style={{ color: 'var(--tg-theme-hint-color)', fontSize: '12px' }}>{funnel.type || funnel.funnel_type}</p>
                </div>
                <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px' }} className={getStatusColor(funnel.status)}>
                    {funnel.status}
                </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px', fontSize: '12px' }}>
                <div style={{ background: 'var(--tg-theme-secondary-bg-color)', borderRadius: '8px', padding: '8px' }}>
                    <div style={{ color: 'var(--tg-theme-hint-color)' }}>Leads</div>
                    <div style={{ fontWeight: '600', color: 'var(--tg-theme-text-color)' }}>{funnel.leads || 0}</div>
                </div>
                <div style={{ background: 'var(--tg-theme-secondary-bg-color)', borderRadius: '8px', padding: '8px' }}>
                    <div style={{ color: 'var(--tg-theme-hint-color)' }}>Conv.</div>
                    <div style={{ fontWeight: '600', color: 'var(--tg-theme-text-color)' }}>{funnel.conversions || 0}</div>
                </div>
                <div style={{ background: 'var(--tg-theme-secondary-bg-color)', borderRadius: '8px', padding: '8px' }}>
                    <div style={{ color: 'var(--tg-theme-hint-color)' }}>Revenue</div>
                    <div style={{ fontWeight: '600', color: 'var(--tg-theme-text-color)' }}>${funnel.revenue || 0}</div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
                <button
                    onClick={() => onEdit(funnel)}
                    className="btn-secondary"
                    style={{ flex: 1 }}
                >
                    <Edit size={14} />
                    Edit
                </button>
                <button
                    onClick={() => onPreview(funnel)}
                    className="btn-secondary"
                    style={{ flex: 1 }}
                >
                    <Eye size={14} />
                    Preview
                </button>
                <button
                    onClick={() => onClone(funnel)}
                    className="btn-secondary"
                    style={{ padding: '8px 12px' }}
                >
                    <Copy size={14} />
                </button>
                <button
                    onClick={() => onDelete(funnel)}
                    className="btn-secondary"
                    style={{ padding: '8px 12px', color: '#ef4444' }}
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
};

export default FunnelCard;