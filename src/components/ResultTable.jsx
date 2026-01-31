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
            "甲": "wood", "乙": "wood", "寅": "wood", "卯": "wood",
            "丙": "fire", "丁": "fire", "巳": "fire", "午": "fire",
            "戊": "earth", "己": "earth", "辰": "earth", "戌": "earth", "丑": "earth", "未": "earth",
            "庚": "metal", "辛": "metal", "申": "metal", "酉": "metal",
            "壬": "water", "癸": "water", "亥": "water", "子": "water"
        };
        const key = mapping[char] || "metal";
        return `var(--element-${key})`;
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
