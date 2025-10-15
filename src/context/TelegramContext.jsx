import React, { createContext, useContext } from 'react';
import { useTelegram } from '../hooks/useTelegram';

const TelegramContext = createContext();

/**
 * Hook to use Telegram context
 * @returns {Object} Telegram context value
 */
export const useTelegramContext = () => {
    const context = useContext(TelegramContext);
    if (!context) {
        throw new Error('useTelegramContext must be used within a TelegramProvider');
    }
    return context;
};

/**
 * Provider component for Telegram context
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const TelegramProvider = ({ children }) => {
    const telegramData = useTelegram();

    return (
        <TelegramContext.Provider value={telegramData}>
            {children}
        </TelegramContext.Provider>
    );
};