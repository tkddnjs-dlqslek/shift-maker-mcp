import { describe, it, expect } from "vitest";
import { formatSchedule } from "../src/format/scheduleText.js";

it("날짜별·교대별로 그룹핑한 한국어 표를 만든다", () => {
  const out = formatSchedule("2026-03-09", {
    success: true, message: "ok",
    shifts: [
      { employee_name: "김알바", date: "2026-03-09", day_of_week: "MONDAY", start_time: "08:00", end_time: "14:00", shift_name: "A조" },
      { employee_name: "이알바", date: "2026-03-09", day_of_week: "MONDAY", start_time: "08:00", end_time: "14:00", shift_name: "A조" },
    ],
    warnings: ["김알바 계약 3일 중 2일 배정"],
  });
  expect(out).toContain("2026-03-09");
  expect(out).toContain("A조 08:00~14:00");
  expect(out).toContain("김알바");
  expect(out).toContain("이알바");
  expect(out).toContain("⚠️");
});

it("실패 결과는 사유를 안내한다", () => {
  const out = formatSchedule("2026-03-09", { success: false, message: "해를 찾지 못했습니다", shifts: [] });
  expect(out).toContain("생성 실패");
  expect(out).toContain("해를 찾지 못했습니다");
});

it("성공이지만 배정이 없으면 안내 문구를 넣는다", () => {
  const out = formatSchedule("2026-03-09", { success: true, message: "ok", shifts: [] });
  expect(out).toContain("배정된 근무가 없습니다");
});

it("자정 넘김 교대는 시간에 (익일)을 붙인다", () => {
  const out = formatSchedule("2026-03-09", {
    success: true, message: "ok",
    shifts: [
      { employee_name: "김알바", date: "2026-03-09", day_of_week: "MONDAY", start_time: "20:00", end_time: "02:00", shift_name: "E조" },
    ],
  });
  expect(out).toContain("E조 20:00~02:00(익일)");
});

it("계약미달 경고는 N명으로 요약하고 주휴수당 등은 유지한다", () => {
  const out = formatSchedule("2026-03-09", {
    success: true, message: "ok",
    shifts: [
      { employee_name: "김", date: "2026-03-09", day_of_week: "MONDAY", start_time: "09:00", end_time: "13:00", shift_name: "오전" },
    ],
    warnings: [
      "김: 계약 주 5일 중 3일만 배정 (필요 인원 대비 직원 여유)",
      "이: 계약 주 5일 중 2일만 배정 (필요 인원 대비 직원 여유)",
      "주휴수당 발생(주 15시간 이상): 김, 이, 박",
    ],
  });
  expect(out).toContain("2명"); // 계약미달 2명 요약
  expect(out).not.toContain("3일만 배정"); // 개별 나열 제거
  expect(out).toContain("주휴수당 발생"); // 그 외 경고는 유지
});
