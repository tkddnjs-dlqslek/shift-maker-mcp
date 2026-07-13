import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { callGetSchedule } from "../clients/smartshift.js";
import { formatSchedule } from "../format/scheduleText.js";

export function registerGetSchedule(server: McpServer): void {
  server.registerTool(
    "get_schedule",
    {
      title: "근무표 조회",
      description:
        "이미 생성·저장된 주간 근무표를 조회한다(새로 편성하지 않음, 읽기전용). '지금 근무표 보여줘'처럼 확정된 표를 다시 보고 싶을 때 사용. 새로 짜려면 generate_schedule을 쓴다.",
      inputSchema: {
        weekStartDate: z.string().describe("주 시작일 YYYY-MM-DD"),
        sessionId: z.string().optional().describe("가게 세션 ID (없으면 전역 직원)"),
        ownerToken: z.string().optional().describe("카카오 로그인 토큰(소유자 가게면 필수)"),
      },
    },
    async ({ weekStartDate, sessionId, ownerToken }) => {
      try {
        const r = await callGetSchedule(sessionId, weekStartDate, ownerToken);
        if (!r.shifts.length) {
          return {
            content: [
              {
                type: "text",
                text: "아직 생성·저장된 근무표가 없어요. generate_schedule로 먼저 만들어 주세요.",
              },
            ],
          };
        }
        return { content: [{ type: "text", text: formatSchedule(weekStartDate, r) }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `❌ 근무표 조회 오류: ${msg}` }], isError: true };
      }
    }
  );
}
