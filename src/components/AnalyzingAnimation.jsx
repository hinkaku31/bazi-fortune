import React, { useState, useEffect } from 'react';

const AnalyzingAnimation = () => {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center py-24 space-y-8 animate-in fade-in duration-700">
            <div className="relative">
                <div className="w-24 h-24 border-4 border-gray-100 rounded-full"></div>
                <div className="absolute inset-0 w-24 h-24 border-4 border-gray-800 rounded-full animate-ping opacity-20"></div>
                <div className="absolute inset-0 w-24 h-24 border-t-4 border-gray-800 rounded-full animate-spin"></div>
            </div>

            <div className="text-center space-y-2">
                <h3 className="text-xl font-bold tracking-[0.3em] text-gray-800">
                    AI解析中{dots}
                </h3>
                <p className="text-sm text-gray-400 font-light tracking-[0.2em]">
                    天の星々と地の縁を読み解いています
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 opacity-10 pointer-events-none text-[10px] font-mono">
                <div className="animate-pulse">DECODING PILLARS...</div>
                <div className="animate-pulse delay-75">ANALYZING ELEMENTS...</div>
                <div className="animate-pulse delay-150">HIDDEN STEMS MAPPING...</div>
                <div className="animate-pulse delay-200">SPECIAL STARS CALC...</div>
            </div>
        </div>
    );
};

export default AnalyzingAnimation;
