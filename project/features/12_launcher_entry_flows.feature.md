# 12 Launcher Entry Flows

## Feature

Describe how the Phase 3A launcher helps contributors reopen work, start from templates, import existing material, recover legacy state, and resume interrupted tasks.

### F12-S01 Recent work, search, and open actions preserve immediate orientation

**User Story** As a contributor, I want recent-work rows and project search to make the next project obvious so I can reopen work without rebuilding context.
**Future Test Layer** `e2e` via `playwright`
**UX Laws** `Jakob's Law`, `Selective Attention`

**Given** the launcher shows one or more projects in the `Recent` section
**When** the contributor searches, scans metadata, or opens a project
**Then** the primary next workspace remains obvious and the open action preserves orientation

### F12-S02 Templates, import, and recover stay first-class entry actions

**User Story** As a contributor, I want templates, import, and recovery to have dedicated entry ownership so I can start from the right path without hunting through the workspace.
**Future Test Layer** `e2e` via `playwright`
**UX Laws** `Hick's Law`, `Postel's Law`

**Given** the contributor needs to start from a template, import existing work, or recover legacy state
**When** they switch between `Templates`, `Import`, and `Recover`
**Then** each section exposes one clear primary action and keeps the next consequence explicit

### F12-S03 Interrupted-work resume stays visible at product entry

**User Story** As a contributor, I want interrupted work to be visible before I reopen the workspace so I can resume the right task immediately.
**Future Test Layer** `e2e` via `playwright`
**UX Laws** `Zeigarnik Effect`, `Goal-Gradient Effect`

**Given** a project contains unfinished repair, review, or generation work
**When** the contributor returns to the launcher
**Then** the launcher surfaces the unfinished state through recent-work and resume affordances instead of forcing a fresh search
