import express from "express";
import { randomUUID } from "node:crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { createServer } from "./server.js";

export function createApp(): express.Express {
  const app = express();
  app.use(express.json());

  const transports: Record<string, StreamableHTTPServerTransport> = {};

  app.post("/mcp", async (req, res) => {
    const rawSid = req.headers["mcp-session-id"];
    const sid = Array.isArray(rawSid) ? rawSid[0] : rawSid;
    let transport = sid ? transports[sid] : undefined;

    if (!transport && isInitializeRequest(req.body)) {
      const newTransport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (id) => { transports[id] = newTransport; },
      });
      newTransport.onclose = () => {
        if (newTransport.sessionId) delete transports[newTransport.sessionId];
      };
      await createServer().connect(newTransport);
      transport = newTransport;
    }

    if (!transport) {
      res.status(400).json({
        jsonrpc: "2.0",
        error: { code: -32000, message: "No valid session" },
        id: null,
      });
      return;
    }
    await transport.handleRequest(req, res, req.body);
  });

  const sessionRoute = async (req: express.Request, res: express.Response) => {
    const rawSid = req.headers["mcp-session-id"];
    const sid = Array.isArray(rawSid) ? rawSid[0] : rawSid;
    const transport = sid ? transports[sid] : undefined;
    if (!transport) { res.status(400).send("No valid session"); return; }
    await transport.handleRequest(req, res);
  };
  app.get("/mcp", sessionRoute);
  app.delete("/mcp", sessionRoute);

  return app;
}
