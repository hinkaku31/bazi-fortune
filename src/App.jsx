import React, { useState, useEffect } from 'react';
import { calculateBazi, calculateElements } from './engine/baziEngine';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Moon, Sun, Calendar, Clock, Share2, Users, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { generateShareUrl, decodeBaziData } from './utils/share';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const App = () => {
    const [birthData, setBirthData] = useState({ date: '', time: '' });
    const [partnerData, setPartnerData] = useState(null);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState('today');
    const [fortuneText, setFortuneText] = useState('');
    const [errorInfo, setErrorInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [shareUrl, setShareUrl] = useState('');

    // 招待URL（相性診断）からのデータ読み込み
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const myData = params.get('my');
        if (myData) {
            const decoded = decodeBaziData(myData);
            if (decoded) setPartnerData(decoded);
        }
    }, []);

    const handleCalculate = async (e) => {
        if (e) e.preventDefault();
        if (!birthData.date) return;

        setLoading(true);
        setErrorInfo(null);
        const bazi = calculateBazi(`${birthData.date}T${birthData.time || '12:00'}:00`);
        const elements = calculateElements(bazi);
        const elementData = Object.keys(elements).map(key => ({
            subject: key,
            value: elements[key],
            fullMark: 4,
        }));

        const newResult = { bazi, elements: elementData, rawElements: elements };
        setResult(newResult);
        setShareUrl(generateShareUrl(newResult));

        // Gemini API 呼び出し
        try {
            const periodMap = { today: '今日', week: '今週', month: '今月', year: '今年' };
            const response = await fetch('/api/getFortune', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bazi,
                    elements,
                    period: periodMap[activeTab]
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Fortune API Error:', data);
                setErrorInfo({
                    title: data.error || '鑑定失敗',
                    status: data.status,
                    message: data.message,
                    details: data.details
                });
                setFortuneText('');
            } else {
                setFortuneText(data.fortune || '鑑定結果の解析に失敗しました。');
            }
        } catch (err) {
            console.error('Fetch Error:', err);
            setErrorInfo({
                title: '接続エラー',
                message: 'サーバーと通信できませんでした。',
                details: err.message
            });
            setFortuneText('');
        } finally {
            setLoading(false);
        }
    };

    // タブ切り替え時に再鑑定
    useEffect(() => {
        if (result) {
            handleCalculate();
        }
    }, [activeTab]);

    return (
        <div className="min-h-screen bg-[#0a1622] text-[#f9f3e9] font-serif">
            {/* Decorations */}
            <div className="fixed inset-0 pointer-events-none opacity-5 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] border-[20px] border-[#c5a059] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] border-[30px] border-[#b22d35] rounded-full"></div>
            </div>

            {/* Header */}
            <header className="py-20 text-center relative overflow-hidden bg-gradient-to-b from-black/50 to-transparent border-b border-[#c5a059]/30">
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <div className="w-[800px] h-[800px] border border-[#c5a059] rounded-full rotate-45 animate-[spin_60s_linear_infinite]"></div>
                </div>
                <div className="relative z-10 space-y-4">
                    <h1 className="text-5xl md:text-7xl font-bold text-[#c5a059] tracking-[0.4em] drop-shadow-[0_4px_12px_rgba(197,160,89,0.3)]">
                        天命開華
                    </h1>
                    <div className="h-[2px] w-24 bg-[#b22d35] mx-auto"></div>
                    <p className="text-[#f9f3e9]/70 text-lg tracking-[0.5em] font-light">
                        究極の四柱推命・AI鑑定
                    </p>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-16 relative z-10">
                {partnerData && (
                    <div className="bg-[#b22d35]/10 border border-[#b22d35]/40 p-6 mb-12 text-center backdrop-blur-md">
                        <Sparkles className="inline-block text-[#b22d35] mr-2 animate-pulse" />
                        <span className="font-bold text-[#b22d35] tracking-widest">【相性診断モード】</span>
                        <p className="mt-2 text-sm opacity-80">二人の宿命が交わる刻。あなたの情報を入力してください。</p>
                    </div>
                )}

                {/* Input Form */}
                <section className="jp-card p-10 mb-16 border-t-4 border-t-[#c5a059]">
                    <h2 className="jp-heading">
                        <Calendar className="text-[#c5a059]" /> 宿命の刻を刻む
                    </h2>
                    <form onSubmit={handleCalculate} className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end">
                        <div className="space-y-4">
                            <label className="block text-xs font-bold text-[#c5a059] uppercase tracking-[0.2em] opacity-80">生年月日</label>
                            <input
                                type="date"
                                className="w-full bg-white/5 border border-[#c5a059]/30 p-4 rounded-none focus:border-[#c5a059] outline-none transition-all text-[#f9f3e9] text-lg"
                                value={birthData.date}
                                onChange={(e) => setBirthData({ ...birthData, date: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="block text-xs font-bold text-[#c5a059] uppercase tracking-[0.2em] opacity-80">出生時刻（任意）</label>
                            <input
                                type="time"
                                className="w-full bg-white/5 border border-[#c5a059]/30 p-4 rounded-none focus:border-[#c5a059] outline-none transition-all text-[#f9f3e9] text-lg"
                                value={birthData.time}
                                onChange={(e) => setBirthData({ ...birthData, time: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2 pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="jp-button-primary w-full md:w-auto px-16 text-xl mx-auto block"
                            >
                                {loading ? <Loader2 className="animate-spin mx-auto" /> : (partnerData ? '相性を紐解く' : '鑑定を開始する')}
                            </button>
                        </div>
                    </form>
                </section>

                {result && (
                    <div className="space-y-20 animate-in fade-in slide-in-from-bottom-5 duration-1000">
                        {/* Results Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Bazi Pillars */}
                            <div className="jp-card p-8 group">
                                <h3 className="jp-heading text-lg">
                                    <Sparkles className="text-[#c5a059] group-hover:rotate-12 transition-transform" size={20} />
                                    貴殿の命式（四柱）
                                </h3>
                                <div className="grid grid-cols-4 gap-4 text-center">
                                    {[
                                        { label: '年', val: result.bazi.nenchuu },
                                        { label: '月', val: result.bazi.gecchuu },
                                        { label: '日', val: result.bazi.nicchuu },
                                        { label: '時', val: result.bazi.jichuu },
                                    ].map((p, i) => (
                                        <div key={i} className="space-y-3">
                                            <div className="text-[10px] text-[#c5a059]/60 tracking-widest">{p.label}</div>
                                            <div className="p-4 bg-[#c5a059]/5 border border-[#c5a059]/20 font-bold text-2xl text-[#b22d35]/90">
                                                {p.val}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {partnerData && (
                                    <div className="mt-8 pt-8 border-t border-[#c5a059]/20">
                                        <div className="text-xs text-[#b22d35] font-bold mb-4 tracking-widest flex items-center gap-2">
                                            <Users size={14} /> お相手の命式
                                        </div>
                                        <div className="grid grid-cols-4 gap-4 text-center opacity-60">
                                            {[partnerData.bazi.nenchuu, partnerData.bazi.gecchuu, partnerData.bazi.nicchuu, partnerData.bazi.jichuu].map((val, i) => (
                                                <div key={i} className="bg-white/5 p-2 border border-[#f9f3e9]/10 text-xl font-bold">{val}</div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Elements Chart */}
                            <div className="jp-card p-8 flex flex-col items-center">
                                <h3 className="jp-heading text-lg w-full">五行の均衡</h3>
                                <div className="w-full aspect-square max-h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart data={result.elements}>
                                            <PolarGrid stroke="#c5a059" strokeOpacity={0.2} />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#c5a059', fontSize: 14, fontWeight: 'bold' }} />
                                            <Radar
                                                name="Elements"
                                                dataKey="value"
                                                stroke="#b22d35"
                                                fill="#b22d35"
                                                fillOpacity={0.4}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Fortune Result */}
                        <div className="jp-card overflow-hidden">
                            <div className="flex flex-wrap border-b border-[#c5a059]/20">
                                {['today', 'week', 'month', 'year'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`flex-1 min-w-[100px] py-6 font-bold tracking-[0.3em] text-sm transition-all relative ${activeTab === tab ? 'text-[#c5a059] bg-[#c5a059]/5' : 'text-[#f9f3e9]/40 hover:text-[#f9f3e9]/80'
                                            }`}
                                    >
                                        {tab === 'today' ? '本日' : tab === 'week' ? '週間' : tab === 'month' ? '月間' : '年間'}
                                        {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#c5a059]"></div>}
                                    </button>
                                ))}
                            </div>
                            <div className="p-10 md:p-16 min-h-[500px] relative">
                                <div className="flex items-center gap-4 mb-10 text-[#b22d35]">
                                    {activeTab === 'today' && <Sun size={32} strokeWidth={1} />}
                                    {activeTab === 'week' && <Moon size={32} strokeWidth={1} />}
                                    {activeTab === 'month' && <Clock size={32} strokeWidth={1} />}
                                    {activeTab === 'year' && <Calendar size={32} strokeWidth={1} />}
                                    <span className="text-2xl font-bold tracking-[0.2em] text-[#c5a059]">
                                        {activeTab === 'today' ? '本日の天啓' : activeTab === 'week' ? '週間バイオリズム' : activeTab === 'month' ? '月間の導き' : '年間の宿命'}
                                    </span>
                                </div>

                                <div className="prose-jp max-w-none">
                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center py-24 text-[#c5a059]">
                                            <Loader2 className="animate-spin mb-6" size={48} strokeWidth={1} />
                                            <p className="tracking-[0.5em] font-light animate-pulse">星のささやきを聴いています...</p>
                                        </div>
                                    ) : errorInfo ? (
                                        <div className="p-8 border border-[#b22d35]/30 bg-[#b22d35]/5 text-[#b22d35] rounded-none">
                                            <div className="flex items-center gap-3 mb-4">
                                                <AlertCircle size={24} />
                                                <h4 className="font-bold text-lg">{errorInfo.title}</h4>
                                            </div>
                                            <p className="mb-2 opacity-90">{errorInfo.message}</p>
                                            {errorInfo.status && <p className="text-xs mb-4 opacity-70">Status: {errorInfo.status}</p>}
                                            {errorInfo.details && (
                                                <details className="mt-4">
                                                    <summary className="text-sm cursor-pointer hover:underline opacity-80">詳細なエラー情報を表示</summary>
                                                    <pre className="mt-2 p-4 bg-black/40 text-[10px] overflow-auto max-h-40 text-[#f9f3e9]/60">
                                                        {JSON.stringify(errorInfo.details, null, 2)}
                                                    </pre>
                                                </details>
                                            )}
                                        </div>
                                    ) : (
                                        fortuneText ? (
                                            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(fortuneText)) }} />
                                        ) : (
                                            <p className="text-center py-20 opacity-30 italic">鑑定結果がここに表示されます</p>
                                        )
                                    )}
                                </div>

                                <div className="mt-20 pt-10 border-t border-[#c5a059]/20 flex flex-wrap gap-6 justify-between items-center">
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(shareUrl);
                                                alert('鑑定URLを控えました。');
                                            }}
                                            className="group flex items-center gap-3 px-6 py-3 border border-[#c5a059]/40 hover:bg-[#c5a059] hover:text-[#0a1622] transition-all tracking-widest text-sm"
                                        >
                                            <Share2 size={16} className="group-hover:scale-110" /> 鑑定結果を共有
                                        </button>
                                        <button
                                            onClick={() => {
                                                const url = generateShareUrl(result, 'my');
                                                navigator.clipboard.writeText(url);
                                                alert('相性診断の招待URLを発行しました。');
                                            }}
                                            className="group flex items-center gap-3 px-6 py-3 border border-[#b22d35]/40 hover:bg-[#b22d35] hover:text-[#f9f3e9] transition-all tracking-widest text-sm"
                                        >
                                            <Users size={16} className="group-hover:scale-110" /> 相性を占う（招待）
                                        </button>
                                    </div>

                                    <div className="flex-1 min-w-[300px] bg-gradient-to-r from-[#c5a059]/10 to-transparent p-6 border-l-2 border-[#c5a059]">
                                        <div className="text-[10px] font-bold text-[#b22d35] mb-2 uppercase tracking-[0.3em]">特別案内</div>
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-sm opacity-80">さらなる深淵へ。実力派鑑定師による口寄せ・対面鑑定を予約。</span>
                                            <button className="whitespace-nowrap bg-[#b22d35] text-white px-4 py-2 text-xs hover:opacity-80 transition-opacity">詳細</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <footer className="footer-bg py-20 text-center relative border-t border-[#c5a059]/20 bg-black/30">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0a1622] px-8 text-[#c5a059]">
                    <div className="w-12 h-[1px] bg-[#c5a059] inline-block align-middle mr-4"></div>
                    <Sparkles className="inline-block" size={16} />
                    <div className="w-12 h-[1px] bg-[#c5a059] inline-block align-middle ml-4"></div>
                </div>
                <p className="text-xs tracking-[0.5em] opacity-40">
                    &copy; 2026 TENMEI KAIKA / GEMINI 1.5 FLASH
                </p>
                <p className="mt-4 text-[10px] tracking-[1em] text-[#c5a059]/40">
                    宿命を知り、天命を全うする
                </p>
            </footer>
        </div>
    );
};

export default App;

