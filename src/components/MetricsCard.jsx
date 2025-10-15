import React from 'react';

const MetricsCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => {
    const colorMap = {
        blue: 'text-blue-500 bg-blue-100',
        green: 'text-green-500 bg-green-100',
        purple: 'text-purple-500 bg-purple-100',
        orange: 'text-orange-500 bg-orange-100'
    };

    return (
        <div className="metrics-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ padding: '8px', borderRadius: '8px' }} className={colorMap[color]}>
                    <Icon size={20} />
                </div>
                <span style={{ fontSize: '12px', color: 'var(--tg-theme-hint-color)' }}>Total</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--tg-theme-text-color)' }}>{value}</div>
            <div style={{ fontSize: '12px', color: 'var(--tg-theme-hint-color)' }}>{title}</div>
            {subtitle && (
                <div style={{ fontSize: '12px', color: 'var(--tg-theme-hint-color)', marginTop: '4px' }}>{subtitle}</div>
            )}
        </div>
    );
};

export default MetricsCard;