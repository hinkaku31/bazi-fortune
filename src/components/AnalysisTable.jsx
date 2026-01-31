import React from 'react';

const AnalysisTable = ({ result, rawElements }) => {
    const getProgressColor = (element) => {
        const colors = { "木": "bg-blue-200", "火": "bg-red-200", "土": "bg-yellow-100", "金": "bg-gray-100", "水": "bg-gray-300" };
        return colors[element] || "bg-gray-100";
    };

    return (
        <div className="space-y-6">
            <div className="jp-card">
                <h3 className="text-lg font-bold mb-4 border-b pb-2">命式解析</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="font-bold text-gray-500">空亡</div>
                    <div className="text-right font-medium">{result.kuubou}</div>

                    <div className="font-bold text-gray-500">身旺身弱</div>
                    <div className="text-right font-medium text-blue-600">身弱 (小)</div>

                    <div className="font-bold text-gray-500">格局</div>
                    <div className="text-right font-medium">印綬格</div>
                </div>
            </div>

            <div className="jp-card">
                <h3 className="text-lg font-bold mb-4 border-b pb-2">五行バランス</h3>
                <div className="space-y-3">
                    {Object.entries(rawElements).map(([el, val]) => (
                        <div key={el} className="flex items-center gap-3">
                            <span className="w-6 font-bold text-sm">{el}</span>
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${getProgressColor(el)}`}
                                    style={{ width: `${(val / 6) * 100}%` }}
                                ></div>
                            </div>
                            <span className="text-xs text-gray-400 font-medium">{val}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="jp-card">
                <h3 className="text-lg font-bold mb-4 border-b pb-2">吉凶・関係性</h3>
                <div className="space-y-2 text-sm">
                    <div className="p-2 bg-red-50 text-red-700 font-bold rounded text-center">三刑</div>
                    <div className="p-2 bg-red-50 text-red-700 font-bold rounded text-center">六害 (子未)</div>
                    <div className="p-2 bg-blue-50 text-blue-700 font-bold rounded text-center">支合 (午未)</div>
                </div>
            </div>
        </div>
    );
};

export default AnalysisTable;
