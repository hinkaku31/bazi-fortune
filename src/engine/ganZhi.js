export const GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
export const ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

/**
 * 年の干支
 */
export function getYearGanZhi(year) {
  const offset = year - 4;
  const ganIndex = ((offset % 10) + 10) % 10;
  const zhiIndex = ((offset % 12) + 12) % 12;
  return GAN[ganIndex] + ZHI[zhiIndex];
}

/**
 * 月の干支 (五虎遁)
 * @param {number} baziYear 年柱の年
 * @param {number} baziMonth 節切り後の月 (1:寅月, 2:卯月... 11:子月, 12:丑月)
 * ※注意：四柱推命の月は「寅」から始まる (2月付近が1番目)
 */
export function getMonthGanZhi(baziYear, baziMonth) {
  const yearGanIndex = ((baziYear - 4) % 10 + 10) % 10;
  // 月干の開始Index (1月/寅月)
  // 甲・己(0,5) -> 丙寅(2)
  // 乙・庚(1,6) -> 戊寅(4)
  // 丙・辛(2,7) -> 庚寅(6)
  // 丁・壬(3,8) -> 壬寅(8)
  // 戊・癸(4,9) -> 甲寅(0)
  const startMonthGanIndex = (yearGanIndex % 5) * 2 + 2;

  // baziMonth: 2月(寅)=1, 3月(卯)=2, ..., 1月(丑)=12
  const adjustedMonth = (baziMonth + 10) % 12; // 0=寅, 1=卯... 11=丑
  const ganIndex = (startMonthGanIndex + adjustedMonth) % 10;
  const zhiIndex = (adjustedMonth + 2) % 12; // 寅=2

  return GAN[ganIndex] + ZHI[zhiIndex];
}

/**
 * 日の干支 (ユリウス日ベース)
 */
export function getDayGanZhi(year, month, day) {
  let y = year;
  let m = month;
  if (m <= 2) {
    y--;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;

  const dayIndex = Math.floor(jd + 0.5 + 49) % 60;
  return GAN[dayIndex % 10] + ZHI[dayIndex % 12];
}

/**
 * 時の干支 (五鼠遁)
 */
export function getHourGanZhi(dayGan, hour) {
  const dayGanIndex = GAN.indexOf(dayGan);
  const hourZhiIndex = Math.floor((hour + 1) / 2) % 12;
  const startHourGanIndex = (dayGanIndex % 5) * 2;
  const ganIndex = (startHourGanIndex + hourZhiIndex) % 10;
  return GAN[ganIndex] + ZHI[hourZhiIndex];
}
