---
title: "Nx MCP Server — AI Integration for Nx Workspaces"
source:
  - url: "https://nx.dev/docs/reference/nx-mcp"
    title: "Nx MCP Server Reference"
  - url: "https://nx.dev/docs/getting-started/ai-setup"
    title: "Integrate Nx with your Coding Assistant"
  - url: "https://nx.dev/docs/features/enhance-ai"
    title: "Enhance Your AI Coding Agent"
  - url: "https://nx.dev/blog/nx-made-cursor-smarter"
    title: "Making Cursor Smarter with MCP"
  - url: "https://nx.dev/blog/nx-mcp-vscode-copilot"
    title: "Nx MCP for VS Code Copilot"
  - url: "https://nx.dev/blog/why-we-deleted-most-of-our-mcp-tools"
    title: "Why We Deleted Most of Our MCP Tools"
created: 2026-02-21
updated: 2026-02-21
status: draft
tags: [nx, mcp, ai, cursor, vscode, copilot]
---

# Nx MCP Server

## Overview

The Nx MCP Server implements the [Model Context Protocol](https://modelcontextprotocol.io/) to connect AI coding agents with Nx workspace context, Nx Cloud CI pipelines, self-healing fixes, running processes, and Nx documentation. It complements agent skills — where skills provide domain knowledge about how to work with Nx monorepos, the MCP server provides the connectivity layer to resources agents cannot independently access. As of Nx 22, the server ships with a curated minimal toolset by default, delegating workspace exploration and code generation to agent skills.

## What is Nx MCP

The Nx MCP Server is a local server that exposes Nx workspace metadata and Nx Cloud services to AI agents through the standardized Model Context Protocol, originally pioneered by Anthropic. It communicates via stdio (default), SSE, or HTTP transports and is bundled with the Nx CLI as of Nx 21.4.

The server fills a specific niche: it provides access to data agents cannot obtain on their own, such as:

- Authenticated Nx Cloud API data (CI pipeline status, analytics, self-healing fixes)
- Live output from running Nx TUI processes
- Nx documentation retrieval
- Interactive project graph visualization

Agents can run `nx show project myapp` in a terminal and parse the output directly. The MCP server is reserved for connectivity to services that require authentication tokens or live process communication.

## Setup

### Automated Setup (Recommended)

The fastest way to configure AI integration in any Nx workspace:

```bash
npx nx configure-ai-agents
```

This command installs the Nx MCP server, generates AI agent configuration files (`CLAUDE.md`, `AGENTS.md`), and deploys agent skills for workspace exploration, code generation, task execution, and CI monitoring.

### Nx Console (Auto-managed)

When using VS Code or Cursor, install the **Nx Console** extension. Nx Console automatically detects the workspace and prompts you to enable the MCP server. Accepting the prompt writes the configuration to the appropriate file (`.vscode/mcp.json` or `.cursor/mcp.json`) and manages the server lifecycle. Nx Console also detects whether the client supports agent skills and adjusts the MCP configuration accordingly (setting `--minimal` or `--no-minimal` as needed).

### Manual Setup — Nx 21.4 and Later (includes Nx 22)

```json
{
  "mcpServers": {
    "nx": {
      "command": "npx",
      "args": ["nx", "mcp"]
    }
  }
}
```

### Manual Setup — Older Versions (Nx < 21.4)

```json
{
  "mcpServers": {
    "nx": {
      "command": "npx",
      "args": ["nx-mcp@latest"]
    }
  }
}
```

### Skills-Only Installation

To add Nx agent skills without the full AI agent setup:

```bash
npx skills add nrwl/nx-ai-agents-config
```

## Available Tools

### Default Tools (Minimal Mode)

These tools are available in the default `--minimal` configuration:

| Tool | Description |
|------|-------------|
| `nx_docs` | Retrieves relevant Nx documentation based on a query; prevents hallucination on config syntax |
| `ci_information` | Fetches CI pipeline status and failure details from Nx Cloud |
| `update_self_healing_fix` | Applies or rejects an AI-suggested fix for a CI failure |
| `nx_current_running_tasks_details` | Lists active processes in the Nx TUI |
| `nx_current_running_task_output` | Returns terminal output for a running task |
| `nx_visualize_graph` | Opens an interactive project or task graph in the browser |

### Nx Cloud Analytics Tools

Available when the workspace is connected to Nx Cloud:

| Tool | Description |
|------|-------------|
| `cloud_analytics_pipeline_executions_search` | Search pipeline execution history |
| `cloud_analytics_pipeline_execution_details` | Details for a specific pipeline execution |
| `cloud_analytics_runs_search` | Search task run history |
| `cloud_analytics_run_details` | Details for a specific task run |
| `cloud_analytics_tasks_search` | Search tasks across executions |
| `cloud_analytics_task_executions_search` | Search individual task execution records |

### Extended Tools (`--no-minimal` only)

These tools are hidden in minimal mode because agent skills handle them more efficiently. Re-enable them for clients that do not support agent skills:

| Tool | Description |
|------|-------------|
| `nx_workspace` | Full annotated Nx configuration and project graph |
| `nx_workspace_path` | Returns the workspace root path |
| `nx_project_details` | Comprehensive configuration for a specific project (targets, tags, dependencies) |
| `nx_available_plugins` | Lists installed and available Nx plugins |
| `nx_generators` | Lists available code generators |
| `nx_generator_schema` | Detailed schema for a specific generator |
| `nx_run_generator` | Executes a generator with provided options |

## Minimal Mode

By default, the Nx MCP server runs with `--minimal` enabled. This hides workspace analysis and generator tools, reducing token overhead and context pollution. Agents that support Nx agent skills use those skills instead to explore the workspace and invoke generators — the skills load incrementally only when the agent determines they are relevant, rather than occupying fixed tool slots for every interaction.

When an agent can run `nx show project myapp` in a terminal and parse the output itself, an MCP tool wrapping the same data is redundant and costly. Minimal mode reflects this philosophy.

To enable all tools for a client that does not support agent skills:

```bash
npx nx mcp --no-minimal
```

In `.mcp.json`:

```json
{
  "mcpServers": {
    "nx": {
      "command": "npx",
      "args": ["nx", "mcp", "--no-minimal"]
    }
  }
}
```

Nx Console sets this flag automatically based on detected client capabilities.

## Agent Skills vs. MCP

Understanding the distinction prevents misconfiguration:

| | Agent Skills | MCP Tools |
|---|---|---|
| **What they are** | Domain-specific instructions / knowledge modules | Callable tools that return data or perform actions |
| **How they load** | Incrementally, only when the agent recognizes relevance | Listed in the tool manifest; always consume context slots |
| **Token cost** | Low — instruction text only | Higher — tool invocation + response payload |
| **What they handle** | Workspace exploration, code generation patterns, task execution | Nx Cloud CI, authenticated APIs, running processes, docs |
| **Example** | Teach agent how to use `nx show affected` | Fetch live CI pipeline status from Nx Cloud |

The guiding principle from Nx: **"skills for knowledge, MCP for connectivity."**

MCP tools are justified only when authentication, live streaming data, or external service access is required. Everything else belongs in skills.

## Editor Integration

### Cursor

1. Install **Nx Console** from the Cursor extension marketplace.
2. Accept the MCP configuration notification when it appears.
3. Enable the server in Cursor settings.

Nx Console auto-generates `.cursor/mcp.json`. The server communicates over SSE on a random localhost port managed by the Nx Language Server (`nxls`). Practical use cases demonstrated in the Cursor integration include impact analysis (which projects are affected by API changes), code generation with Nx scaffolding, and configuration management with release tooling.

### VS Code Copilot

1. Install **Nx Console** from the VS Code marketplace.
2. Accept the notification: "Improve Copilot agent with Nx-specific context."
3. Configuration is written automatically to `.vscode/mcp.json`.

If the notification was dismissed, run `nx.configureMcpServer` from the command palette (Ctrl/Cmd + Shift + P). VS Code starts the MCP server automatically when Copilot initiates an LLM interaction. Installed tools are visible in VS Code settings under the Nx MCP server entry.

### Claude Code

Claude Code receives Nx agent skills via a plugin installed during `configure-ai-agents`. Skills are embedded in `CLAUDE.md`. For MCP connectivity, add the server to `.mcp.json` in the project root:

```json
{
  "mcpServers": {
    "nx": {
      "command": "npx",
      "args": ["nx", "mcp"]
    }
  }
}
```

Or use the CLI shortcut:

```bash
claude mcp add nx -- npx nx mcp
```

### Other MCP Clients (JetBrains, Windsurf, Cline, Claude Desktop)

Any MCP-compatible client connects using the `stdio` transport with the same `npx nx mcp` command. For SSE or HTTP transports, pass `--transport sse` or `--transport http` and optionally `--port <port>`.

## Configuration Reference

### CLI Flags

| Flag | Default | Description |
|------|---------|-------------|
| `[workspacePath]` / `-w` | Current directory | Workspace root path |
| `--transport` | `stdio` | Transport protocol: `stdio`, `sse`, or `http` |
| `--port` / `-p` | `9921` | Server port (SSE and HTTP transports) |
| `--tools` / `-t` | (all) | Glob patterns to filter which tools are enabled |
| `--minimal` | `true` | Hide workspace analysis and generator tools |
| `--no-minimal` | — | Expose all tools including workspace analysis |
| `--disableTelemetry` | `false` | Disable usage telemetry |
| `--debugLogs` | `false` | Enable verbose debug output |

### Transport Selection

- **`stdio`** — Default. Single client connection. Suitable for most IDE integrations where the client spawns the server as a child process.
- **`sse`** — Server-Sent Events. Used by Cursor's Nx Console integration (localhost port).
- **`http`** — HTTP streaming. Supports concurrent client connections; useful for shared or remote setups.

### Tool Filtering

Use `--tools` with glob patterns to expose only a specific subset of tools:

```bash
npx nx mcp --tools "nx_docs,ci_*"
```

This restricts the server to `nx_docs` and all tools matching `ci_*`, useful for limiting agent capabilities in controlled environments.

## Nx Cloud Integration and Self-Healing CI

The `ci_information` and `update_self_healing_fix` tools require workspace connection to Nx Cloud. They enable autonomous Self-Healing CI workflows:

1. A CI pipeline fails
2. Nx Cloud analyzes the failure and proposes a fix
3. The AI agent retrieves failure context via `ci_information`
4. The agent applies or rejects the fix with `update_self_healing_fix`
5. The pipeline reruns automatically

This allows AI agents to push code, monitor CI, receive failures, apply fixes, and iterate until CI passes — without human intervention at each failure point.
