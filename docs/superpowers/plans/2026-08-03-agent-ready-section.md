# Agent-Ready Section Implementation Plan

> **For agentic workers:** Execute task-by-task. Steps use checkbox syntax.

**Goal:** Replace the middle landing slot with a quiet agent-ready checklist + copyable prompt.

**Architecture:** Content constants + prompt copy panel + section shell. Wire into landing; stop mounting ManifestoMorphSection.

**Tech Stack:** React, TypeScript, Tailwind, lucide-react, existing `cn` / copy patterns from `CommandSnippet`.

**Spec:** `docs/superpowers/specs/2026-08-03-agent-ready-section-design.md`

---

### Task 1: Content + section + wiring

- Create `components/landing/agent-ready/*`
- Modify `app/landing-content.tsx`, `components/landing/index.ts`
- Commit on `feat/premium-ecosystem-redesign`
