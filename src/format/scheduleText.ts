import type { GenResult, GenShift } from "../clients/smartshift.js";

const DAY_KO: Record<string, string> = {
  MONDAY: "월",
  TUESDAY: "화",
  WEDNESDAY: "수",
  THURSDAY: "목",
  FRIDAY: "금",
  SATURDAY: "토",
  SUNDAY: "일",
};

export function formatSchedule(weekStartDate: string, r: GenResult): string {
  if (!r.success) {
    return `❌ 근무표 생성 실패\n사유: ${r.message}`;
  }
  // 날짜 → (교대 키 → { time, names })
  const byDate = new Map<string, Map<string, { time: string; names: string[] }>>();
  for (const s of r.shifts) {
    if (!byDate.has(s.date)) byDate.set(s.date, new Map());
    const slots = byDate.get(s.date)!;
    const key = s.shift_name;
    if (!slots.has(key)) {
      const crosses = s.end_time < s.start_time; // 종료<시작 → 자정 넘김 (동일시각 0h는 제외)
      slots.set(key, {
        time: `${s.start_time}~${s.end_time}${crosses ? "(익일)" : ""}`,
        names: [],
      });
    }
    slots.get(key)!.names.push(s.employee_name);
  }
  const lines: string[] = [`📅 ${weekStartDate} 주 근무표`];
  if (r.shifts.length === 0) {
    lines.push("\n배정된 근무가 없습니다.");
  }
  for (const date of [...byDate.keys()].sort()) {
    const dow = r.shifts.find((s: GenShift) => s.date === date)?.day_of_week ?? "";
    lines.push(`\n[${DAY_KO[dow] ?? "?"} ${date}]`);
    const slots = byDate.get(date)!;
    for (const [name, v] of slots) {
      lines.push(`  ${name} ${v.time}: ${v.names.join(", ")}`);
    }
  }
  if (r.warnings && r.warnings.length) {
    const isShortfall = (w: string) => /계약 주 .*만 배정/.test(w);
    const shortfalls = r.warnings.filter(isShortfall);
    const others = r.warnings.filter((w) => !isShortfall(w));
    const parts: string[] = [];
    if (shortfalls.length) parts.push(`직원 여유로 ${shortfalls.length}명이 계약일수보다 적게 배정됨`);
    parts.push(...others);
    if (parts.length) lines.push(`\n⚠️ ${parts.join(" / ")}`);
  }
  return lines.join("\n");
}
