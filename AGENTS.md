# finishment-web - repo working context (Layer 2)

This repo is part of Richard's _ops workspace. Control root: C:\dev\_ops
(works whether you opened C:\dev or this repo directly).

Purpose: B2B dealer ordering portal - dealer registration/login, order placement with images, admin management of dealers/orders

## Boundaries - keep this repo safe to hand to client/team
- NO internal or commercial notes here: deal economics, pricing, sales/MEDDPICC
  commentary, partner or cross-project coordination. Those live in
  C:\dev\_ops\projects\finishment-web.md, NOT in this repo.
- No secrets in any file. Use .env (gitignored). See C:\dev\_ops\gates\secrets.md.
- Firewalled domains: see C:\dev\_ops\FIREWALL.md - applies here too.
- Before writing anything here, ask: safe for the client/team to read? If no,
  it belongs in C:\dev\_ops\projects\finishment-web.md.

## Where things are
- docs/architecture.md  - how it's built
- docs/runbook.md       - build / run / deploy / test
- docs/decisions/       - ADRs (NNNN-title.md) for consequential choices
- docs/inbox.md         - quick capture; promote out during handoff

## Continuity
- pickup gate:  C:\dev\_ops\gates\pickup.md   (/pickup in Claude Code)
- handoff gate: C:\dev\_ops\gates\handoff.md  (/handoff in Claude Code)
- durable memory: C:\dev\_ops\memory\

## Working pattern
- git status before changes; diagnose with file+line refs; multi-file fixes ->
  a single Cursor prompt.
