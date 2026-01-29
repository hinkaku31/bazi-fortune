import React, { useState, useEffect } from 'react';
import { calculateBazi, calculateElements } from './engine/baziEngine';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Moon, Sun, Calendar, Clock, Share2, Users, Loader2, Sparkles } from 'lucide-react';
import { generateShareUrl, decodeBaziData } from './utils/share';

const App = () => {
    const [birthData, setBirthData] = useState({ date: '', time: '' });
    const [partnerData, setPartnerData] = useState(null);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState('today');
    const [fortuneText, setFortuneText] = useState('');
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
            setFortuneText(data.fortune || '鑑定結果の取得に失敗しました。');
        } catch (err) {
            setFortuneText('接続エラーが発生しました。');
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
        <div className="min-h-screen bg-jp-paper text-jp-black font-serif">
            {/* Header */}
            <header className="bg-jp-green py-12 text-center border-b-4 border-jp-gold relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="grid grid-cols-8 gap-4 rotate-12 scale-150">
                        {[...Array(64)].map((_, i) => (
                            <div key={i} className="w-16 h-16 border-2 border-jp-gold rounded-full"></div>
                        ))}
                    </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-jp-gold tracking-[0.3em] relative z-10 drop-shadow-lg">
                    極・四柱推命 鑑定館
                </h1>
                <p className="text-white/80 mt-4 tracking-widest relative z-10">
                    AIと伝統の融合。あなたの運命を、今ここに紐解く。
                </p>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-12">
                {partnerData && (
                    <div className="bg-jp-red/10 border-2 border-jp-red p-4 mb-8 text-center animate-bounce">
                        <Sparkles className="inline-block text-jp-red mr-2" />
                        <span className="font-bold text-jp-red">相性診断モード：</span> あなたのデータを入力して相性を占いましょう。
                    </div>
                )}

                {/* Input Form */}
                <section className="jp-card p-8 mb-12 shadow-xl border-t-8 border-t-jp-green">
                    <h2 className="jp-heading flex items-center gap-3">
                        <Calendar className="text-jp-gold" /> ご自身の情報を入力
                    </h2>
                    <form onSubmit={handleCalculate} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                        <div>
                            <label className="block text-sm font-bold mb-2 text-jp-green uppercase tracking-tighter">生年月日</label>
                            <input
                                type="date"
                                className="w-full border-2 border-jp-gold/30 p-3 rounded-none focus:border-jp-green outline-none transition-colors bg-white/50"
                                value={birthData.date}
                                onChange={(e) => setBirthData({ ...birthData, date: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2 text-jp-green uppercase tracking-tighter">出生時刻</label>
                            <input
                                type="time"
                                className="w-full border-2 border-jp-gold/30 p-3 rounded-none focus:border-jp-green outline-none transition-colors bg-white/50"
                                value={birthData.time}
                                onChange={(e) => setBirthData({ ...birthData, time: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2 text-center">
                            <button
                                type="submit"
                                disabled={loading}
                                className="jp-button-primary text-xl scale-110 shadow-lg active:scale-95 duration-200 flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : null}
                                {partnerData ? '二人を相性診断する' : '運命を鑑定する'}
                            </button>
                        </div>
                    </form>
                </section>

                {result && (
                    <div className="space-y-12 animate-in fade-in duration-700">
                        {/* Results Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Bazi Pillars */}
                            <div className="jp-card p-6">
                                <h3 className="jp-heading text-lg">命式 (四柱)</h3>
                                <div className="grid grid-cols-4 gap-2 text-center">
                                    {[
                                        { label: '年', val: result.bazi.nenchuu },
                                        { label: '月', val: result.bazi.gecchuu },
                                        { label: '日', val: result.bazi.nicchuu },
                                        { label: '時', val: result.bazi.jichuu },
                                    ].map((p, i) => (
                                        <div key={i} className="p-2 bg-jp-paper border border-jp-gold/20">
                                            <div className="text-[10px] text-jp-green/60 mb-1">{p.label}</div>
                                            <div className="text-xl font-bold text-jp-red">{p.val}</div>
                                        </div>
                                    ))}
                                </div>
                                {partnerData && (
                                    <div className="mt-4 pt-4 border-t border-jp-gold/20">
                                        <div className="text-xs text-jp-red font-bold mb-2">★ 相手の命式</div>
                                        <div className="grid grid-cols-4 gap-2 text-center opacity-70">
                                            {[partnerData.bazi.nenchuu, partnerData.bazi.gecchuu, partnerData.bazi.nicchuu, partnerData.bazi.jichuu].map((val, i) => (
                                                <div key={i} className="bg-jp-red/5 p-1 border border-jp-red/10 text-lg font-bold">{val}</div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Elements Chart */}
                            <div className="jp-card p-6 min-h-[300px] flex flex-col items-center">
                                <h3 className="jp-heading text-lg w-full">五行バランス</h3>
                                <div className="w-full h-full flex-1">
                                    <ResponsiveContainer width="100%" height={250}>
                                        <RadarChart data={result.elements}>
                                            <PolarGrid stroke="#c5a059" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#1b3022', fontWeight: 'bold' }} />
                                            <Radar
                                                name="Five Elements"
                                                dataKey="value"
                                                stroke="#b22d35"
                                                fill="#b22d35"
                                                fillOpacity={0.6}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Fortune Tabs */}
                        <div className="jp-card overflow-hidden">
                            <div className="flex border-b border-jp-gold/30 bg-jp-green text-white">
                                {['today', 'week', 'month', 'year'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`flex-1 py-4 font-bold tracking-widest transition-all ${activeTab === tab ? 'bg-jp-gold text-jp-black' : 'hover:bg-jp-green/80'
                                            }`}
                                    >
                                        {tab === 'today' ? '今日' : tab === 'week' ? '今週' : tab === 'month' ? '今月' : '今年'}
                                    </button>
                                ))}
                            </div>
                            <div className="p-8 leading-relaxed text-lg min-h-[400px]">
                                <div className="flex items-center gap-2 mb-6 text-jp-red">
                                    {activeTab === 'today' && <Sun size={24} />}
                                    {activeTab === 'week' && <Moon size={24} />}
                                    {activeTab === 'month' && <Clock size={24} />}
                                    {activeTab === 'year' && <Calendar size={24} />}
                                    <span className="font-bold underline decoration-jp-gold underline-offset-8">
                                        {activeTab === 'today' ? '本日の運勢' : activeTab === 'week' ? '今週の運命バイオリズム' : activeTab === 'month' ? '今月の活動指針' : '今年の天命'}
                                    </span>
                                </div>

                                <div className="prose prose-jp max-w-none whitespace-pre-wrap">
                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-jp-gold animate-pulse">
                                            <Sparkles size={48} className="mb-4" />
                                            <p>天の啓示を読み解いています...</p>
                                        </div>
                                    ) : (
                                        fortuneText
                                    )}
                                </div>

                                <div className="mt-12 pt-8 border-t border-jp-gold/20 flex flex-wrap gap-4 justify-between items-center">
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(shareUrl);
                                                alert('シェアURLをコピーしました。');
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 border border-jp-gold hover:bg-jp-gold hover:text-white transition-colors"
                                        >
                                            <Share2 size={18} /> シェアURL発行
                                        </button>
                                        <button
                                            onClick={() => {
                                                const url = generateShareUrl(result, 'my');
                                                navigator.clipboard.writeText(url);
                                                alert('相性診断用URLをコピーしました。相手に送ってみましょう。');
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 border border-jp-gold hover:bg-jp-gold hover:text-white transition-colors"
                                        >
                                            <Users size={18} /> 相性診断URL
                                        </button>
                                    </div>

                                    {/* Affiliates Placeholder */}
                                    <div className="w-full mt-6 bg-gradient-to-r from-jp-gold/10 to-transparent p-4 border border-jp-gold/30">
                                        <div className="text-xs font-bold text-jp-red mb-2 uppercase tracking-widest">Sponsored</div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">【霊感鑑定】あなたの今の悩みをズバリ解決。初回10分無料鑑定実施中</span>
                                            <a href="#" className="text-xs bg-jp-red text-white px-3 py-1 hover:opacity-80">詳細を見る</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <footer className="bg-jp-black text-white py-12 text-center text-sm tracking-[0.2em] opacity-80">
                &copy; 2026 極・四柱推命 鑑定館 / Produced by Gemini Flash
            </footer>
        </div>
    );
};

export default App;
