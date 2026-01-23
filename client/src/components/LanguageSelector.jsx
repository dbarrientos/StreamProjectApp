import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { updateUser } from '../services/api';

const LanguageSelector = () => {
    const { i18n } = useTranslation();
    const { user, updateProfile } = useAuth();

    // Sync from user profile
    useEffect(() => {
        if (!user) return;
        
        const VALID_LANGS = ['es', 'en'];
        // Check if user language is valid and supported
        const userLangValid = user.language && VALID_LANGS.includes(user.language);

        if (userLangValid) {
             const current = i18n.language;
             if (current !== user.language && !(current.startsWith(user.language))) {
                 i18n.changeLanguage(user.language);
             }
        } else {
             // User has invalid/missing language.
             // If we have a local language (e.g. from login page), sync it UP to the profile.
             const current = i18n.language && i18n.language.substring(0, 2); // 'es' or 'en'
             if (current && VALID_LANGS.includes(current)) {
                 updateProfile({ language: current });
                 updateUser(user.uid, { language: current }).catch(err => console.error("Auto-syncing language to profile failed", err));
             }
        }
    }, [user?.language, user?.uid, i18n]);

    const toggleLanguage = () => {
        const currentLang = i18n.language || 'es';
        const newLang = currentLang.startsWith('en') ? 'es' : 'en';
        i18n.changeLanguage(newLang);
        
        if (user) {
             updateProfile({ language: newLang });
             updateUser(user.uid, { language: newLang }).catch(err => console.error("Error saving language", err));
        }
    };

    return (
        <button 
            onClick={toggleLanguage}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-skin-base-secondary border-2 border-skin-border hover:border-skin-accent transition-all group relative overflow-hidden"
            title={i18n.language?.startsWith('en') ? "Cambiar a Español" : "Switch to English"}
        >
            <span className="font-bold text-xs text-skin-text-base group-hover:scale-110 transition-transform z-10">
                {i18n.language?.startsWith('en') ? 'ES' : 'EN'}
            </span>
             <div className="absolute inset-0 bg-skin-accent/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
        </button>
    );
};

export default LanguageSelector;
