import React from 'react';

const ResultTable = ({ result }) => {
    const pillars = [
        { label: '時柱', id: 'jichuu' },
        { label: '日柱', id: 'nicchuu' },
        { label: '月柱', id: 'gecchuu' },
        { label: '年柱', id: 'nenchuu' },
    ];

    const getElementColor = (char) => {
        const mapping = {
            "甲": "#E3F2FD", "乙": "#E3F2FD", "寅": "#E3F2FD", "卯": "#E3F2FD",
            "丙": "#FFEBEE", "丁": "#FFEBEE", "巳": "#FFEBEE", "午": "#FFEBEE",
            "戊": "#FFFDE7", "己": "#FFFDE7", "辰": "#FFFDE7", "戌": "#FFFDE7", "丑": "#FFFDE7", "未": "#FFFDE7",
            "庚": "#ffffff", "辛": "#ffffff", "申": "#ffffff", "酉": "#ffffff",
            "壬": "#F5F5F5", "癸": "#F5F5F5", "亥": "#F5F5F5", "子": "#F5F5F5"
        };
        return mapping[char] || "#ffffff";
    };

    const getPowerStars = (power) => "★".repeat(power) + "☆".repeat(5 - power);

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr>
                        <th className="p-2 border-b border-gray-200"></th>
                        {pillars.map(p => (
                            <th key={p.id} className="p-3 border-b border-gray-200 font-bold text-gray-600">
                                {p.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {/* 天干 */}
                    <tr>
                        <td className="p-3 font-bold text-gray-400 text-center align-middle">天干</td>
                        {pillars.map(p => {
                            const char = result[p.id][0];
                            return (
                                <td key={p.id} className="p-1 border border-white">
                                    <div
                                        className="aspect-square flex flex-col items-center justify-center p-2 text-xl font-bold rounded-lg shadow-sm"
                                        style={{ backgroundColor: getElementColor(char) }}
                                    >
                                        {char}
                                        <span className="text-[10px] font-normal opacity-70">
                                            ({result.tenGods.tenGan[p.id] || '日主'})
                                        </span>
                                    </div>
                                </td>
                            );
                        })}
                    </tr>

                    {/* 地支 */}
                    <tr>
                        <td className="p-3 font-bold text-gray-400 text-center align-middle">地支</td>
                        {pillars.map(p => {
                            const char = result[p.id][1];
                            return (
                                <td key={p.id} className="p-1 border border-white">
                                    <div
                                        className="aspect-square flex flex-col items-center justify-center p-2 text-xl font-bold rounded-lg shadow-sm"
                                        style={{ backgroundColor: getElementColor(char) }}
                                    >
                                        {char}
                                        <span className="text-[10px] font-normal opacity-70">
                                            ({result.tenGods.chiZhi[p.id]})
                                        </span>
                                    </div>
                                </td>
                            );
                        })}
                    </tr>

                    {/* 蔵干 */}
                    <tr>
                        <td className="p-3 font-bold text-gray-400 text-center align-middle">蔵干</td>
                        {pillars.map(p => (
                            <td key={p.id} className="p-2 border border-white bg-gray-50 text-center">
                                <div className="text-xs text-gray-600 font-medium">
                                    {result.hiddenStems[p.id].join(' ')}
                                </div>
                            </td>
                        ))}
                    </tr>

                    {/* 十二運 */}
                    <tr>
                        <td className="p-3 font-bold text-gray-400 text-center align-middle">十二運</td>
                        {pillars.map(p => (
                            <td key={p.id} className="p-2 border border-white bg-white text-center">
                                <div className="font-bold text-gray-700">{result.twelveLifeStages[p.id].name}</div>
                                <div className="text-[10px] text-yellow-500 tracking-tighter">
                                    {getPowerStars(result.twelveLifeStages[p.id].power)}
                                </div>
                            </td>
                        ))}
                    </tr>

                    {/* 特殊星 */}
                    <tr>
                        <td className="p-3 font-bold text-gray-400 text-center align-middle">特殊星</td>
                        {pillars.map(p => (
                            <td key={p.id} className="p-2 border border-white bg-gray-50 text-xs text-center align-top min-h-[60px]">
                                {result.specialStars[p.id].length > 0 ? result.specialStars[p.id].map((star, i) => (
                                    <div key={i} className="mb-1 text-red-600 font-medium">{star}</div>
                                )) : '-'}
                            </td>
                        ))}
                    </tr>

                    {/* 納音 */}
                    <tr>
                        <td className="p-3 font-bold text-gray-400 text-center align-middle">納音</td>
                        {pillars.map(p => (
                            <td key={p.id} className="p-2 border border-white text-center">
                                <div
                                    className="text-[11px] font-medium py-1 px-2 rounded"
                                    style={{ backgroundColor: getElementColor(result.nacchin[p.id].slice(-1)) }}
                                >
                                    {result.nacchin[p.id]}
                                </div>
                            </td>
                        ))}
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default ResultTable;
