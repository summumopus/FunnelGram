import { useState, useEffect } from 'react';

export const useTelegram = () => {
    const [tg, setTg] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const telegram = window.Telegram?.WebApp;
        if (telegram) {
            telegram.ready();
            telegram.expand();
            setTg(telegram);
            setUser(telegram.initDataUnsafe?.user);

            // Set theme based on Telegram's theme
            document.documentElement.setAttribute('data-theme', telegram.colorScheme);
        }
    }, []);

    return {
        tg,
        user,
        themeParams: tg?.themeParams || {}
    };
};