import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

import { useAuth } from './AuthContext';
import { updateUser } from '../services/api';

export const ThemeProvider = ({ children }) => {
    // Theme types: 'cyberpunk', 'kawaii', 'mario'
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('app-theme') || 'cyberpunk';
    });
    
    const { user, updateProfile } = useAuth();
    
    // Whitelist themes
    const VALID_THEMES = ['cyberpunk', 'kawaii', 'mario'];

    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute('data-theme', theme);
        localStorage.setItem('app-theme', theme);
    }, [theme]);
    
    // Sync from user profile on login
    useEffect(() => {
        if (!user) return;
        
        const userThemeValid = user.theme && VALID_THEMES.includes(user.theme);
        
        if (userThemeValid) {
            // User has a valid preference, use it
            if (user.theme !== theme) {
                setTheme(user.theme);
            }
        } else {
            // User has NO valid preference (null or invalid default from DB)
            // But we have a local theme (from Login page or previous session).
            // We should SAVE this local preference to the user profile.
            // (Assuming 'theme' state is valid, which it defaults to 'cyberpunk' if localStorage missing)
            if (theme && VALID_THEMES.includes(theme)) {
                 updateProfile({ theme: theme });
                 updateUser(user.uid, { theme: theme }).catch(err => console.error("Auto-syncing theme to profile failed", err));
            }
        }
    }, [user?.theme, user?.uid]); // Depend on user.theme change or user login

    const changeTheme = (newTheme) => {
        setTheme(newTheme);
        if (user) {
             updateProfile({ theme: newTheme });
             updateUser(user.uid, { theme: newTheme }).catch(err => console.error("Failed to save theme", err));
        }
    };

    const value = {
        theme,
        setTheme: changeTheme, // Expose wrapper
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
