import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerPing } from "./tools/ping.js";
import { registerGenerateSchedule } from "./tools/generateSchedule.js";
import { registerGetSchedule } from "./tools/getSchedule.js";
import { registerAvailabilityTools } from "./tools/availability.js";
import { registerPublishTool } from "./tools/publish.js";
import { registerStoreTools } from "./tools/store.js";
import { registerAuthTools } from "./tools/auth.js";

// 카카오 로그인 도구(login·my_stores)는 KAKAO_REST_API_KEY가 백엔드에 설정돼야 동작한다.
// 키 미설정 상태에서 노출하면 호출 시 에러만 나므로, 켜질 때까지 숨긴다.
// 켜는 법: 백엔드에 KAKAO_REST_API_KEY 설정 후 MCP에 ENABLE_KAKAO_LOGIN=1
const KAKAO_LOGIN_ENABLED = process.env.ENABLE_KAKAO_LOGIN === "1";

export function createServer(): McpServer {
  const server = new McpServer({ name: "smartshift-mcp", version: "0.1.0" });
  registerPing(server);
  if (KAKAO_LOGIN_ENABLED) registerAuthTools(server);
  registerStoreTools(server);
  registerGenerateSchedule(server);
  registerGetSchedule(server);
  registerAvailabilityTools(server);
  registerPublishTool(server);
  return server;
}
