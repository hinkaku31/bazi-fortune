import React, { useState, useEffect } from 'react';
import { calculateBazi, calculateElements } from './engine/baziEngine';
import { Sparkles, AlertCircle, Calendar, Clock, Layout, Heart, Briefcase, TrendingUp } from 'lucide-react';

import ResultTable from './components/ResultTable';
import AnalysisTable from './components/AnalysisTable';
import AppraisalCard from './components/AppraisalCard';
import AnalyzingAnimation from './components/AnalyzingAnimation';
import CustomSelect from './components/CustomSelect';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

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
    const [fortuneData, setFortuneData] = useState({
        nature: '', social: '', partner: '',
        fortunes: { today: '', tomorrow: '', thisWeek: '', thisMonth: '', thisYear: '', luckyPoints: null }
    });
    const [loadingItems, setLoadingItems] = useState({});
    const [errorInfo, setErrorInfo] = useState(null);
    const [activeFortuneTab, setActiveFortuneTab] = useState('today');

    const cleanText = (text) => (text || '').replace(/\*\*/g, '');

    const fetchFortuneItem = async (topic, currentBazi, currentElements) => {
        if (loadingItems[topic]) return;
        setLoadingItems(prev => ({ ...prev, [topic]: true }));
        try {
            const response = await fetch('/api/getFortune', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bazi: currentBazi || result?.bazi,
                    elements: currentElements || result?.elements,
                    topic
                })
            });
            const data = await response.json();
            if (response.ok) {
                if (topic === 'initial_profile') {
                    setFortuneData(prev => ({
                        ...prev,
                        nature: data.nature, social: data.social, partner: data.partner
                    }));
                } else {
                    setFortuneData(prev => ({
                        ...prev,
                        fortunes: {
                            ...prev.fortunes,
                            [topic]: data.content,
                            luckyPoints: topic === 'today' ? data.luckyPoints : prev.fortunes.luckyPoints
                        }
                    }));
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingItems(prev => ({ ...prev, [topic]: false }));
        }
    };

    const handleCalculate = async (e) => {
        if (e) e.preventDefault();
        if (!birthData.year || !birthData.month || !birthData.day) {
            alert('生年月日を選択してください。');
            return;
        }

        setLoading(true);
        setErrorInfo(null);
        setFortuneData({
            nature: '', social: '', partner: '',
            fortunes: { today: '', tomorrow: '', thisWeek: '', thisMonth: '', thisYear: '', luckyPoints: null }
        });

        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            const dateStr = `${birthData.year}-${birthData.month.padStart(2, '0')}-${birthData.day.padStart(2, '0')}`;
            const timeStr = birthData.hour === '不明' ? '12:00' : birthData.hour;
            const bazi = calculateBazi(`${dateStr}T${timeStr}:00`);
            const elements = calculateElements(bazi);

            setResult({ bazi, elements });
            setActiveFortuneTab('today');

            // 最初に本質と今日を取得
            await Promise.all([
                fetchFortuneItem('initial_profile', bazi, elements),
                fetchFortuneItem('today', bazi, elements)
            ]);
        } catch (err) {
            console.error(err);
            setErrorInfo({ title: '接続エラー', message: '再試行してください。' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (result && activeFortuneTab !== 'luckyPoints' && !fortuneData.fortunes[activeFortuneTab]) {
            fetchFortuneItem(activeFortuneTab);
        }
    }, [activeFortuneTab, result]);

    const yearOptions = Array.from({ length: 101 }, (_, i) => ({ value: `${1950 + i}`, label: `${1950 + i}年` }));
    const monthOptions = Array.from({ length: 12 }, (_, i) => ({ value: `${i + 1}`, label: `${i + 1}月` }));
    const dayOptions = Array.from({ length: 31 }, (_, i) => ({ value: `${i + 1}`, label: `${i + 1}日` }));
    const hourOptions = [
        { value: '不明', label: '不明' },
        ...Array.from({ length: 24 }, (_, i) => ({ value: `${i}:00`, label: `${i}時` }))
    ];

    const getFortuneLabel = (key) => {
        const labels = { today: '今日', tomorrow: '明日', thisWeek: '今週', thisMonth: '今月', thisYear: '今年' };
        return labels[key] || '';
    };

    const [showCopyToast, setShowCopyToast] = useState(false);

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(window.location.href);
        setShowCopyToast(true);
        setTimeout(() => setShowCopyToast(false), 2000);
    };

    const tabKeys = ['today', 'tomorrow', 'thisWeek', 'thisMonth', 'thisYear'];

    return (
        <div className="min-h-screen bg-white text-[#2d3436] font-serif selection:bg-gray-100 pb-20">
            {showCopyToast && (
                <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in zoom-in duration-300">
                    <div className="bg-jp-dark text-white px-8 py-3 rounded-full shadow-2xl text-sm font-bold tracking-widest border border-white/10 backdrop-blur-md">
                        URLをクリップボードにコピーしました
                    </div>
                </div>
            )}

            <header className="pt-24 pb-16 text-center border-b border-gray-50 mb-12">
                <div className="max-w-4xl mx-auto px-6">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-[0.5em] text-gray-800 mb-6 font-serif">四柱推命</h1>
                    <div className="w-16 h-px bg-gray-200 mx-auto"></div>
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
                            <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 text-sm leading-relaxed text-gray-500">
                                <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <Layout size={16} className="text-jp-gold" />
                                    【命式計算の使い方】
                                </h4>
                                <p>
                                    生年月日と生まれた時間、性別を選択して計算ボタンを押すことで命式表が表示されます。
                                    命式表（五行・蔵干・通変星・十二運・特殊星・身旺・身弱・格局等を含む）に加えて大運（10年ごとの運勢）、歳運（1年ごとの運勢）や各項目の五行、パワー、喜神・忌神（ある場合）も表示されます。
                                    それぞれの五行や吉凶が色分けされていたり、生まれてから10年先までの歳運が自動計算されますので、色々とご活用ください。
                                </p>
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
                                <AppraisalCard title="あなたの本質" char={result.bazi.nicchuu[0]} type="nature"
                                    description={loadingItems['initial_profile'] ? "魂を読み解いています..." : cleanText(fortuneData.nature) || "解析中..."} />
                                <AppraisalCard title="社会的な性質" char={result.bazi.gecchuu[1]} type="social"
                                    description={loadingItems['initial_profile'] ? "使命を読み解いています..." : cleanText(fortuneData.social) || "解析中..."} />
                                <AppraisalCard title="人生のパートナー" char={result.bazi.nicchuu[1]} type="partner"
                                    description={loadingItems['initial_profile'] ? "縁を読み解いています..." : cleanText(fortuneData.partner) || "解析中..."} />
                            </div>
                            <div className="lg:col-span-1"><AnalysisTable result={result.bazi} rawElements={result.elements} /></div>
                        </div>
                        <div className="jp-card">
                            <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-4">
                                <TrendingUp className="text-jp-gold" size={24} />
                                <h2 className="text-xl font-bold tracking-widest">これからの運勢</h2>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-8">
                                {tabKeys.map((key) => (
                                    <button key={key} onClick={() => setActiveFortuneTab(key)}
                                        className={`px-4 py-2 rounded-lg text-sm transition-all ${activeFortuneTab === key ? 'bg-jp-gold text-white font-bold' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>
                                        {getFortuneLabel(key)}
                                    </button>
                                ))}
                            </div>
                            <div className="prose-jp text-gray-600 min-h-[200px] animate-in fade-in duration-500">
                                {loadingItems[activeFortuneTab] ? (
                                    <div className="flex items-center justify-center h-40 text-gray-300 italic animate-pulse">
                                        <Clock size={20} className="mr-2 animate-spin" />
                                        極限鑑定書を執筆しています...
                                    </div>
                                ) : fortuneData.fortunes[activeFortuneTab] ? (
                                    <>
                                        <div
                                            className="leading-relaxed whitespace-pre-wrap markdown-content"
                                            dangerouslySetInnerHTML={{
                                                __html: DOMPurify.sanitize(marked(cleanText(fortuneData.fortunes[activeFortuneTab])))
                                            }}
                                        />

                                        {activeFortuneTab === 'today' && fortuneData.fortunes.luckyPoints && (
                                            <div className="mt-12 grid grid-cols-2 md:grid-cols-5 gap-3">
                                                {[
                                                    { label: 'Color', val: fortuneData.fortunes.luckyPoints.color },
                                                    { label: 'Spot', val: fortuneData.fortunes.luckyPoints.spot },
                                                    { label: 'Food', val: fortuneData.fortunes.luckyPoints.food },
                                                    { label: 'Item', val: fortuneData.fortunes.luckyPoints.item },
                                                    { label: 'Action', val: fortuneData.fortunes.luckyPoints.action }
                                                ].map((p) => (
                                                    <div key={p.label} className="py-4 px-2 border-b border-gray-100/80 text-center">
                                                        <span className="text-[9px] text-gray-400 uppercase tracking-[0.2em] block mb-2">{p.label}</span>
                                                        <span className="text-xs font-medium text-jp-dark tracking-wider leading-relaxed">{p.val}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-gray-300 italic">鑑定を選択してください。</p>
                                )}
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
                <div className="max-w-4xl mx-auto px-6 mb-12">
                    <p className="text-[9px] text-gray-300 tracking-[0.3em] uppercase mb-10">Share this session</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        {[
                            { name: 'X', color: 'bg-black', label: 'X', url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent('本格四柱推命：AIが解き明かす運命の深淵')}` },
                            { name: 'Facebook', color: 'bg-[#1877F2]', label: 'F', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}` },
                            { name: 'LINE', color: 'bg-[#06C755]', label: 'L', url: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(window.location.href)}` },
                            { name: 'Instagram', color: 'bg-gradient-to-tr from-[#F58529] via-[#D6249F] to-[#285AEB]', label: 'I', url: 'https://www.instagram.com/' },
                            { name: 'Threads', color: 'bg-black', label: 'T', url: `https://www.threads.net/intent/post?text=${encodeURIComponent('本格四柱推命で自分の本質を鑑定しました：' + window.location.href)}` },
                            { name: 'Pinterest', color: 'bg-[#E60023]', label: 'P', url: `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}` },
                        ].map((sns) => (
                            <a key={sns.name} href={sns.url} target="_blank" rel="noopener noreferrer" title={sns.name}
                                className={`w-10 h-10 rounded-full ${sns.color} text-white text-xs font-bold flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-sm`}>
                                {sns.label}
                            </a>
                        ))}
                        <button onClick={handleCopyUrl} title="Copy URL"
                            className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 text-[10px] font-bold border border-gray-100 flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-all">
                            <Layout size={14} />
                        </button>
                    </div>
                </div>
                <p className="text-[10px] tracking-[0.5em] text-gray-300 uppercase mb-4">&copy; 2026 BAJI FORTUNE / AI ANALYSIS</p>
            </footer>
        </div>
    );
};
export default App;
