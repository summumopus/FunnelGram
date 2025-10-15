import { useState } from 'react';

// Vercel will handle the API routing automatically
const API_BASE = '/api';

export const useApi = () => {
    const [loading, setLoading] = useState(false);

    const authWithTelegram = async (initData) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/auth/telegram`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ initData })
            });
            return await response.json();
        } catch (error) {
            console.error('Auth error:', error);
            return { error: 'Authentication failed' };
        } finally {
            setLoading(false);
        }
    };

    const getFunnels = async (userId) => {
        try {
            const response = await fetch(`${API_BASE}/funnels/${userId}`);
            return await response.json();
        } catch (error) {
            console.error('Get funnels error:', error);
            return { funnels: [] };
        }
    };

    const createFunnel = async (funnelData) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/funnels`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(funnelData)
            });
            return await response.json();
        } catch (error) {
            console.error('Create funnel error:', error);
            return { error: 'Failed to create funnel' };
        } finally {
            setLoading(false);
        }
    };

    const deleteFunnel = async (funnelId) => {
        try {
            const response = await fetch(`${API_BASE}/funnels`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ funnelId })
            });
            return await response.json();
        } catch (error) {
            console.error('Delete funnel error:', error);
            return { error: 'Failed to delete funnel' };
        }
    };

    const getTemplates = async () => {
        try {
            const response = await fetch(`${API_BASE}/templates`);
            return await response.json();
        } catch (error) {
            console.error('Get templates error:', error);
            return { templates: [] };
        }
    };

    return {
        loading,
        authWithTelegram,
        getFunnels,
        createFunnel,
        deleteFunnel,
        getTemplates
    };
};