import React from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { Clock, AlertCircle, TrendingUp } from 'lucide-react';

const AppraisalCard = ({ title, char, description, type = 'nature', loading, loadingMessage, error, onResume }) => {
    // MarkdownをHTMLに変換し、サニタイズする
    const htmlContent = DOMPurify.sanitize(marked.parse(description || ''));

    return (
        <div className="jp-card mb-8">
            <div className="flex flex-col items-center mb-6">
                <h2 className="text-2xl font-bold tracking-widest text-jp-dark">{title}</h2>
                <div className="h-0.5 w-16 bg-jp-gold mt-3 shadow-sm"></div>
            </div>

            <div className="prose-jp max-w-none text-gray-700 leading-relaxed font-light">
                <p className="mb-4 text-center text-gray-500 italic">
                    あなたの{title}を表す「{
                        type === 'nature' ? '日主' :
                            type === 'social' ? '月支' :
                                type === 'partner' ? '日支' :
                                    '時支'
                    }」は、{char}です。
                </p>

                {loading && !description && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 italic animate-pulse">
                        <Clock size={24} className="mb-3 animate-spin text-jp-gold" />
                        <p>{loadingMessage || '解析中...'}</p>
                    </div>
                )}

                {description && (
                    <div
                        className="markdown-content"
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />
                )}

                {loading && description && (
                    <div className="mt-4 flex items-center text-xs text-jp-gold italic animate-pulse">
                        <Clock size={12} className="mr-2 animate-spin" />
                        解析・記述を継続しています...
                    </div>
                )}

                {!loading && (error || !description) && (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <div className="flex items-center text-red-400 text-sm">
                            <AlertCircle size={16} className="mr-2" />
                            鑑定が一時停止しました
                        </div>
                        <button
                            onClick={onResume}
                            className="px-8 py-2 border border-jp-gold text-jp-gold rounded-full hover:bg-jp-gold hover:text-white transition-all duration-300 text-sm flex items-center"
                        >
                            <TrendingUp size={16} className="mr-2" />
                            鑑定の続きを依頼する
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppraisalCard;
