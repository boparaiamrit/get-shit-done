#!/usr/bin/env node
// Strategic Compaction Suggestion - PostToolUse hook
// Detects logical breakpoints between GSD phases and suggests /compact.
// Advisory only — never blocks tool execution.
//
// Suggests compaction:
//   - After completing a phase execution
//   - After verification is done
//   - Before starting a new phase plan
//   - When context has accumulated significantly
//
// Does NOT suggest compaction:
//   - Mid-implementation
//   - During active debugging
//   - While tests are failing

const fs = require('fs');
const path = require('path');
const os = require('os');

// Debounce: minimum tool calls between suggestions
const DEBOUNCE_CALLS = 30;
// Minimum remaining percentage before we start suggesting
const CONTEXT_ACCUMULATION_THRESHOLD = 60;

let input = '';
// Timeout guard: if stdin doesn't close within 3s, exit silently. See #775.
const stdinTimeout = setTimeout(function() { process.exit(0); }, 3000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) { input += chunk; });
process.stdin.on('end', function() {
  clearTimeout(stdinTimeout);
  try {
    // Profile check (strict only)
    try {
      const { shouldRunHook } = require('./gsd-hook-profiles');
      if (!shouldRunHook('compaction-suggest')) {
        process.exit(0);
      }
    } catch (e) {
      // If profile module unavailable, default to not running (strict-only hook)
      process.exit(0);
    }

    const data = JSON.parse(input);
    const sessionId = data.session_id;
    const cwd = data.cwd || process.cwd();

    if (!sessionId) {
      process.exit(0);
    }

    // Only active when GSD is being used (has .planning directory)
    const planningDir = path.join(cwd, '.planning');
    if (!fs.existsSync(planningDir)) {
      process.exit(0);
    }

    // Read context metrics from the statusline bridge file
    const tmpDir = os.tmpdir();
    const metricsPath = path.join(tmpDir, `claude-ctx-${sessionId}.json`);
    let contextRemaining = 100;

    if (fs.existsSync(metricsPath)) {
      try {
        const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
        const now = Math.floor(Date.now() / 1000);
        // Only use fresh metrics (within 60s)
        if (metrics.timestamp && (now - metrics.timestamp) <= 60) {
          contextRemaining = metrics.remaining_percentage || 100;
        }
      } catch (e) {
        // Ignore parse errors
      }
    }

    // Don't suggest if context is still mostly fresh
    if (contextRemaining > CONTEXT_ACCUMULATION_THRESHOLD) {
      process.exit(0);
    }

    // Read STATE.md to understand current GSD phase
    const statePath = path.join(planningDir, 'STATE.md');
    if (!fs.existsSync(statePath)) {
      process.exit(0);
    }

    let stateContent;
    try {
      stateContent = fs.readFileSync(statePath, 'utf8');
    } catch (e) {
      process.exit(0);
    }

    // Detect phase from STATE.md
    const isVerificationDone = /status:\s*(verified|complete|done)/i.test(stateContent);
    const isPhaseComplete = /phase.*complete|execution.*complete|all.*steps.*done/i.test(stateContent);
    const isBetweenPhases = /waiting|idle|ready.*for.*next|paused/i.test(stateContent);

    // Detect anti-patterns: don't suggest during active work
    const isDebugging = /debugging|investigating|troubleshooting/i.test(stateContent);
    const isImplementing = /implementing|in.?progress|executing.*step/i.test(stateContent);
    const isTestsFailing = /tests?\s*(failing|broken|red)/i.test(stateContent);

    // Bail if we're in the middle of something
    if (isDebugging || isImplementing || isTestsFailing) {
      process.exit(0);
    }

    // Only suggest at logical breakpoints
    const isBreakpoint = isVerificationDone || isPhaseComplete || isBetweenPhases;
    if (!isBreakpoint) {
      process.exit(0);
    }

    // Debounce: don't spam suggestions
    const suggestPath = path.join(tmpDir, `claude-compact-suggest-${sessionId}.json`);
    let suggestData = { callsSinceSuggest: 0 };

    if (fs.existsSync(suggestPath)) {
      try {
        suggestData = JSON.parse(fs.readFileSync(suggestPath, 'utf8'));
      } catch (e) {
        // Corrupted file, reset
      }
    }

    suggestData.callsSinceSuggest = (suggestData.callsSinceSuggest || 0) + 1;

    if (suggestData.callsSinceSuggest < DEBOUNCE_CALLS) {
      fs.writeFileSync(suggestPath, JSON.stringify(suggestData));
      process.exit(0);
    }

    // Reset counter
    suggestData.callsSinceSuggest = 0;
    fs.writeFileSync(suggestPath, JSON.stringify(suggestData));

    // Build suggestion message
    let reason = 'a logical breakpoint';
    if (isVerificationDone) reason = 'verification is complete';
    else if (isPhaseComplete) reason = 'phase execution is complete';
    else if (isBetweenPhases) reason = 'the session is between phases';

    const message =
      `COMPACTION SUGGESTION: Context usage is significant (${100 - Math.round(contextRemaining)}% used) ` +
      `and ${reason}. This is a good time to run /compact to free up context space ` +
      'before starting the next piece of work. This is a suggestion, not a requirement.';

    const output = {
      hookSpecificOutput: {
        hookEventName: process.env.GEMINI_API_KEY ? 'AfterTool' : 'PostToolUse',
        additionalContext: message
      }
    };

    process.stdout.write(JSON.stringify(output));
  } catch (e) {
    // Silent fail -- never block tool execution
    process.exit(0);
  }
});
