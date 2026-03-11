# Phase Context Template

Template for `.planning/phases/XX-name/{phase_num}-CONTEXT.md` - captures implementation decisions for a phase.

**Purpose:** Document decisions that downstream agents need. Researcher uses this to know WHAT to investigate. Planner uses this to know WHAT choices are locked vs flexible.

**Key principle:** Categories are NOT predefined. They emerge from what was actually discussed for THIS phase. A CLI phase has CLI-relevant sections, a UI phase has UI-relevant sections.

**Downstream consumers:**
- `gsd-phase-researcher` — Reads decisions to focus research (e.g., "card layout" → research card component patterns)
- `gsd-planner` — Reads decisions to create specific tasks (e.g., "infinite scroll" → task includes virtualization)

---

## File Template

```markdown
# Phase [X]: [Name] - Context

**Gathered:** [date]
**Status:** Ready for planning

<domain>
## Phase Boundary

[Clear statement of what this phase delivers — the scope anchor. This comes from ROADMAP.md and is fixed. Discussion clarifies implementation within this boundary.]

</domain>

<auto_decisions>
## Auto-Decided (locked unless overridden)

### [Package 1: e.g., Data Display Strategy]
- **[Decision]**: [One-line reason] — [deep-think factors: e.g., matches conventions (1), industry standard (4)]

### [Package 2: e.g., Security Defaults]
- **[Decision]**: [One-line reason]

</auto_decisions>

<recommendations>
## Accepted Recommendations

### [Topic 1]
- **Recommendation**: [What was recommended]
- **Rationale**: [Project-specific reasoning]
- **Alternatives considered**: [Y] if [condition], [Z] if [condition]
- **Deep-think factors**: [Which factors drove the decision]

### [Topic 2]
...

</recommendations>

<decisions>
## Must-Ask Decisions

### [Area 1 — genuine ambiguity that required user input]
- [Specific decision made]
- [Another decision if applicable]

### [Area 2 — another question only the user could answer]
- [Specific decision made]

</decisions>

<specifics>
## Specific Ideas

[Any particular references, examples, or "I want it like X" moments from discussion. Product references, specific behaviors, interaction patterns.]

[If none: "No specific requirements — open to standard approaches"]

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- [Component/hook/utility]: [How it could be used in this phase]

### Established Patterns
- [Pattern]: [How it constrains/enables this phase]

### Integration Points
- [Where new code connects to existing system]

</code_context>

<deferred>
## Deferred Ideas

[Ideas that came up during discussion but belong in other phases. Captured here so they're not lost, but explicitly out of scope for this phase.]

[If none: "None — discussion stayed within phase scope"]

</deferred>

---

*Phase: XX-name*
*Context gathered: [date]*
```

<good_examples>

**Example 1: Visual feature (Post Feed)**

```markdown
# Phase 3: Post Feed - Context

**Gathered:** 2025-01-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Display posts from followed users in a scrollable feed. Users can view posts and see engagement counts. Creating posts and interactions are separate phases.

</domain>

<auto_decisions>
## Auto-Decided (locked unless overridden)

### Data Display Strategy
- **Card-based layout over timeline/list**: Matches existing component library card patterns (1), industry standard for social feeds (4)
- **Each card shows: author avatar, name, timestamp, full post content, reaction counts**: Covers all required data points without clutter (4)

### Loading UX
- **Loading skeleton while fetching**: Project already uses skeleton components (1), better perceived performance than spinners (4)
- **Pull-to-refresh on mobile**: Standard mobile pattern, expected by users (4)

### Error Handling
- **Toast notification on fetch failure with retry button**: Matches existing error pattern in the app (1), non-blocking (4)
- **Stale data displayed while retrying**: Better UX than blank screen (4)

</auto_decisions>

<recommendations>
## Accepted Recommendations

### Scroll Strategy
- **Recommendation**: Infinite scroll with virtualized list
- **Rationale**: Feed will grow unbounded; virtualization prevents DOM bloat. Project already uses react-window in the notifications panel.
- **Alternatives considered**: Pagination if feed items become very complex (heavy embeds), cursor-based "Load More" button if infinite scroll causes accessibility issues
- **Deep-think factors**: Matches existing patterns (1), industry standard for feeds (4), performance at scale (3)

### New Posts Indicator
- **Recommendation**: "N new posts" banner at top without auto-inserting
- **Rationale**: Preserves scroll position, avoids content-shift frustration. Twitter-style approach the user referenced.
- **Alternatives considered**: Auto-insert if posts are infrequent (< 1/min), badge on tab if feed is not active view
- **Deep-think factors**: User preference from specifics (5), industry proven pattern (4)

</recommendations>

<decisions>
## Must-Ask Decisions

### Empty state behavior
- Friendly illustration + "Follow people to see posts here"
- Suggest 3-5 accounts to follow based on interests
- User chose interest-based suggestions over popularity-based

### Card visual style
- Cards have subtle shadows, rounded corners — modern feel
- User specified "like Linear's issue cards — clean, not cluttered"

</decisions>

<specifics>
## Specific Ideas

- "I like how Twitter shows the new posts indicator without disrupting your scroll position"
- Cards should feel like Linear's issue cards — clean, not cluttered

</specifics>

<deferred>
## Deferred Ideas

- Commenting on posts — Phase 5
- Bookmarking posts — add to backlog

</deferred>

---

*Phase: 03-post-feed*
*Context gathered: 2025-01-20*
```

**Example 2: CLI tool (Database backup)**

```markdown
# Phase 2: Backup Command - Context

**Gathered:** 2025-01-20
**Status:** Ready for planning

<domain>
## Phase Boundary

CLI command to backup database to local file or S3. Supports full and incremental backups. Restore command is a separate phase.

</domain>

<auto_decisions>
## Auto-Decided (locked unless overridden)

### CLI Convention Alignment
- **Short flags for common options (-o, -v, -f), long flags for clarity (--incremental, --compress, --encrypt)**: POSIX convention (4), matches existing CLI commands in project (1)
- **Database connection string as positional arg or --db**: Familiar pg_dump pattern per user reference (5), flexible for scripting (4)

### Safety Defaults
- **Partial backups deleted on failure**: No corrupt files left behind (4), critical for CI pipelines (3)
- **--no-retry flag to fail fast**: CI/scripting use case needs deterministic behavior (3)
- **Exit codes: 0 success, 1 general error, 2 connection error, 3 permission error**: Standard CLI practice (4), enables scripting (3)

### Compression
- **gzip by default, --compress=none to disable**: Most common, widely available (4), good balance of speed vs size (3)

</auto_decisions>

<recommendations>
## Accepted Recommendations

### Output Format Strategy
- **Recommendation**: Default to table format for humans, --json flag for programmatic use
- **Rationale**: CLI tool will be used both interactively and in scripts. Table is readable, JSON is parseable. Consistent with how the project's other CLI commands handle output.
- **Alternatives considered**: JSON-only if tool is primarily for automation, YAML if config files need to reference output
- **Deep-think factors**: Matches existing CLI patterns (1), pg_dump familiarity (5), CI pipeline compatibility (3)

### Retry Behavior
- **Recommendation**: Retry 3 times on network failure with exponential backoff, then fail with clear message
- **Rationale**: S3 uploads are prone to transient failures. 3 retries with backoff handles most transient issues without hanging indefinitely.
- **Alternatives considered**: Configurable retry count via --retries=N if users need fine control, no retries if --no-retry is passed
- **Deep-think factors**: Industry standard for network operations (4), production reliability (3)

</recommendations>

<decisions>
## Must-Ask Decisions

### Verbose behavior
- Verbose mode (-v) shows progress, silent by default
- User wants it to work cleanly in CI pipelines — no interactive prompts, minimal stdout by default

### Encryption approach
- User deferred encryption details — "just make --encrypt work with a passphrase for now"
- No key management system in this phase

</decisions>

<specifics>
## Specific Ideas

- "I want it to feel like pg_dump — familiar to database people"
- Should work in CI pipelines (exit codes, no interactive prompts)

</specifics>

<deferred>
## Deferred Ideas

- Scheduled backups — separate phase
- Backup rotation/retention — add to backlog

</deferred>

---

*Phase: 02-backup-command*
*Context gathered: 2025-01-20*
```

**Example 3: Organization task (Photo library)**

```markdown
# Phase 1: Photo Organization - Context

**Gathered:** 2025-01-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Organize existing photo library into structured folders. Handle duplicates and apply consistent naming. Tagging and search are separate phases.

</domain>

<auto_decisions>
## Auto-Decided (locked unless overridden)

### Naming Convention
- **Format: YYYY-MM-DD_HH-MM-SS_originalname.ext**: ISO-based, sorts chronologically in any file browser (4), preserves original name for searchability (3)
- **Incrementing suffix for name collisions (_1, _2)**: Standard approach, avoids overwrites (4)

### Safety Model
- **Never delete originals — move to review folders**: User explicitly stated "don't delete anything" (5), non-destructive is the only safe default for photo management (4)
- **Log all duplicate decisions for review**: Auditability before permanent action (4)

### File Handling
- **Skip files with no EXIF data into _no-metadata folder**: Safe fallback, user can manually sort later (4)
- **Preserve folder structure in _duplicates mirror**: Easy to find what was deduplicated (3)

</auto_decisions>

<recommendations>
## Accepted Recommendations

### Grouping Strategy
- **Recommendation**: Primary grouping by year, then by month, with event sub-folders detected by time clustering
- **Rationale**: Year/month is universally understood. Time clustering (photos within 2 hours = same event) adds useful structure without requiring manual tagging. Event folders named by date + location if EXIF GPS data is available.
- **Alternatives considered**: Flat year folders if photo volume is low (< 500/year), location-primary grouping if user travels frequently
- **Deep-think factors**: User wants to "find photos by roughly when they were taken" (5), standard photo organization pattern (4)

### Duplicate Detection
- **Recommendation**: Perceptual hash comparison, keep highest resolution version
- **Rationale**: Byte-level comparison misses re-encoded duplicates. Perceptual hashing catches visually identical photos even after compression or minor edits.
- **Alternatives considered**: Byte-level hash if speed is critical, manual review queue if collection has many near-duplicates (burst shots)
- **Deep-think factors**: Industry standard for photo dedup (4), non-destructive with _duplicates folder (5)

</recommendations>

<decisions>
## Must-Ask Decisions

### Event clustering threshold
- Photos within 2 hours = same event
- User chose 2 hours over 1 hour ("sometimes dinner events have gaps")

### Duplicate preference
- Keep highest resolution version (user confirmed over "keep newest")
- Move duplicates to _duplicates folder — do not delete

</decisions>

<specifics>
## Specific Ideas

- "I want to be able to find photos by roughly when they were taken"
- Don't delete anything — worst case, move to a review folder

</specifics>

<deferred>
## Deferred Ideas

- Face detection grouping — future phase
- Cloud sync — out of scope for now

</deferred>

---

*Phase: 01-photo-organization*
*Context gathered: 2025-01-20*
```

</good_examples>

<guidelines>
**This template captures DECISIONS across three tiers for downstream agents.**

The output should answer: "What does the researcher need to investigate? What choices are locked for the planner?"

**Three decision tiers:**

- `auto_decisions` (approx. 70%) — Items the AI decided autonomously with one-line reasons. These are obvious choices driven by project conventions, industry standards, or clear best practices. Locked unless the user explicitly overrides them. Each decision includes the deep-think factors that justified it.
- `recommendations` (approx. 25%) — Items the AI recommended and the user accepted during the discuss phase. These involve real trade-offs worth surfacing but where one option is clearly better for this project. Each includes rationale, alternatives considered, and the deep-think factors that drove the recommendation.
- `decisions` (approx. 5%) — Must-ask items where the user provided input on genuine ambiguities. These are questions only the user could answer — personal preferences, business priorities, subjective trade-offs with no clearly superior option.

All three tiers feed downstream to researcher and planner as locked decisions. The distinction is about how each decision was reached, not its importance.

**Good content (concrete decisions):**
- "Card-based layout, not timeline"
- "Retry 3 times on network failure, then fail"
- "Group by year, then by month"
- "JSON for programmatic use, table for humans"

**Bad content (too vague):**
- "Should feel modern and clean"
- "Good user experience"
- "Fast and responsive"
- "Easy to use"

**After creation:**
- File lives in phase directory: `.planning/phases/XX-name/{phase_num}-CONTEXT.md`
- `gsd-phase-researcher` uses all three tiers to focus investigation
- `gsd-planner` uses all three tiers + research to create executable tasks
- Downstream agents should NOT need to ask the user again about any captured decisions from any tier
</guidelines>
