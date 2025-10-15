import React, { createContext, useContext } from 'react';
import { useTelegram } from '../hooks/useTelegram';

const TelegramContext = createContext({});

export const useTelegramContext = () => {
    const context = useContext(TelegramContext);
    if (!context) {
        throw new Error('useTelegramContext must be used within a TelegramProvider');
    }
    return context;
};

export const TelegramProvider = ({ children }) => {
    const telegramData = useTelegram();

    return (
        <TelegramContext.Provider value={telegramData}>
            {children}
        </TelegramContext.Provider>
    );
};