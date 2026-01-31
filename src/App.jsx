import React, { useState, useEffect } from 'react';
import { calculateBazi, calculateElements } from './engine/baziEngine';
import { Calendar, Clock, Sparkles, AlertCircle, Share2, Users } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// New Components
import ResultTable from './components/ResultTable';
import AnalysisTable from './components/AnalysisTable';
import AppraisalCard from './components/AppraisalCard';
import AnalyzingAnimation from './components/AnalyzingAnimation';

const App = () => {
    const [birthData, setBirthData] = useState({ date: '', time: '' });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fortuneText, setFortuneText] = useState('');
    const [errorInfo, setErrorInfo] = useState(null);

    const handleCalculate = async (e) => {
        if (e) e.preventDefault();
        if (!birthData.date) return;

        setLoading(true);
        setErrorInfo(null);

        // 人工的な遅延（演出）
        await new Promise(resolve => setTimeout(resolve, 2500));

        try {
            const bazi = calculateBazi(`${birthData.date}T${birthData.time || '12:00'}:00`);
            const elements = calculateElements(bazi);

            setResult({ bazi, elements });

            // API 呼び出し (詳細鑑定用)
            const response = await fetch('/api/getFortune', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bazi, elements, period: '本質' })
            });

            const data = await response.json();
            if (response.ok) {
                setFortuneText(data.fortune || '');
            } else {
                setFortuneText('');
                setErrorInfo({ title: 'AI鑑定失敗', message: data.message });
            }
        } catch (err) {
            console.error(err);
            setErrorInfo({ title: '接続エラー', message: '再試行してください。' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-[#2d3436] font-serif selection:bg-gray-100 pb-20">
            {/* Header */}
            <header className="pt-24 pb-16 text-center border-b border-gray-50 mb-12">
                <div className="max-w-4xl mx-auto px-6">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-[0.5em] text-gray-800 mb-6 font-serif">
                        四柱推命
                    </h1>
                    <div className="w-16 h-px bg-gray-200 mx-auto mb-6"></div>
                    <p className="text-gray-400 text-sm md:text-base tracking-[0.2em] font-light leading-relaxed">
                        AIが解き明かす四柱推命の深淵<br />
                        自己の本質と一生の運勢を完全解析
                    </p>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6">
                {/* Search Form Card */}
                {!result && !loading && (
                    <div className="jp-card mb-20 max-w-2xl mx-auto">
                        <form onSubmit={handleCalculate} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-400 tracking-widest uppercase">生年月日</label>
                                    <input
                                        type="date"
                                        className="w-full bg-transparent border-b-2 border-gray-100 p-3 focus:border-gray-800 outline-none transition-all text-lg font-serif"
                                        value={birthData.date}
                                        onChange={(e) => setBirthData({ ...birthData, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-400 tracking-widest uppercase">出生時刻（任意）</label>
                                    <input
                                        type="time"
                                        className="w-full bg-transparent border-b-2 border-gray-100 p-3 focus:border-gray-800 outline-none transition-all text-lg font-serif"
                                        value={birthData.time}
                                        onChange={(e) => setBirthData({ ...birthData, time: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="jp-button-primary w-full py-4 text-lg mt-4 group"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    天命を解析する
                                    <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                                </span>
                            </button>
                        </form>
                    </div>
                )}

                {loading && <AnalyzingAnimation />}

                {result && !loading && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-1000">
                        {/* 命式表セクション */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold tracking-widest">命式表</h2>
                                <button
                                    onClick={() => setResult(null)}
                                    className="text-xs text-gray-400 hover:text-gray-800 underline underline-offset-4"
                                >
                                    情報を変更する
                                </button>
                            </div>
                            <div className="jp-card overflow-hidden !p-0">
                                <ResultTable result={result.bazi} />
                            </div>
                        </div>

                        {/* 解析・補足セクション */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                            <div className="lg:col-span-2">
                                <AppraisalCard
                                    title="あなたの本質"
                                    char={result.bazi.nicchuu[0]}
                                    type="nature"
                                    description={fortuneText || "あなたの本質について、AIが解析を行っています。"}
                                />
                                <AppraisalCard
                                    title="社会的な性質"
                                    char={result.bazi.gecchuu[1]}
                                    type="social"
                                    description="あなたの社会的役割や対人関係における特性を読み解きます。"
                                />
                                <AppraisalCard
                                    title="人生のパートナー"
                                    char={result.bazi.nicchuu[1]}
                                    type="partner"
                                    description="あなたの宿命に刻まれたパートナー像と、良好な関係へのアドバイスです。"
                                />
                            </div>
                            <div className="lg:col-span-1">
                                <AnalysisTable result={result.bazi} rawElements={result.elements} />
                            </div>
                        </div>

                        {/* Error Handling */}
                        {errorInfo && (
                            <div className="p-6 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-start gap-4">
                                <AlertCircle size={20} className="mt-1 flex-shrink-0" />
                                <div>
                                    <h4 className="font-bold mb-1">{errorInfo.title}</h4>
                                    <p className="text-sm opacity-80">{errorInfo.message}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <footer className="mt-32 pt-16 pb-12 text-center border-t border-gray-50">
                <p className="text-[10px] tracking-[0.5em] text-gray-300 uppercase mb-4">
                    &copy; 2026 BAJI FORTUNE / AI ANALYSIS
                </p>
                <div className="flex justify-center gap-8 text-gray-200">
                    <div className="w-1 h-1 rounded-full bg-current"></div>
                    <div className="w-1 h-1 rounded-full bg-current"></div>
                    <div className="w-1 h-1 rounded-full bg-current"></div>
                </div>
            </footer>
        </div>
    );
};

export default App;

