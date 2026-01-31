import React from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const AppraisalCard = ({ title, char, description, type = 'nature' }) => {
    // MarkdownをHTMLに変換し、サニタイズする
    const htmlContent = DOMPurify.sanitize(marked(description || ''));

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
                <div
                    className="markdown-content"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
            </div>
        </div>
    );
};

export default AppraisalCard;
