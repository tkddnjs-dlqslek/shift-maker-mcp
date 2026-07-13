import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { callPublish } from "../clients/smartshift.js";

export function registerPublishTool(server: McpServer): void {
  server.registerTool(
    "publish_to_calendar",
    {
      title: "톡캘린더 발행",
      description:
        "확정된 주간 근무표를 점포 카카오채널의 구독 캘린더(공개 일정)로 발행한다. 알바는 한 번 구독하면 자동으로 본다.",
      inputSchema: {
        sessionId: z.string().describe("가게 세션 ID"),
        weekStartDate: z.string().describe("주 시작일 YYYY-MM-DD"),
        ownerToken: z.string().optional().describe("카카오 로그인 토큰(소유자 가게면 필수)"),
      },
    },
    async ({ sessionId, weekStartDate, ownerToken }) => {
      try {
        const r = await callPublish(sessionId, weekStartDate, ownerToken);
        if (r.dryRun) {
          const sample = r.sample.length ? `\n예시:\n${r.sample.join("\n")}` : "";
          return {
            content: [
              {
                type: "text",
                text:
                  `🗓️ 발행 예정 ${r.total}건 (카카오 자격증명 미설정 — 실제 발행 대기).${sample}\n\n` +
                  `실제 발행하려면 SmartShift에 KAKAO_ADMIN_KEY · KAKAO_CHANNEL_PUBLIC_ID 설정이 필요해요.`,
              },
            ],
          };
        }
        // 전체 실패 → 에러 / 부분 실패 → 경고(isError) / 전건 성공 → 완료
        if (r.published === 0 && r.total > 0) {
          return {
            content: [{ type: "text", text: `❌ 톡캘린더 발행 실패 0/${r.total}건. 카카오 키·채널ID·API 설정을 확인하세요.` }],
            isError: true,
          };
        }
        if (r.failed > 0) {
          return {
            content: [{ type: "text", text: `⚠️ 톡캘린더 부분 발행 ${r.published}/${r.total}건 (실패 ${r.failed}건). 실패분은 재시도가 필요해요.` }],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: "text",
              text: `✅ 톡캘린더 발행 완료 ${r.published}/${r.total}건. 알바들이 구독 캘린더에서 확인할 수 있어요.`,
            },
          ],
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `❌ 톡캘린더 발행 오류: ${msg}` }], isError: true };
      }
    }
  );
}
