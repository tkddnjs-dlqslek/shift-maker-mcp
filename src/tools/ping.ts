import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPing(server: McpServer): void {
  server.registerTool(
    "ping",
    {
      title: "Ping",
      description: "연결 확인용. 보낸 메시지를 pong과 함께 돌려준다.",
      inputSchema: { message: z.string().optional() },
    },
    async ({ message }) => ({
      content: [{ type: "text", text: `pong: ${message ?? "(empty)"}` }],
    })
  );
}
