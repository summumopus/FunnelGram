import { useState } from 'react';

// Vercel will handle the API routing automatically
const API_BASE = '/api';

export const useApi = () => {
    const [loading, setLoading] = useState(false);

    // Helper to build headers with optional initData
    const buildHeaders = (initData) => {
        const headers = { 'Content-Type': 'application/json' };
        if (initData) headers['x-tg-initdata'] = initData;
        return headers;
    };

    const authWithTelegram = async (initData) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/auth/telegram`, {
                method: 'POST',
                headers: buildHeaders(initData),
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

    const getFunnels = async (userId, initData) => {
        try {
            const response = await fetch(`${API_BASE}/funnels/${userId}`, {
                headers: buildHeaders(initData)
            });
            return await response.json();
        } catch (error) {
            console.error('Get funnels error:', error);
            return { funnels: [] };
        }
    };

    const createFunnel = async (funnelData, initData) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/funnels`, {
                method: 'POST',
                headers: buildHeaders(initData),
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

    const updateFunnel = async (funnelId, updates, initData) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/funnels/${encodeURIComponent(funnelId)}`, {
                method: 'PATCH',
                headers: buildHeaders(initData),
                body: JSON.stringify(updates)
            });
            return await response.json();
        } catch (error) {
            console.error('Update funnel error:', error);
            return { error: 'Failed to update funnel' };
        } finally {
            setLoading(false);
        }
    };

    const deleteFunnel = async (funnelId, initData) => {
        try {
            const response = await fetch(`${API_BASE}/funnels`, {
                method: 'DELETE',
                headers: buildHeaders(initData),
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