# 10 Asset Library Actions

## Feature

Describe how contributors search, preview, import, relink, and recover assets through the left-drawer Asset Library.

### F10-S01 Asset search and filtering reduce the visible decision set

**User Story** As a contributor, I want search and filtering to reduce noise so I can find the right asset quickly in a large library.
**Future Test Layer** `e2e` via `playwright`
**UX Laws** `Hick's Law`, `Selective Attention`

**Given** the Asset Library is opened from the left drawer and contains multiple asset types and many files
**When** the contributor searches or filters the list
**Then** the result set narrows predictably and keeps the next likely action obvious

### F10-S02 Asset preview and relink flows recover from imperfect input gracefully

**User Story** As a contributor, I want import and relink flows to tolerate imperfect input so I can recover without restarting the task.
**Future Test Layer** `e2e` via `playwright`
**UX Laws** `Postel's Law`, `Doherty Threshold`

**Given** the contributor enters an incomplete file name, path, or relink hint
**When** the Asset Library attempts to resolve the target asset
**Then** the UI proposes useful matches, preserves intent, and guides recovery instead of failing hard

### F10-S03 Missing asset repair ends on a clear and satisfying recovery state

**User Story** As a contributor, I want missing-asset repair to end clearly so I know the broken reference was actually resolved.
**Future Test Layer** `e2e` via `playwright`
**UX Laws** `Peak-End Rule`, `Von Restorff Effect`

**Given** an asset is missing and the contributor completes the repair flow
**When** the relink or replacement succeeds
**Then** the library removes the error emphasis, confirms the fix, and restores the expected preview state
