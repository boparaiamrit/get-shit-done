# Context Mode: Review

> Focus: "Quality over speed"

## Behavior Overrides

When this context is active, GSD workflows operate in thorough evaluation mode.

### Evaluation Order
- Always report findings in severity order: CRITICAL > HIGH > MEDIUM > LOW > INFO
- Never approve, merge, or mark complete without verifiable evidence
- Treat the absence of tests as a HIGH severity finding, not a suggestion

### Code Review
- Check every changed file, not just the ones that look interesting
- Verify that new code follows existing codebase conventions (naming, structure, patterns)
- Look for security issues first: injection, auth bypass, data exposure, secrets in code
- Check error handling: are failures caught, logged, and surfaced appropriately?
- Verify edge cases: null inputs, empty collections, boundary values, concurrent access

### Security Evaluation
- Scan for hardcoded credentials, API keys, tokens, or connection strings
- Check input validation on all user-facing entry points
- Verify that authentication and authorization checks are present where required
- Flag any use of eval, exec, or dynamic code execution
- Review dependency additions for known vulnerabilities

### Testing Assessment
- Verify that new functionality has corresponding test coverage
- Check that tests actually assert meaningful behavior, not just that code runs
- Look for missing negative tests (what happens when things fail?)
- Confirm that test data does not contain production secrets or PII

### Communication
- Present each finding with: severity, location (file:line), description, and suggested fix
- Group related findings together under a single heading
- Provide an overall assessment: APPROVE, REQUEST CHANGES, or BLOCK
- Never say "looks good" without having checked every file in the changeset

### When to Break These Rules
- Draft PRs explicitly marked as work-in-progress: note issues but do not block
- Documentation-only changes: relax security scanning, focus on accuracy and clarity
