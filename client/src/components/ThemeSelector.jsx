import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Palette, ChevronDown, Check } from 'lucide-react';

const ThemeSelector = () => {
    const { theme, setTheme, themes } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (themeId) => {
        setTheme(themeId);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-skin-base-secondary border border-skin-border text-skin-text-base hover:bg-skin-accent hover:text-white transition-all shadow-md group"
            >
                <Palette size={18} className="group-hover:animate-spin" />
                <span className="text-sm font-bold font-display uppercase hidden md:inline">
                    {themes.find(t => t.id === theme)?.name}
                </span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 rounded-xl bg-skin-base-secondary border border-skin-border shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-1">
                        {themes.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => handleSelect(t.id)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-bold font-display transition-colors mb-1 last:mb-0
                                    ${theme === t.id 
                                        ? 'bg-skin-accent text-white' 
                                        : 'text-skin-text-muted hover:bg-gradient-to-r hover:from-skin-accent hover:to-skin-secondary hover:text-white'
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    <span>{t.icon}</span>
                                    {t.name}
                                </span>
                                {theme === t.id && <Check size={14} />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Backdrop to close */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default ThemeSelector;
