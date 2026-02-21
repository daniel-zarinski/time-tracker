---
title: "shadcn/ui MCP Server: AI-Assisted Component Installation"
source:
  - url: "https://ui.shadcn.com/docs/mcp"
    title: "shadcn/ui MCP Server"
  - url: "https://ui.shadcn.com/docs/registry/mcp"
    title: "Registry MCP Integration"
created: 2026-02-21
updated: 2026-02-21
status: draft
tags: [shadcn-ui, mcp, ai, claude-code, components, registry]
---

# shadcn/ui MCP Server

## Overview

The shadcn MCP (Model Context Protocol) server bridges AI assistants with component registries and the shadcn CLI, allowing tools like Claude Code to browse, search, and install components through natural language. Instead of manually running CLI commands, you describe what you need in plain English and the AI assistant handles the rest. This is especially useful in Claude Code workflows where you can install entire UI flows in a single prompt.

## What the MCP Server Does

The server exposes three core capabilities to any connected AI assistant:

- **Browse components** — List all available components, blocks, and templates from any configured registry
- **Search across registries** — Find specific components by name or functionality across multiple sources
- **Install with natural language** — Add components using conversational prompts like "add a login form" or "install the button, dialog, and card components"

The workflow is: you describe your need in natural language, the assistant translates it into registry commands, and the shadcn CLI fetches and installs the resources into your project.

## Setup for Claude Code

Claude Code uses a `.mcp.json` file at the project root to discover MCP servers. Add the following to enable the shadcn MCP server:

```json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    }
  }
}
```

No global install is required — `npx` fetches the latest version on demand.

To initialise the config automatically using the CLI, run:

```bash
pnpm dlx shadcn@latest mcp init --client claude
```

This writes the correct configuration for the Claude client.

## Setup for Other AI Tools

### Cursor

Create or update `.cursor/mcp.json` with the same structure as above, then enable the shadcn server in Cursor Settings.

```json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    }
  }
}
```

### VS Code

Add to `.vscode/mcp.json`, then click "Start" next to the shadcn server in the VS Code MCP panel.

### Codex

Manually add to `~/.codex/config.toml`:

```toml
[mcp_servers.shadcn]
command = "npx"
args = ["shadcn@latest", "mcp"]
```

## Configuring Multiple Registries

The MCP server reads registry configuration from `components.json`. You can point it at any number of registries — including private ones with authentication:

```json
{
  "registries": {
    "@acme": "https://registry.acme.com/{name}.json",
    "@internal": {
      "url": "https://internal.company.com/{name}.json",
      "headers": {
        "Authorization": "Bearer ${REGISTRY_TOKEN}"
      }
    }
  }
}
```

The `{name}` placeholder is replaced with the component name at request time. Environment variables in `headers` values (e.g., `${REGISTRY_TOKEN}`) are expanded from the shell environment or from `.env.local`.

### Authentication for Private Registries

Store tokens in `.env.local` (never commit this file):

```bash
REGISTRY_TOKEN=your_token_here
API_KEY=your_api_key_here
```

## Example Prompts

Once the MCP server is active in Claude Code, you can use natural language requests like:

- "Show me all available components in the shadcn registry"
- "Add the button, dialog, and card components to my project"
- "Create a contact form using components from the shadcn registry"
- "Install @internal/auth-form"
- "What blocks are available for dashboard layouts?"

## Registry MCP Integration

Any shadcn-compatible registry works with the MCP server automatically — registry owners do not need to do anything special to enable MCP support.

### Registry Index File Requirement

The one structural requirement is that your registry must expose an index file at its root named `registry`. For example, if your registry serves items at `https://acme.com/r/[name].json`, the index must be reachable at:

```
https://acme.com/r/registry.json
```

The MCP server fetches this index to enumerate available items for browsing and search.

### Best Practices for MCP-Compatible Registries

If you are building a custom registry intended to work well with AI tooling:

1. **Write clear descriptions** — Add concise, informative descriptions to each registry item so AI assistants can understand what it does without inspecting the code.
2. **List all dependencies accurately** — Declare every npm dependency so the MCP server can install them automatically.
3. **Use `registryDependencies`** — Declare relationships between registry items so dependent items are installed together.
4. **Use kebab-case naming** — Consistent naming across all items makes natural language matching more reliable.

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| MCP server not responding | Misconfigured `.mcp.json` | Verify JSON syntax and restart the AI client |
| Registry access errors | Wrong URL or missing auth | Check the URL template in `components.json` and confirm env vars are set |
| Installation failures | Invalid `components.json` | Run `pnpm dlx shadcn@latest init` to regenerate the config |
| Components not found | Registry index missing | Ensure `registry.json` exists at the registry root |

## How This Fits the Workflow

In this project, `components.json` is already configured (see [setup-and-configuration.md](setup-and-configuration.md)). Adding the `.mcp.json` entry above is all that is needed to activate the MCP server in Claude Code. After that, component installation can be driven entirely through natural language prompts rather than CLI commands.
