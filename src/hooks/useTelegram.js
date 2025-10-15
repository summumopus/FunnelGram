import { useState, useEffect, useCallback } from 'react'

/**
 * Custom hook for Telegram WebApp integration
 * Provides robust lifecycle handling, theme mapping to CSS variables,
 * and helper methods for MainButton and back button.
 */
export const useTelegram = () => {
    const [tg, setTg] = useState(null);
    const [user, setUser] = useState(null);
    const [themeParams, setThemeParams] = useState({});
    const [ready, setReady] = useState(false);

    // Map Telegram theme params to CSS variables for app styling
    const applyThemeToDocument = useCallback((params = {}) => {
        const root = document.documentElement;
        if (!params) return;

        // Common Telegram theme params: bg_color, text_color, button_color, button_text_color
        const mapping = {
            bg_color: '--tg-theme-bg-color',
            secondary_bg_color: '--tg-theme-secondary-bg-color',
            text_color: '--tg-theme-text-color',
            hint_color: '--tg-theme-hint-color',
            link_color: '--tg-theme-link-color',
            button_color: '--tg-theme-button-color',
            button_text_color: '--tg-theme-button-text-color',
            border_color: '--tg-theme-border-color'
        };

        Object.entries(mapping).forEach(([tgKey, cssVar]) => {
            if (params[tgKey]) root.style.setProperty(cssVar, params[tgKey]);
        });

        // Also set a data attribute for color scheme
        if (params?.color_scheme) {
            root.setAttribute('data-theme', params.color_scheme);
        }
    }, []);

    useEffect(() => {
        const telegram = window.Telegram?.WebApp;
        if (!telegram) return;

        telegram.ready();
        // Expand to use available space but be mindful on small screens
        try {
            telegram.expand();
        } catch (e) {
            // ignore if expand is not allowed
        }

        setTg(telegram);
        setUser(telegram.initDataUnsafe?.user || null);

        const params = telegram.themeParams || {};
        const normalized = { ...params, color_scheme: telegram.colorScheme };
        setThemeParams(normalized);
        applyThemeToDocument(normalized);

        setReady(true);

        // Event listeners
        const onSettingsChanged = () => {
            const newParams = telegram.themeParams || {};
            const newNormalized = { ...newParams, color_scheme: telegram.colorScheme };
            setThemeParams(newNormalized);
            applyThemeToDocument(newNormalized);
        };

        // Telegram WebApp doesn't have a unified event emitter across versions,
        // but `onEvent` exists in many versions to listen for 'themeChanged' etc.
        try {
            telegram.onEvent && telegram.onEvent('themeChanged', onSettingsChanged);
        } catch (e) {
            // ignore if not supported
        }

        // Expose a handler for back button if present
        const onBack = () => {
            // Default: close the web app on back
            try {
                telegram.close();
            } catch (e) {
                // ignore
            }
        };

        try {
            telegram.onEvent && telegram.onEvent('backButtonClicked', onBack);
        } catch (e) {
            // ignore
        }

        return () => {
            // Cleanup listeners if API available
            try {
                telegram.offEvent && telegram.offEvent('themeChanged', onSettingsChanged);
                telegram.offEvent && telegram.offEvent('backButtonClicked', onBack);
            } catch (e) {
                // ignore
            }
        };
    }, [applyThemeToDocument]);

    const isDarkMode = themeParams?.color_scheme === 'dark' || (tg && tg.colorScheme === 'dark');

    // Helper: show and configure main button (Telegram's persistent action button)
    const showMainButton = useCallback((text = 'Continue', options = {}) => {
        if (!tg) return;
        try {
            tg.MainButton.setText(text);
            if (options.color) tg.MainButton.setParams({ color: options.color });
            if (options.textColor) tg.MainButton.setParams({ text_color: options.textColor });
            tg.MainButton.show();
        } catch (e) {
            // ignore
        }
    }, [tg]);

    const hideMainButton = useCallback(() => {
        if (!tg) return;
        try { tg.MainButton.hide(); } catch (e) { }
    }, [tg]);

    const setMainButtonParams = useCallback((params = {}) => {
        if (!tg) return;
        try { tg.MainButton.setParams(params); } catch (e) { }
    }, [tg]);

    return {
        tg,
        user,
        themeParams,
        ready,
        isDarkMode,
        showMainButton,
        hideMainButton,
        setMainButtonParams
    };
};