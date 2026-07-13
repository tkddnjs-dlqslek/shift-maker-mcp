import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  callCreateAvailabilityLink,
  callAvailabilityStatus,
} from "../clients/smartshift.js";

export function registerAvailabilityTools(server: McpServer): void {
  server.registerTool(
    "create_availability_link",
    {
      title: "가용시간 입력 링크 생성",
      description:
        "이번 주 알바 가용시간을 받을 입력 링크를 만든다. 점주가 이 링크를 단톡방에 공유하면 알바가 셀프로 입력한다.",
      inputSchema: {
        sessionId: z.string().describe("가게 세션 ID"),
        weekStartDate: z.string().describe("주 시작일 YYYY-MM-DD (월요일 권장)"),
        ownerToken: z.string().optional().describe("카카오 로그인 토큰(소유자 가게면 필수)"),
      },
    },
    async ({ sessionId, weekStartDate, ownerToken }) => {
      try {
        const r = await callCreateAvailabilityLink(sessionId, weekStartDate, ownerToken);
        return {
          content: [
            {
              type: "text",
              text: `✅ ${weekStartDate} 주 가용시간 입력 링크가 생성됐어요.\n단톡방에 공유하세요:\n${r.url}`,
            },
          ],
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `❌ 링크 생성 오류: ${msg}` }], isError: true };
      }
    }
  );

  server.registerTool(
    "get_availability_status",
    {
      title: "가용시간 제출 현황",
      description: "이 가게 직원 중 누가 가용시간을 제출했고 누가 안 했는지 보여준다.",
      inputSchema: {
        sessionId: z.string().describe("가게 세션 ID"),
        ownerToken: z.string().optional().describe("카카오 로그인 토큰(소유자 가게면 필수)"),
      },
    },
    async ({ sessionId, ownerToken }) => {
      try {
        const s = await callAvailabilityStatus(sessionId, ownerToken);
        const lines = [
          `📋 가용시간 제출 현황 (${s.submittedCount}/${s.total})`,
          s.submitted.length ? `✅ 제출: ${s.submitted.join(", ")}` : "✅ 제출: (없음)",
          s.pending.length ? `⏳ 미제출: ${s.pending.join(", ")}` : "⏳ 미제출: (없음)",
        ];
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `❌ 현황 조회 오류: ${msg}` }], isError: true };
      }
    }
  );
}
