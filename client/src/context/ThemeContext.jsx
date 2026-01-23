import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Theme types: 'cyberpunk', 'kawaii', 'mario'
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('app-theme') || 'cyberpunk';
    });

    useEffect(() => {
        const root = document.documentElement;
        // Remove old theme classes/attributes if any (using data attribute approach)
        root.setAttribute('data-theme', theme);
        localStorage.setItem('app-theme', theme);
    }, [theme]);

    const value = {
        theme,
        setTheme,
        themes: [
            { id: 'cyberpunk', name: 'Cyberpunk', icon: '⚡' },
            { id: 'kawaii', name: 'Kawaii', icon: '🎀' },
            { id: 'mario', name: 'Retro', icon: '🍄' }
        ]
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
