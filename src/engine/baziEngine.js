import { GAN, ZHI, getYearGanZhi, getMonthGanZhi, getDayGanZhi, getHourGanZhi } from './ganZhi';
import { isAfterSetsuiri } from './solarTerms';

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
    // 立春（2月の節入り）前なら前年とする
    let baziYear = year;
    if (month < 2 || (month === 2 && !isAfterSetsuiri(year, 2, day, hour, minute))) {
        baziYear = year - 1;
    }
    const nenchuu = getYearGanZhi(baziYear);

    // 2. 月柱
    // その月の節入り前なら前月の干支とする
    let baziMonth = month;
    let baziMonthYear = year;
    if (!isAfterSetsuiri(year, month, day, hour, minute)) {
        baziMonth = month - 1;
        if (baziMonth === 0) {
            baziMonth = 12;
            baziMonthYear = year - 1;
        }
    }
    // 月柱は年干から導出される (五虎遁)
    const gecchuu = getMonthGanZhi(baziYear, baziMonth);

    // 3. 日柱
    const nicchuu = getDayGanZhi(year, month, day);

    // 4. 時柱
    const jichuu = getHourGanZhi(nicchuu.substring(0, 1), hour);

    return {
        nenchuu,
        gecchuu,
        nicchuu,
        jichuu,
        details: {
            year, month, day, hour
        }
    };
}

/**
 * 五行の強さを計算
 */
export function calculateElements(bazi) {
    const elements = { "木": 0, "火": 0, "土": 0, "金": 0, "水": 0 };
    const mapping = {
        // 天干
        "甲": "木", "乙": "木", "丙": "火", "丁": "火", "戊": "土", "己": "土", "庚": "金", "辛": "金", "壬": "水", "癸": "水",
        // 地支
        "寅": "木", "卯": "木", "辰": "土", "巳": "火", "午": "火", "未": "土", "申": "金", "酉": "金", "戌": "土", "亥": "水", "子": "水", "丑": "土"
    };

    const chars = (bazi.nenchuu + bazi.gecchuu + bazi.nicchuu + bazi.jichuu).split("");
    chars.forEach(c => {
        if (mapping[c]) elements[mapping[c]]++;
    });

    return elements;
}
