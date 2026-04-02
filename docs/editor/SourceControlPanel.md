# Source Control Panel

## Purpose

Document the Phase 3A review and publish surface that turns git-aware workspace status into a first-class editor mode.

## Responsibilities

- Own the `RailMode = review` surface and keep it separate from browse, runtime, inspector, and footer responsibilities.
- Expose `SourceControlPhase = idle | generating | ready | committing | success` as an explicit state model for review and publish work.
- Show the changed-file summary, review state, generation action, commit message input, and commit CTA without forcing contributors to scan multiple regions.
- End successful commit and publish work on a strong handoff state with an explicit next action.

## Integration Notes

- The footer remains quiet telemetry for git branch, MCP, and audio status; it must not become the primary review or publish surface.
- Inspector `Inspect` and `Code` remain focused on node and graph context; they should not absorb source-control actions.
- Command palette, code generation, and graph save flows remain valid entry points, but Source Control owns the review and commit framing once the contributor enters publish work.
- Top-bar outcome chips can reflect `success` or `next` states after a review action resolves, but the source-control surface remains the owner of the flow.

## Failure Modes

- If review and publish status live only in the footer, contributors have no actionable Phase 3A workflow.
- If generation or commit actions start without progress framing, the surface feels untrustworthy during long-running work.
- If the success state lacks a next action, the flow ends abruptly and undermines the Phase 3A handoff pattern.

## Example

- Open `Review` from the activity rail to inspect changed files and the next useful action.
- Trigger a generation step and keep the ready state visible until the contributor is able to review the result.
- Enter a commit message, run the commit action, and land on a success state that points to the next publish or handoff action.

## Test Coverage

- The review surface prioritizes one dominant next action from the current changed state.
- Generate and review preparation states acknowledge progress immediately.
- Commit controls stay explicit before the write begins.
- Success states summarize the outcome and offer a clean next action.
