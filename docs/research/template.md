# Research Documentation Template

This template defines the standard format for all research docs in `docs/research/<package-name>/`.

## Folder Structure

```
docs/research/
├── template.md                  # This file (standards reference)
└── <package-name>/              # One folder per package (kebab-case)
    ├── _index.md                # LLM-friendly entry point — read first
    ├── examples.md              # Focused topic file
    ├── best-practices.md        # Focused topic file
    └── <topic>.md               # Additional topic files as needed
```

## YAML Frontmatter Schema

Every research file must start with this frontmatter:

```yaml
---
title: "<Descriptive title>"
source:
  - url: "<URL where information was retrieved>"
    title: "<Page/doc title>"
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: draft | reviewed | outdated
tags: [<relevant>, <tags>]
---
```

## Document Type 1: `_index.md`

Each package folder has exactly one `_index.md`. This is the entry point — read it first to understand the folder before loading individual files.

The `_index.md` is not just a table of contents. It should **connect the topic files together** by explaining how they relate, what order to read them in (if applicable), and how the package's concepts build on each other. Think of it as a narrative guide to the folder.

The `source` array can be empty if the index is an original summary.

### Required Sections

```markdown
<!-- Frontmatter: use schema above. source can be empty for index files. -->

# <Package Name>

## Overview

What the package is, why we use it, and which version we target.

## How It All Fits Together

Narrative explanation of how the topics in this folder relate to each other.
Call out key relationships, dependencies, and workflows:

- If the package has plugins/extensions, name them and explain how they
  integrate (e.g., "nx-electron is an Nx plugin that adds Electron targets
  to an Nx workspace — see [nx-electron.md](nx-electron.md) for details").
- If there's a sequence or flow to follow, describe it here
  (e.g., "First configure the workspace (setup.md), then generate an app
  (generators.md), then customize the build (build-config.md)").
- If topics depend on each other, make that explicit
  (e.g., "IPC patterns (ipc.md) rely on the preload script covered in
  security.md").

This section turns a flat list of files into a connected knowledge base.

## Key Concepts

- Concept one — brief explanation
- Concept two — brief explanation
- Concept three — brief explanation

## File Index

| File | Description | Depends On |
|------|-------------|------------|
| [setup.md](setup.md) | Initial workspace configuration | — |
| [generators.md](generators.md) | Code generation and scaffolding | setup.md |
| [build-config.md](build-config.md) | Build pipeline customization | generators.md |
```

### Guidelines for `_index.md`

- **Explain relationships, not just list files.** The "How It All Fits Together" section is the most important part — it's what makes the index useful beyond a directory listing.
- **Call out plugins, extensions, and ecosystem packages** that relate to the main package and where they're documented.
- **Describe workflows and sequences** if the package has a natural order of operations (setup -> config -> usage -> deployment).
- **Cross-reference other package folders** when concepts span packages (e.g., "For Electron IPC security, also see `docs/research/electron/security.md`").
- **Keep it high-level.** Details belong in topic files — the index should give just enough context to know what to read and in what order.

## Document Type 2: Topic Files

Each topic file covers a single, focused concept area (e.g., `storage.md`, `examples.md`).

### Required Sections

```markdown
<!-- Frontmatter: use schema above. -->

# <Topic Title>

## Overview

Brief intro to the topic (2-3 sentences). Establishes context and scope.

## <Subtopic A>

Content organized under `##` headers, each covering a distinct subtopic.
Every claim should be traceable to a URL in the frontmatter `source` array.

## <Subtopic B>

Additional subtopics as needed.
```

## Rules

1. **Prefer splitting over long files** — Files can be up to ~1000 lines, but splitting into focused files is often better for readability and reuse.
2. **One focused topic per file** — File name must be descriptive (e.g., `storage.md` not `misc.md`).
3. **Every file needs sources** — `source` array in frontmatter with URL and title for each reference.
4. **Dates are mandatory** — `created` set once, `updated` changed on every edit.
5. **Status tracking** — `draft` (initial write), `reviewed` (verified accurate), `outdated` (needs refresh).
6. **No duplicate content** — If two packages share a concept, pick one location and cross-reference.
7. **Code examples use fenced blocks** with language identifier (` ```typescript `, ` ```bash `, etc.).
8. **Folder structure** — `docs/research/<package-name>/` with kebab-case folder and file names.
