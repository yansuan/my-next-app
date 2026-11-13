import { NextResponse } from "next/server";

const AGENTS_MD = `# ReelMux Agent & MCP Guide (https://reelmux.com)

ReelMux gives AI coding agents (Claude Code, Codex, Cursor, Windsurf) and automated workflows unified access to 73+ video, image, and audio generation models with a single credit balance.

## 1. Connect via MCP Server

- **MCP Endpoint**: \`https://reelmux.com/api/mcp\`
- **REST API Base**: \`https://reelmux.com/api\`

### Quick Install
\`\`\`bash
# Claude Code
claude mcp add reelmux https://reelmux.com/api/mcp

# Codex CLI
codex mcp add reelmux https://reelmux.com/api/mcp
\`\`\`

### mcpServers JSON (Cursor / Windsurf / Claude Desktop)
\`\`\`json
{
  "mcpServers": {
    "reelmux": {
      "url": "https://reelmux.com/api/mcp"
    }
  }
}
\`\`\`

## 2. Authentication & Scopes
- **Read-Only Discovery & Price Estimation (No API Key Needed)**:
  - \`list_models\`
  - \`get_model\`
  - \`estimate_generation\`
- **Generation & Polling (API Key Required: \`Authorization: Bearer rmx_live_...\`)**:
  - \`create_generation\` (requires \`generation:create\` scope)
  - \`get_generation\` (requires \`generation:read\` scope)
  - \`list_generations\` (requires \`generation:read\` scope)

## 3. Recommended Agent Workflow
1. Call \`list_models\` or \`get_model\` to pick the best model for the user's request.
2. Call \`estimate_generation\` to compute the exact credit cost before running the job.
3. Confirm the credit cost with the user if it exceeds their threshold.
4. Call \`create_generation\` and poll \`get_generation\` until \`status === "succeeded"\`.
`;

export async function GET() {
  return new NextResponse(AGENTS_MD, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
