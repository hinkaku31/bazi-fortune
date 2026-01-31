import React from 'react';

const AppraisalCard = ({ title, char, description, type = 'nature' }) => {
    // 本来は画像URLを動的に生成・取得するが、ここではプレースホルダ的に十干・十二支を表示
    // 実際の実装では assets/characters/[char].png のようなパスを想定
    return (
        <div className="jp-card mb-8">
            <div className="flex flex-col items-center mb-6">
                <div className="relative w-32 h-32 mb-4 flex items-center justify-center bg-gray-50 rounded-full border-2 border-gray-100 shadow-inner overflow-hidden">
                    <span className="text-6xl font-bold text-gray-200 absolute">{char}</span>
                    <div className="z-10 text-4xl">🐱</div> {/* キャラクタープレースホルダ */}
                </div>
                <h2 className="text-2xl font-bold tracking-widest">{title}</h2>
                <div className="h-1 w-12 bg-gray-800 mt-2"></div>
            </div>

            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed font-light">
                <p className="mb-4 text-center text-gray-500 italic">
                    あなたの{title}を表す「{type === 'nature' ? '日主' : type === 'social' ? '月支' : '日支'}」は、{char}です。
                </p>
                <div className="whitespace-pre-wrap">
                    {description}
                </div>
            </div>
        </div>
    );
};

export default AppraisalCard;
