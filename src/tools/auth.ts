import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { callLogin, callMyStores } from "../clients/smartshift.js";

export function registerAuthTools(server: McpServer): void {
  server.registerTool(
    "login",
    {
      title: "카카오 로그인",
      description:
        "카카오 로그인 링크를 만든다. 사용자가 그 링크에서 로그인하면 화면에 ownerToken이 표시되고, 사용자가 그걸 알려주면 이후 도구 호출에 ownerToken으로 넣는다. 로그인하면 내 가게가 나만 접근 가능해지고(다른 사람 차단), sessionId를 잃어버려도 my_stores로 찾을 수 있다.",
      inputSchema: {},
    },
    async () => {
      try {
        const { url } = await callLogin();
        return {
          content: [
            {
              type: "text",
              text:
                `🔑 아래 링크에서 카카오 로그인해 주세요.\n${url}\n\n` +
                `로그인하면 화면에 코드(ownerToken)가 나옵니다. 그 코드를 저에게 알려주시면 ` +
                `이후 가게는 회원님만 접근할 수 있게 됩니다.`,
            },
          ],
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `❌ 로그인 링크 생성 오류: ${msg}` }], isError: true };
      }
    }
  );

  server.registerTool(
    "my_stores",
    {
      title: "내 가게 목록",
      description:
        "카카오 로그인한 사용자가 만든 가게 목록을 조회한다(sessionId를 잊어버렸을 때 사용). ownerToken 필요.",
      inputSchema: {
        ownerToken: z.string().describe("login 도구로 받은 소유자 토큰"),
      },
    },
    async ({ ownerToken }) => {
      try {
        const stores = await callMyStores(ownerToken);
        if (!stores.length) {
          return {
            content: [
              { type: "text", text: "아직 만든 가게가 없어요. set_store로 가게를 만들어 주세요." },
            ],
          };
        }
        const list = stores
          .map((s) => `• ${s.name} (${s.createdAt})\n  sessionId: ${s.sessionId}`)
          .join("\n");
        return { content: [{ type: "text", text: `🏪 내 가게 ${stores.length}개\n\n${list}` }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `❌ 가게 목록 조회 오류: ${msg}` }], isError: true };
      }
    }
  );
}
