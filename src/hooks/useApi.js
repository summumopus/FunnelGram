import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const useApi = () => {
    const [loading, setLoading] = useState(false);

    const authWithTelegram = async (initData) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/api/auth/telegram`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ initData })
            });
            return await response.json();
        } finally {
            setLoading(false);
        }
    };

    const getFunnels = async (userId) => {
        const response = await fetch(`${API_BASE}/api/funnels/${userId}`);
        return await response.json();
    };

    const createFunnel = async (funnelData) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/api/funnels`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(funnelData)
            });
            return await response.json();
        } finally {
            setLoading(false);
        }
    };

    const updateFunnel = async (funnelId, updates) => {
        const response = await fetch(`${API_BASE}/api/funnels/${funnelId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        return await response.json();
    };

    const deleteFunnel = async (funnelId) => {
        const response = await fetch(`${API_BASE}/api/funnels/${funnelId}`, {
            method: 'DELETE'
        });
        return await response.json();
    };

    const connectEmailProvider = async (providerData) => {
        const response = await fetch(`${API_BASE}/api/connect-email-provider`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(providerData)
        });
        return await response.json();
    };

    return {
        loading,
        authWithTelegram,
        getFunnels,
        createFunnel,
        updateFunnel,
        deleteFunnel,
        connectEmailProvider
    };
};