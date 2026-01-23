import React from 'react';
import { Trophy } from 'lucide-react';

const BackgroundDecorations = () => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Ambient Blobs */}
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-[#00f3ff]/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-[#ff00ff]/10 rounded-full blur-[100px]"></div>
            <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-[#ccff00]/5 rounded-full blur-[80px]"></div>
            
            {/* Sublimated Trophies */}
            <Trophy strokeWidth={0.5} className="absolute top-10 -left-10 text-[#00f3ff]/5 w-96 h-96 -rotate-[15deg]" />
            <Trophy strokeWidth={0.5} className="absolute bottom-0 -right-20 text-[#ff00ff]/5 w-[500px] h-[500px] rotate-[15deg]" />
        </div>
    );
};

export default BackgroundDecorations;
