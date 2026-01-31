import React, { useState, useEffect } from 'react';
import { calculateBazi, calculateElements } from './engine/baziEngine';
import { Sparkles, AlertCircle, Calendar, Clock, Layout, Heart, Briefcase, TrendingUp } from 'lucide-react';

import ResultTable from './components/ResultTable';
import AnalysisTable from './components/AnalysisTable';
import AppraisalCard from './components/AppraisalCard';
import AnalyzingAnimation from './components/AnalyzingAnimation';
import CustomSelect from './components/CustomSelect';

const App = () => {
    const [birthData, setBirthData] = useState({
        year: '',
        month: '',
        day: '',
        hour: '不明',
        gender: '女性'
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fortuneData, setFortuneData] = useState(null);
    const [errorInfo, setErrorInfo] = useState(null);
    const [activeFortuneTab, setActiveFortuneTab] = useState('today');

    const yearOptions = Array.from({ length: 101 }, (_, i) => ({ value: `${1950 + i}`, label: `${1950 + i}年` }));
    const monthOptions = Array.from({ length: 12 }, (_, i) => ({ value: `${i + 1}`, label: `${i + 1}月` }));
    const dayOptions = Array.from({ length: 31 }, (_, i) => ({ value: `${i + 1}`, label: `${i + 1}日` }));
    const hourOptions = [
        { value: '不明', label: '不明' },
        ...Array.from({ length: 24 }, (_, i) => ({ value: `${i}:00`, label: `${i}時` }))
    ];

    const handleCalculate = async (e) => {
        if (e) e.preventDefault();
        if (!birthData.year || !birthData.month || !birthData.day) {
            alert('生年月日を選択してください。');
            return;
        }

        setLoading(true);
        setErrorInfo(null);
        await new Promise(resolve => setTimeout(resolve, 3000));

        try {
            const dateStr = `${birthData.year}-${birthData.month.padStart(2, '0')}-${birthData.day.padStart(2, '0')}`;
            const timeStr = birthData.hour === '不明' ? '12:00' : birthData.hour;
            const bazi = calculateBazi(`${dateStr}T${timeStr}:00`);
            const elements = calculateElements(bazi);

            setResult({ bazi, elements });

            const response = await fetch('/api/getFortune', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bazi, elements, period: '総合鑑定' })
            });

            const data = await response.json();
            if (response.ok) {
                setFortuneData(data);
            } else {
                setFortuneData(null);
                setErrorInfo({ title: 'AI鑑定失敗', message: data.message });
            }
        } catch (err) {
            console.error(err);
            setErrorInfo({ title: '接続エラー', message: '再試行してください。' });
        } finally {
            setLoading(false);
        }
    };

    const getFortuneLabel = (key) => {
        const labels = { today: '今日', tomorrow: '明日', thisWeek: '今週', thisMonth: '今月', thisYear: '今年' };
        return labels[key] || '';
    };

    return (
        <div className="min-h-screen bg-white text-[#2d3436] font-serif selection:bg-gray-100 pb-20">
            <header className="pt-24 pb-16 text-center border-b border-gray-50 mb-12">
                <div className="max-w-4xl mx-auto px-6">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-[0.5em] text-gray-800 mb-6 font-serif">四柱推命</h1>
                    <div className="w-16 h-px bg-gray-200 mx-auto mb-6"></div>
                    <p className="text-gray-400 text-sm md:text-base tracking-[0.2em] font-light leading-relaxed">
                        AIが解き明かす四柱推命の深淵<br />自己の本質と一生の運勢を完全解析
                    </p>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6">
                {!result && !loading && (
                    <div className="jp-card mb-20 max-w-2xl mx-auto">
                        <form onSubmit={handleCalculate} className="space-y-10">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <CustomSelect label="年" options={yearOptions} value={birthData.year} onChange={(v) => setBirthData({ ...birthData, year: v })} />
                                <CustomSelect label="月" options={monthOptions} value={birthData.month} onChange={(v) => setBirthData({ ...birthData, month: v })} />
                                <CustomSelect label="日" options={dayOptions} value={birthData.day} onChange={(v) => setBirthData({ ...birthData, day: v })} />
                                <CustomSelect label="時間" options={hourOptions} value={birthData.hour} onChange={(v) => setBirthData({ ...birthData, hour: v })} />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase block text-center">性別</label>
                                <div className="flex justify-center gap-4">
                                    {['男性', '女性'].map((g) => (
                                        <button key={g} type="button" onClick={() => setBirthData({ ...birthData, gender: g })}
                                            className={`px-8 py-3 rounded-full border transition-all ${birthData.gender === g ? 'bg-jp-dark text-white border-jp-dark' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}>
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" className="jp-button-primary w-full py-5 text-xl mt-4 group">
                                <span className="flex items-center justify-center gap-2">
                                    解析を開始する<Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                                </span>
                            </button>
                        </form>
                    </div>
                )}

                {loading && <AnalyzingAnimation />}

                {result && !loading && (
                    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-5 duration-1000">
                        <div className="flex justify-center">
                            <button onClick={() => setResult(null)} className="text-sm text-gray-400 hover:text-gray-800 border border-gray-100 px-6 py-2 rounded-full transition-all hover:bg-gray-50">
                                条件を変更して再鑑定
                            </button>
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold tracking-widest text-center">鑑定書（命式）</h2>
                            <div className="jp-card overflow-hidden !p-0"><ResultTable result={result.bazi} /></div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                            <div className="lg:col-span-2 space-y-8">
                                <AppraisalCard title="あなたの本質" char={result.bazi.nicchuu[0]} type="nature" description={fortuneData?.nature || "解析中..."} />
                                <AppraisalCard title="社会的な性質" char={result.bazi.gecchuu[1]} type="social" description={fortuneData?.social || "解析中..."} />
                                <AppraisalCard title="人生のパートナー" char={result.bazi.nicchuu[1]} type="partner" description={fortuneData?.partner || "解析中..."} />
                            </div>
                            <div className="lg:col-span-1"><AnalysisTable result={result.bazi} rawElements={result.elements} /></div>
                        </div>
                        <div className="jp-card">
                            <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-4">
                                <TrendingUp className="text-jp-gold" size={24} />
                                <h2 className="text-xl font-bold tracking-widest">これからの運勢</h2>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-8">
                                {fortuneData && fortuneData.fortunes && Object.keys(fortuneData.fortunes).map((key) => (
                                    <button key={key} onClick={() => setActiveFortuneTab(key)}
                                        className={`px-4 py-2 rounded-lg text-sm transition-all ${activeFortuneTab === key ? 'bg-jp-gold text-white font-bold' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>
                                        {getFortuneLabel(key)}
                                    </button>
                                ))}
                            </div>
                            <div className="prose-jp text-gray-600 min-h-[200px] animate-in fade-in duration-500">
                                {fortuneData ? <p className="leading-relaxed">{fortuneData.fortunes[activeFortuneTab]}</p> : <p className="text-gray-300 italic">運勢データを生成しています...</p>}
                            </div>
                        </div>
                        {errorInfo && (
                            <div className="p-6 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-start gap-4">
                                <AlertCircle size={20} className="mt-1 flex-shrink-0" /><div className="text-sm"><strong>{errorInfo.title}</strong><br />{errorInfo.message}</div>
                            </div>
                        )}
                    </div>
                )}
                <div className="mt-24 border border-gray-100 rounded-xl p-8 text-center bg-gray-50/50">
                    <span className="text-[10px] text-gray-300 tracking-[0.3em] uppercase block mb-4">Sponsor Link</span>
                    <div className="h-24 flex items-center justify-center border border-dashed border-gray-200 text-gray-300 text-sm font-light">ここにスポンサーリンクが表示されます</div>
                </div>
            </main>
            <footer className="mt-20 pt-16 pb-12 text-center border-t border-gray-50">
                <p className="text-[10px] tracking-[0.5em] text-gray-300 uppercase mb-4">&copy; 2026 BAJI FORTUNE / AI ANALYSIS</p>
            </footer>
        </div>
    );
};
export default App;
