import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { callGenerate } from "../clients/smartshift.js";
import { formatSchedule } from "../format/scheduleText.js";

export function registerGenerateSchedule(server: McpServer): void {
  server.registerTool(
    "generate_schedule",
    {
      title: "근무표 생성",
      description: "직원 가용시간·점주 규칙을 반영해 주간 근무표를 생성하고 읽기 좋은 표로 돌려준다.",
      inputSchema: {
        weekStartDate: z.string().describe("주 시작일 YYYY-MM-DD (월요일 권장)"),
        sessionId: z.string().optional().describe("가게 세션 ID (없으면 전역 직원)"),
        laborMode: z
          .enum(["full", "under5", "off"])
          .optional()
          .describe(
            "근로기준법 적용: full=5인 이상(주52h·주휴일·연소근로자, 기본) / under5=5인 미만(주52h 제외) / off=적용제외 직종(소방·경찰·감시단속직 등)"
          ),
        ownerToken: z.string().optional().describe("카카오 로그인 토큰(소유자 가게면 필수)"),
      },
    },
    async ({ weekStartDate, sessionId, laborMode, ownerToken }) => {
      try {
        const result = await callGenerate(sessionId, weekStartDate, laborMode, ownerToken);
        const text = formatSchedule(weekStartDate, result);
        // 백엔드가 정상 응답했어도 솔버가 해를 못 찾으면(success=false) 프로토콜 에러로 표시
        return { content: [{ type: "text", text }], ...(result.success ? {} : { isError: true }) };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `❌ 근무표 생성 중 오류: ${msg}` }], isError: true };
      }
    }
  );
}
