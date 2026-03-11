# Context Mode: Research

> Focus: "Read widely before concluding"

## Behavior Overrides

When this context is active, GSD workflows operate in deep-investigation mode.

### Planning Phase
- Extend research phases: read source code, docs, and related issues before proposing a plan
- Explore at least two alternative approaches before committing to one
- Document trade-offs explicitly in the plan (performance, complexity, maintainability)
- Ask clarifying questions liberally -- surface hidden assumptions early

### Execution Phase
- Prototype alternatives in isolated branches or scratch files before choosing
- Add inline comments explaining why a particular approach was selected
- When integrating a library or API, read its source or docs first -- do not rely on name inference
- Capture research findings in CONTEXT.md so future sessions have the rationale

### Communication
- Present findings with evidence: code snippets, benchmark numbers, doc references
- When uncertain, say so explicitly and outline what additional research would resolve it
- Summarize key decisions and their rationale at the end of each phase
- Flag areas where the codebase contradicts documentation or conventions

### Verification
- Validate assumptions against actual behavior (run the code, read the output)
- Cross-reference implementation against the original requirements document
- Check edge cases identified during research, not just the happy path

### Documentation
- Update CONTEXT.md with research findings, rejected alternatives, and decision rationale
- Add links to relevant external resources (docs, issues, RFCs) in plan files
- Write ADR-style (Architecture Decision Record) notes for significant choices

### When to Break These Rules
- Trivial changes (typos, formatting): skip research, just fix and commit
- Time-critical hotfixes: switch to dev mode, research after the fix is deployed
