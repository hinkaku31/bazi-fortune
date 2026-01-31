import { GAN, ZHI, getYearGanZhi, getMonthGanZhi, getDayGanZhi, getHourGanZhi } from './ganZhi';
import { isAfterSetsuiri } from './solarTerms';
import {
    HIDDEN_STEMS,
    getTenGod,
    getTwelveLifeStage,
    getNacchin,
    getSpecialStars,
    getKuubou,
    STAGE_POWER
} from './baziPro';

/**
 * 命式（四柱）を算出するメインエンジン
 */
export function calculateBazi(birthDate) {
    const date = new Date(birthDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();

    // 1. 年柱
    let baziYear = year;
    if (month < 2 || (month === 2 && !isAfterSetsuiri(year, 2, day, hour, minute))) {
        baziYear = year - 1;
    }
    const nenchuu = getYearGanZhi(baziYear);

    // 2. 月柱
    let baziMonth = month;
    if (!isAfterSetsuiri(year, month, day, hour, minute)) {
        baziMonth = month - 1;
        if (baziMonth === 0) baziMonth = 12;
    }
    const gecchuu = getMonthGanZhi(baziYear, baziMonth);

    // 3. 日柱
    const nicchuu = getDayGanZhi(year, month, day);

    // 4. 時柱
    const jichuu = getHourGanZhi(nicchuu.substring(0, 1), hour);

    const pillars = { nenchuu, gecchuu, nicchuu, jichuu };
    const dayGan = nicchuu[0];

    // 詳細データの算出
    const result = {
        ...pillars,
        hiddenStems: {
            nenchuu: HIDDEN_STEMS[nenchuu[1]],
            gecchuu: HIDDEN_STEMS[gecchuu[1]],
            nicchuu: HIDDEN_STEMS[nicchuu[1]],
            jichuu: HIDDEN_STEMS[jichuu[1]]
        },
        tenGods: {
            tenGan: {
                nenchuu: getTenGod(dayGan, nenchuu[0]),
                gecchuu: getTenGod(dayGan, gecchuu[0]),
                nicchuu: "", // 自分自身
                jichuu: getTenGod(dayGan, jichuu[0])
            },
            // 地支（蔵干の主力を代表とする簡略版）
            chiZhi: {
                nenchuu: getTenGod(dayGan, HIDDEN_STEMS[nenchuu[1]].slice(-1)[0]),
                gecchuu: getTenGod(dayGan, HIDDEN_STEMS[gecchuu[1]].slice(-1)[0]),
                nicchuu: getTenGod(dayGan, HIDDEN_STEMS[nicchuu[1]].slice(-1)[0]),
                jichuu: getTenGod(dayGan, HIDDEN_STEMS[jichuu[1]].slice(-1)[0])
            }
        },
        twelveLifeStages: {
            nenchuu: { name: getTwelveLifeStage(dayGan, nenchuu[1]), power: STAGE_POWER[getTwelveLifeStage(dayGan, nenchuu[1])] },
            gecchuu: { name: getTwelveLifeStage(dayGan, gecchuu[1]), power: STAGE_POWER[getTwelveLifeStage(dayGan, gecchuu[1])] },
            nicchuu: { name: getTwelveLifeStage(dayGan, nicchuu[1]), power: STAGE_POWER[getTwelveLifeStage(dayGan, nicchuu[1])] },
            jichuu: { name: getTwelveLifeStage(dayGan, jichuu[1]), power: STAGE_POWER[getTwelveLifeStage(dayGan, jichuu[1])] }
        },
        specialStars: getSpecialStars(pillars),
        nacchin: {
            nenchuu: getNacchin(nenchuu),
            gecchuu: getNacchin(gecchuu),
            nicchuu: getNacchin(nicchuu),
            jichuu: getNacchin(jichuu)
        },
        kuubou: getKuubou(nicchuu),
        details: { year, month, day, hour }
    };

    return result;
}

/**
 * 五行の強さを計算 (蔵干も考慮)
 */
export function calculateElements(bazi) {
    const elements = { "木": 0, "火": 0, "土": 0, "金": 0, "水": 0 };
    const mapping = {
        "甲": "木", "乙": "木", "丙": "火", "丁": "火", "戊": "土", "己": "土", "庚": "金", "辛": "金", "壬": "水", "癸": "水",
        "寅": "木", "卯": "木", "辰": "土", "巳": "火", "午": "火", "未": "土", "申": "金", "酉": "金", "戌": "土", "亥": "水", "子": "水", "丑": "土"
    };

    // 天干
    [bazi.nenchuu[0], bazi.gecchuu[0], bazi.nicchuu[0], bazi.jichuu[0]].forEach(c => {
        if (mapping[c]) elements[mapping[c]]++;
    });

    // 地支 (蔵干も合算)
    Object.values(bazi.hiddenStems).flat().forEach(c => {
        if (mapping[c]) elements[mapping[c]] += 0.5; // 蔵干は0.5カウント
    });

    return elements;
}
