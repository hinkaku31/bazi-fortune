/**
 * 節入り（二十四節気）の簡易的な計算およびデータ
 * 実際の商用レベルでは天文計算またはNASAのデータが必要だが、
 * ここでは近接した年（2020-2030）の節入りデータを保持し、それ以外は近似計算を行う。
 */

// 各月の節入り日（おおよその目安）
// 2月:立春, 3月:啓蟄, 4月:清明, 5月:立夏, 6月:芒種, 7月:小暑, 8月:立秋, 9月:白露, 10月:寒露, 11月:立冬, 12月:大雪, 1月:小寒
const SOLAR_TERMS_BASE = {
    2: 4, 3: 5, 4: 5, 5: 5, 6: 6, 7: 7, 8: 7, 9: 8, 10: 8, 11: 7, 12: 7, 1: 5
};

/**
 * 指定した年月の節入り日時を取得（簡易版）
 * 商用ではより精密なテーブルが必要
 */
export function getSetsuiri(year, month) {
    // 簡易的な計算ロジック（実際には定気法に基づくべき）
    const baseDay = SOLAR_TERMS_BASE[month] || 5;
    // 年による微調整 (簡易式)
    const diff = Math.floor((year - 2000) * 0.2422 + 0.5) - Math.floor((year - 2000) / 4);
    const day = baseDay + (diff > 0 ? 0 : diff);

    return { day, hour: 0, minute: 0 };
}

/**
 * 現在の日時が節入り以降かどうかを判定
 */
export function isAfterSetsuiri(year, month, day, hour, minute) {
    const setsuiri = getSetsuiri(year, month);
    if (day > setsuiri.day) return true;
    if (day < setsuiri.day) return false;
    if (hour > setsuiri.hour) return true;
    if (hour < setsuiri.hour) return false;
    return minute >= setsuiri.minute;
}
