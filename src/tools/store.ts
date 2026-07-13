import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { callCreateStore, callSetEmployee } from "../clients/smartshift.js";

export function registerStoreTools(server: McpServer): void {
  server.registerTool(
    "set_store",
    {
      title: "가게 생성/설정",
      description:
        "새 가게(스케줄 세션)를 만든다. 교대(이름·시작·종료·필요인원)와 운영요일을 설정. 생성된 sessionId를 이후 도구에 사용한다.",
      inputSchema: {
        name: z.string().describe("가게 이름"),
        shiftSlots: z
          .array(
            z.object({
              name: z.string().describe("교대 이름 (예: 오전, 마감)"),
              startTime: z.string().describe("시작 HH:MM"),
              endTime: z.string().describe("종료 HH:MM (자정 넘으면 그대로, 예 02:00)"),
              count: z.number().int().describe("필요 인원"),
              day: z
                .enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"])
                .optional()
                .describe("특정 요일에만 적용 (요일별 인원 차등). 같은 이름의 기본 슬롯이 있으면 그 요일엔 이 count가 총원으로 대체됨(가산 아님). 예: 평시 2명·토요일만 3명 → 기본 count=2 + day=SATURDAY count=3"),
            })
          )
          .optional()
          .describe("교대 목록 (생략 시 오전/오후 기본값)"),
        workingDays: z
          .array(z.string())
          .optional()
          .describe("운영 요일 MONDAY~SUNDAY (생략 시 주7일)"),
        ownerToken: z
          .string()
          .optional()
          .describe("카카오 로그인 토큰(login 도구로 획득). 넣으면 이 가게는 로그인한 본인만 접근 가능"),
      },
    },
    async ({ name, shiftSlots, workingDays, ownerToken }) => {
      try {
        const s = await callCreateStore({ name, shiftSlots, workingDays, ownerToken });
        const DAY_KO: Record<string, string> = {
          MONDAY: "월", TUESDAY: "화", WEDNESDAY: "수", THURSDAY: "목",
          FRIDAY: "금", SATURDAY: "토", SUNDAY: "일",
        };
        const slotText = s.shiftSlots
          .map((x) => {
            const dayTag = x.day ? `, ${DAY_KO[x.day] ?? x.day}요일만` : "";
            return `${x.name}(${x.startTime}~${x.endTime}, ${x.count}명${dayTag})`;
          })
          .join(", ");
        return {
          content: [
            {
              type: "text",
              text:
                `✅ 가게 "${s.name}" 생성됨.\nsessionId: ${s.sessionId}\n` +
                `교대: ${slotText}\n운영요일: ${s.workingDays.join(",")}\n` +
                `이제 set_employee_constraints로 직원을 추가하세요.`,
            },
          ],
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `❌ 가게 생성 오류: ${msg}` }], isError: true };
      }
    }
  );

  server.registerTool(
    "set_employee_constraints",
    {
      title: "직원 추가/조건 설정",
      description:
        "가게에 직원을 추가하거나 조건을 수정한다(이름 기준). 주 계약일수·근무 불가 요일·연소근로자 여부 설정.",
      inputSchema: {
        sessionId: z.string().describe("가게 세션 ID"),
        name: z.string().describe("직원 이름"),
        contractDays: z.number().int().optional().describe("주 계약 근무일수 (기본 5)"),
        unavailableDays: z
          .array(z.string())
          .optional()
          .describe("근무 불가 요일 MONDAY~SUNDAY (하루 전체 불가)"),
        isMinor: z.boolean().optional().describe("연소근로자(만 18세 미만) 여부 — 야간금지·1일7h·주35h"),
        fixedSlots: z
          .array(
            z.object({
              day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
              shiftName: z.string().describe("교대 이름"),
            })
          )
          .optional()
          .describe("필수 배정(고정) — 이 사람이 매주 반드시 들어가야 하는 요일×교대. 예: 매주 월요일 오픈 고정"),
        unavailableSlots: z
          .array(
            z.object({
              date: z.string().describe("날짜 YYYY-MM-DD"),
              shiftName: z.string().describe("교대 이름"),
            })
          )
          .optional()
          .describe("특정 날짜×교대 불가 — 특정 날의 특정 교대에만 안 넣음(하루 전체가 아니라). 예: 7/8 마감 불가"),
        ownerToken: z.string().optional().describe("카카오 로그인 토큰(소유자 가게면 필수)"),
      },
    },
    async ({ sessionId, name, contractDays, unavailableDays, isMinor, fixedSlots, unavailableSlots, ownerToken }) => {
      try {
        const r = await callSetEmployee({ sessionId, name, contractDays, unavailableDays, isMinor, fixedSlots, unavailableSlots, ownerToken });
        const verb = r.action === "created" ? "추가" : "수정";
        return { content: [{ type: "text", text: `✅ 직원 "${r.name}" ${verb} 완료.` }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `❌ 직원 설정 오류: ${msg}` }], isError: true };
      }
    }
  );
}
