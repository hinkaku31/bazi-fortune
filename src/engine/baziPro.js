import { GAN, ZHI } from './ganZhi';

/**
 * 蔵干 (Hidden Stems) 算出
 * 便宜上、各支に含まれる干を配列で返す
 */
export const HIDDEN_STEMS = {
    "子": ["癸"],
    "丑": ["癸", "辛", "己"],
    "寅": ["戊", "丙", "甲"],
    "卯": ["乙"],
    "辰": ["乙", "癸", "戊"],
    "巳": ["戊", "庚", "丙"],
    "午": ["己", "丁"],
    "未": ["丁", "乙", "己"],
    "申": ["己", "壬", "庚"],
    "酉": ["辛"],
    "戌": ["辛", "丁", "戊"],
    "亥": ["甲", "壬"]
};

/**
 * 通変星 (Ten Gods / Hen-sei) 判定
 * @param {string} dayGan 日主 (自分)
 * @param {string} targetGan 対象の干
 */
export function getTenGod(dayGan, targetGan) {
    const dayIndex = GAN.indexOf(dayGan);
    const targetIndex = GAN.indexOf(targetGan);

    // 五行の属性 (0:木, 1:火, 2:土, 3:金, 4:水)
    const dayElement = Math.floor(dayIndex / 2);
    const targetElement = Math.floor(targetIndex / 2);

    // 陰陽 (0:陽, 1:陰)
    const dayYinYang = dayIndex % 2;
    const targetYinYang = targetIndex % 2;

    // 相生・相克関係
    const diff = (targetElement - dayElement + 5) % 5;
    const isSameYinYang = dayYinYang === targetYinYang;

    switch (diff) {
        case 0: // 比劫
            return isSameYinYang ? "比肩" : "劫財";
        case 1: // 食傷
            return isSameYinYang ? "食神" : "傷官";
        case 2: // 財星
            return isSameYinYang ? "偏財" : "正財";
        case 3: // 官星
            return isSameYinYang ? "偏官" : "正官";
        case 4: // 印星
            return isSameYinYang ? "偏印" : "印綬";
        default:
            return "";
    }
}

/**
 * 十二運 (Twelve Stages of Life) 判定
 */
export function getTwelveLifeStage(dayGan, zhi) {
    const table = {
        "甲": { "亥": "長生", "戌": "養", "酉": "胎", "申": "絶", "未": "墓", "午": "死", "巳": "病", "辰": "衰", "卯": "帝旺", "寅": "建禄", "丑": "冠帯", "子": "沐浴" },
        "乙": { "午": "長生", "未": "養", "申": "胎", "酉": "絶", "戌": "墓", "亥": "死", "子": "病", "丑": "衰", "寅": "帝旺", "卯": "建禄", "辰": "冠帯", "巳": "沐浴" },
        "丙": { "寅": "長生", "丑": "養", "子": "胎", "亥": "絶", "戌": "墓", "酉": "死", "申": "病", "未": "衰", "午": "帝旺", "巳": "建禄", "辰": "冠帯", "卯": "沐浴" },
        "丁": { "酉": "長生", "戌": "養", "亥": "胎", "子": "絶", "丑": "墓", "寅": "死", "卯": "病", "辰": "衰", "巳": "帝旺", "午": "建禄", "未": "冠帯", "申": "沐浴" },
        "戊": { "寅": "長生", "丑": "養", "子": "胎", "亥": "絶", "戌": "墓", "酉": "死", "申": "病", "未": "衰", "午": "帝旺", "巳": "建禄", "辰": "冠帯", "卯": "沐浴" },
        "己": { "酉": "長生", "戌": "養", "亥": "胎", "子": "絶", "丑": "墓", "寅": "死", "卯": "病", "辰": "衰", "巳": "帝旺", "午": "建禄", "未": "冠帯", "申": "沐浴" },
        "庚": { "巳": "長生", "辰": "養", "卯": "胎", "寅": "絶", "丑": "墓", "子": "死", "亥": "病", "戌": "衰", "酉": "帝旺", "申": "建禄", "未": "冠帯", "午": "沐浴" },
        "辛": { "子": "長生", "丑": "養", "寅": "胎", "卯": "絶", "辰": "墓", "巳": "死", "午": "病", "未": "衰", "申": "帝旺", "酉": "建禄", "戌": "冠帯", "亥": "沐浴" },
        "壬": { "申": "長生", "未": "養", "午": "胎", "巳": "絶", "辰": "墓", "卯": "死", "寅": "病", "丑": "衰", "子": "帝旺", "亥": "建禄", "戌": "冠帯", "酉": "沐浴" },
        "癸": { "卯": "長生", "辰": "養", "巳": "胎", "午": "絶", "未": "墓", "申": "死", "酉": "病", "戌": "衰", "亥": "帝旺", "子": "建禄", "丑": "冠帯", "寅": "沐浴" },
    };
    return table[dayGan][zhi] || "";
}

export const STAGE_POWER = {
    "長生": 4, "沐浴": 3, "冠帯": 5, "建禄": 5, "帝旺": 5, "衰": 3, "病": 2, "死": 1, "墓": 2, "絶": 1, "胎": 2, "養": 3
};

/**
 * 納音 (Nacchin) 算出
 */
export function getNacchin(ganzhi) {
    const table = {
        "甲子": "海中金", "乙丑": "海中金", "丙寅": "炉中火", "丁卯": "炉中火", "戊辰": "大林木", "己巳": "大林木",
        "庚午": "路傍土", "辛未": "路傍土", "壬申": "剣鋒金", "癸酉": "剣鋒金", "甲戌": "山頭火", "乙亥": "山頭火",
        "丙子": "澗下水", "丁丑": "澗下水", "戊寅": "城頭土", "己卯": "城頭土", "庚辰": "白鑞金", "辛巳": "白鑞金",
        "壬午": "楊柳木", "癸未": "楊柳木", "甲申": "泉中水", "乙酉": "泉中水", "丙戌": "屋上土", "丁亥": "屋上土",
        "戊子": "霹靂火", "己丑": "霹靂火", "庚寅": "松柏木", "辛卯": "松柏木", "壬辰": "長流水", "癸巳": "長流水",
        "甲午": "砂中金", "乙未": "砂中金", "丙申": "山下火", "丁酉": "山下火", "戊戌": "平地木", "己亥": "平地木",
        "庚子": "壁上土", "辛丑": "壁上土", "壬寅": "金箔金", "癸卯": "金箔金", "甲辰": "覆燈火", "乙巳": "覆燈火",
        "丙午": "天河水", "丁未": "天河水", "戊申": "大駅土", "己酉": "大駅土", "庚戌": "釵釧金", "辛亥": "釵釧金",
        "壬子": "桑柘木", "癸丑": "桑柘木", "甲寅": "大渓水", "乙卯": "大渓水", "丙辰": "沙中土", "丁巳": "沙中土",
        "戊午": "天上火", "己未": "天上火", "庚申": "石榴木", "辛酉": "石榴木", "壬戌": "大海水", "癸亥": "大海水"
    };
    return table[ganzhi] || "";
}

/**
 * 特殊星算出 (一部抜粋)
 */
export function getSpecialStars(bazi) {
    const stars = { nenchuu: [], gecchuu: [], nicchuu: [], jichuu: [] };
    const n = bazi.nenchuu, g = bazi.gecchuu, ni = bazi.nicchuu, j = bazi.jichuu;
    const dayGan = ni[0], dayZhi = ni[1];

    // 天徳貴人
    const tentokuTable = { "寅": "丁", "卯": "申", "辰": "壬", "巳": "辛", "午": "亥", "未": "甲", "申": "癸", "酉": "寅", "戌": "丙", "亥": "乙", "子": "巳", "丑": "庚" };
    const target = tentokuTable[g[1]];
    if (n[0] === target || ni[0] === target || j[0] === target) {
        if (n[0] === target) stars.nenchuu.push("天徳貴人");
        if (ni[0] === target) stars.nicchuu.push("天徳貴人");
        if (j[0] === target) stars.jichuu.push("天徳貴人");
    }

    // 華蓋 (三合火局などは本来複雑だが、簡易実装)
    const kagaiTable = { "寅": "戌", "午": "戌", "戌": "戌", "亥": "未", "卯": "未", "未": "未", "申": "辰", "子": "辰", "辰": "辰", "巳": "丑", "酉": "丑", "丑": "丑" };
    if (n[1] === kagaiTable[dayZhi]) stars.nenchuu.push("華蓋");
    if (g[1] === kagaiTable[dayZhi]) stars.gecchuu.push("華蓋");
    if (j[1] === kagaiTable[dayZhi]) stars.jichuu.push("華蓋");

    return stars;
}

/**
 * 空亡 (Kuubou)
 */
export function getKuubou(nicchuu) {
    const sixty = [];
    for (let i = 0; i < 60; i++) {
        sixty.push(GAN[i % 10] + ZHI[i % 12]);
    }
    const index = sixty.indexOf(nicchuu);
    const group = Math.floor(index / 10);
    const table = ["戌亥", "申酉", "午未", "辰巳", "寅卯", "子丑"];
    return table[group];
}
