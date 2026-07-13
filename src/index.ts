import { createApp } from "./http.js";

const port = Number(process.env.PORT ?? 3000);
createApp().listen(port, () => {
  console.log(`smartshift-mcp listening on :${port}/mcp`);
});
