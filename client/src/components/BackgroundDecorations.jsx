import React from 'react';
import { Trophy, Heart, Star, Cloud, Sparkles, Coins } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const BackgroundDecorations = () => {
    const { theme } = useTheme();

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Ambient Blobs - Using Semantic Colors */}
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-skin-accent/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-skin-secondary/10 rounded-full blur-[100px]"></div>
            <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-skin-success/5 rounded-full blur-[80px]"></div>
            
            {/* Theme Specific Decorations */}
            {theme === 'cyberpunk' && (
                <>
                    <Trophy strokeWidth={0.5} className="absolute top-10 -left-10 text-skin-accent/5 w-96 h-96 -rotate-[15deg] transition-all duration-1000 blur-sm" />
                    <Trophy strokeWidth={0.5} className="absolute bottom-0 -right-20 text-skin-secondary/5 w-[500px] h-[500px] rotate-[15deg] transition-all duration-1000 blur-sm" />
                </>
            )}

            {theme === 'kawaii' && (
                <>
                    <Heart strokeWidth={1} className="absolute top-20 -left-20 text-skin-accent/10 w-96 h-96 -rotate-[15deg] animate-bounce-slow blur-sm" />
                    <Cloud strokeWidth={1} className="absolute bottom-40 -right-10 text-skin-secondary/10 w-[400px] h-[400px] blur-sm" />
                    <Sparkles className="absolute top-1/2 left-1/2 text-skin-success/20 w-32 h-32 animate-pulse blur-md" />
                </>
            )}

            {theme === 'mario' && (
                <>
                    <Star strokeWidth={1} className="absolute top-10 right-20 text-skin-success/10 w-64 h-64 animate-spin-slow blur-sm" />
                    <Coins strokeWidth={1} className="absolute bottom-20 left-10 text-skin-success/10 w-48 h-48 animate-bounce blur-sm" />
                    <Cloud strokeWidth={1.5} className="absolute top-40 left-40 text-white/10 w-72 h-72 blur-sm" />
                </>
            )}
        </div>
    );
};

export default BackgroundDecorations;
