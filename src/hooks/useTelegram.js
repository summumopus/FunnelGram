import { useState, useEffect } from 'react';

/**
 * Custom hook for Telegram WebApp integration
 * @returns {Object} Telegram context object
 * @property {Object|null} tg - Telegram WebApp instance
 * @property {Object|null} user - Telegram user data
 * @property {Object} themeParams - Telegram theme parameters
 * @property {boolean} isDarkMode - Whether dark mode is active
 */
export const useTelegram = () => {
    const [tg, setTg] = useState(null);
    const [user, setUser] = useState(null);
    const [themeParams, setThemeParams] = useState({});

    useEffect(() => {
        const telegram = window.Telegram?.WebApp;
        if (telegram) {
            telegram.ready();
            telegram.expand();

            setTg(telegram);
            setUser(telegram.initDataUnsafe?.user || null);
            setThemeParams(telegram.themeParams || {});

            // Set theme based on Telegram's theme
            document.documentElement.setAttribute('data-theme', telegram.colorScheme);
        }
    }, []);

    const isDarkMode = tg?.colorScheme === 'dark';

    return {
        tg,
        user,
        themeParams,
        isDarkMode
    };
};