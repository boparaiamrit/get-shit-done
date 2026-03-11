<purpose>
Scan application code and GSD configuration files for security vulnerabilities. Produces a structured report with severity-classified findings and actionable remediation steps.

Three modes: `code` scans application source for common vulnerability patterns, `config` scans GSD workflow/agent/template files for prompt injection and unsafe configurations, `full` runs both scans.
</purpose>

<core_principle>
**Find real vulnerabilities, not noise.** Every finding must include the exact file, line, and code snippet. Every finding must include a specific fix — not just "fix this." False positives erode trust faster than missed findings. When in doubt, classify as LOW with explanation rather than inflating severity.
</core_principle>

<process>

<step name="initialize" priority="first">
Load project context and resolve scan mode:

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" state load)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

Parse $ARGUMENTS for scan mode:
- If `code` — code scan only
- If `config` — config scan only
- If `full` or empty — both scans

```bash
mkdir -p .planning
```

Initialize findings counter and report structure.
</step>

<step name="code_scan">
**Skip if mode is `config` only.**

Scan application source code for vulnerability patterns. Use Grep and Read tools — do NOT run application code.

**1. Hardcoded Secrets**

Search for patterns indicating embedded credentials:
- API keys, tokens, passwords assigned to string literals in source files
- Cloud provider credential patterns (AWS AKIA keys, GCP AIza keys, Azure connection strings)
- `.env` files committed to the repository (check `git ls-files`)

**Severity:** CRITICAL for production credentials, HIGH for development keys in source

**2. SQL Injection**

Search for string concatenation or template literal interpolation inside database query calls:
- Raw query methods with string concatenation
- ORM raw/execute methods with interpolated variables
- Stored procedure calls with unsanitized parameters

**Severity:** CRITICAL if user input reaches query, HIGH if internal data only

**3. XSS Vectors**

Search for unsafe HTML rendering patterns:
- `innerHTML` assignments
- `dangerouslySetInnerHTML` in React
- `v-html` in Vue
- `document.write()` calls
- jQuery `.html()` with dynamic content

**Severity:** HIGH if rendering user content, MEDIUM if rendering trusted content

**4. Unsafe Code Execution**

Search for dynamic code execution patterns:
- `eval()` calls with variable arguments
- `new Function()` constructor
- `child_process` usage with string commands (shell injection risk)
- `subprocess` calls with `shell=True`

**Severity:** CRITICAL if user input reaches the execution, HIGH if controlled input, MEDIUM if hardcoded

**5. Unsafe Deserialization**

Search for deserialization of untrusted data:
- `JSON.parse()` on raw request body without validation
- `pickle.loads()` in Python
- `yaml.load()` without SafeLoader
- PHP `unserialize()` on user input

**Severity:** HIGH if deserializing external input

**6. Path Traversal**

Search for file operations with user-controlled paths:
- File read/write functions receiving request parameters
- Path join operations with user input without sanitization
- Directory listing with user-controlled base path

**Severity:** HIGH if user controls file path

**7. Missing Authentication/Authorization**

Scan route/endpoint definitions for missing auth middleware:
- Express routes without auth middleware
- FastAPI endpoints without dependency injection for auth
- Django views without `@login_required` or permission decorators

**Severity:** HIGH for data-modifying endpoints, MEDIUM for read-only

**Verification:** For each potential finding, READ the actual file to verify it is a real vulnerability (not a false positive). Check for:
- Sanitization/validation nearby
- Parameterized queries wrapping the concatenation
- Auth middleware applied at router level
- Test files (reduce severity or exclude)
</step>

<step name="config_scan">
**Skip if mode is `code` only.**

Scan GSD configuration files for security issues.

**1. Prompt Injection in Workflows/Agents**

Read all workflow and agent files. For each file, check for:
- User input (`$ARGUMENTS`, user responses) inserted directly into prompts without sanitization
- Instructions that could be overridden by user-controlled content
- System prompt leakage patterns (files that expose internal instructions)

**Severity:** HIGH if user input is injected into agent prompts unsanitized

**2. Unsafe Tool Permissions**

Check `allowed-tools` in command frontmatter:
- Commands with Bash access AND user-controlled arguments (shell injection risk)
- Commands with Write access to sensitive paths
- Commands without tool restrictions (implicit full access)

**Severity:** MEDIUM for overly broad tool permissions

**3. Exposed Credentials in Templates**

Search template, config, and planning files for hardcoded credential patterns:
- API keys or tokens in markdown files
- Passwords in JSON/YAML configuration
- Connection strings with embedded credentials

**Severity:** CRITICAL for real credentials, LOW for placeholder examples

**4. Unsafe Hook Scripts**

Check hook scripts for:
- Unvalidated stdin parsing (injection via malformed input)
- Shell commands with interpolated variables
- Network calls to external URLs
- File operations outside project directory

**Severity:** HIGH for hooks with elevated permissions

**5. State File Exposure**

Check if sensitive state files are gitignored:
- `.planning/config.json`
- `.env`, `.env.local`, `.env.production`
- Any file containing credentials

**Severity:** MEDIUM for tracked config files with potential secrets
</step>

<step name="classify_findings">
**Classify each finding by severity:**

| Severity | Criteria | Action |
|----------|----------|--------|
| CRITICAL | Exploitable in production, data loss/breach risk, authentication bypass | Must fix before deploy. Blocks SHIP recommendation. |
| HIGH | Exploitable with effort, privilege escalation, injection vectors | Fix before next release. Strong recommendation to block. |
| MEDIUM | Defense-in-depth issue, overly broad permissions, missing hardening | Fix within sprint. Does not block deployment. |
| LOW | Best practice deviation, informational, potential future risk | Improvement opportunity. Backlog. |

**False positive check:** For each finding, verify by reading the actual code context (10 lines before and after). Discard if:
- Pattern is in a comment or documentation
- Input is validated/sanitized before use
- Code is in test files only
- Pattern is in a dependency (node_modules, vendor)
</step>

<step name="generate_report">
**Write structured report to `.planning/security-report.md`:**

```markdown
# Security Scan Report

**Scan date:** {ISO timestamp}
**Mode:** {code | config | full}
**Files scanned:** {count}
**Findings:** {total} ({critical} critical, {high} high, {medium} medium, {low} low)

## Summary

{CRITICAL_COUNT > 0: "DEPLOYMENT BLOCKED — {N} critical finding(s) require immediate remediation."}
{CRITICAL_COUNT == 0 && HIGH_COUNT > 0: "HIGH PRIORITY — {N} high-severity finding(s) should be addressed before next release."}
{CRITICAL_COUNT == 0 && HIGH_COUNT == 0: "No blocking issues found. {MEDIUM + LOW} improvement opportunities identified."}

## Critical Findings

{For each CRITICAL finding:}

### CRIT-{N}: {Title}

- **File:** {path}:{line}
- **Category:** {Hardcoded Secret | SQL Injection | Code Execution | ...}
- **Evidence:**
  ```{lang}
  {code snippet showing the vulnerability}
  ```
- **Risk:** {What an attacker could do}
- **Fix:**
  ```{lang}
  {specific code change to remediate}
  ```

## High Findings

{Same format as Critical}

## Medium Findings

{Same format but fix can be briefer}

## Low Findings

| # | File | Category | Description |
|---|------|----------|-------------|
| LOW-1 | {path} | {category} | {one-line description} |
| LOW-2 | {path} | {category} | {one-line description} |

## Scan Coverage

| Area | Files Scanned | Patterns Checked |
|------|--------------|------------------|
| Source Code | {N} | Secrets, SQLi, XSS, code execution, deserialization, path traversal, auth |
| GSD Config | {N} | Prompt injection, tool permissions, credential exposure, hooks |

## False Positives Excluded

{List of patterns found but excluded after verification, with reason}
```
</step>

<step name="present_results">
**Present findings to user:**

```
---
GSD > SECURITY SCAN COMPLETE
---

Mode: {mode} | Files: {count} | Findings: {total}

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | {N} | {BLOCKS DEPLOYMENT / —} |
| HIGH | {N} | {Fix before release / —} |
| MEDIUM | {N} | {Fix within sprint / —} |
| LOW | {N} | {Backlog / —} |

{If CRITICAL > 0:}
## BLOCKING: Critical Findings

{For each critical: one-line summary with file path}

These must be fixed before deployment.

{End if}

{If HIGH > 0:}
## High Priority

{For each high: one-line summary with file path}
{End if}

Full report: .planning/security-report.md
```

**If CRITICAL findings exist:**
```
## Recommended Next Steps

1. Fix critical findings immediately
2. Re-run /gsd:security-scan to verify fixes
3. Consider /gsd:orchestrate security for comprehensive security review
```
</step>

<step name="commit_report">
**Commit the security report:**

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "security: scan report ({mode} mode, {total} findings)" --files .planning/security-report.md
```
</step>

</process>

<scan_patterns>
**Code scan vulnerability categories by language:**

| Pattern | JS/TS | Python | Go | Ruby | PHP |
|---------|-------|--------|----|------|-----|
| SQL Injection | Template literals in queries | f-strings in execute() | fmt.Sprintf in Query() | String interpolation in where() | Variable in mysql_query() |
| XSS | innerHTML, dangerouslySetInnerHTML | mark_safe(), \|safe | template.HTML() | raw, html_safe | echo without htmlspecialchars |
| Code Exec | eval(), new Function() | exec(), eval() | -- | eval, system | eval(), exec() |
| Deserialization | JSON.parse(req.body) | pickle.loads | json.Unmarshal(userInput) | Marshal.load | unserialize() |
| Path Traversal | path.join(userInput) | os.path.join(user_input) | filepath.Join(userInput) | File.join(user_input) | file_get_contents($input) |
</scan_patterns>

<failure_handling>
- **No source files found:** Report "No scannable source files detected" — skip code scan
- **GSD config not found:** Report "No GSD configuration found" — skip config scan
- **Search returns too many results:** Increase specificity of patterns, sample first 50
- **Cannot determine if finding is real:** Include in report as MEDIUM with "needs manual verification" note
- **Previous report exists:** Archive to `.planning/security-report-{date}.md` before overwriting
</failure_handling>

<success_criteria>
- [ ] Scan mode resolved and appropriate scans executed
- [ ] All vulnerability patterns checked against relevant files
- [ ] False positives verified and excluded
- [ ] Each finding has file, line, evidence, risk, and fix
- [ ] Findings classified by severity (CRITICAL, HIGH, MEDIUM, LOW)
- [ ] Report written to `.planning/security-report.md`
- [ ] CRITICAL findings clearly highlighted as deployment blockers
- [ ] Report committed
</success_criteria>
