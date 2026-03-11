#!/usr/bin/env node
// Cost Tracker - dual-mode hook (PostToolUse + Stop)
// PostToolUse mode: accumulates tool call counts in a temp file
// Stop mode: writes session summary to .planning/cost-log.md
//
// Registered on both PostToolUse and Stop events. Detects mode from
// the presence of tool_name (PostToolUse) vs its absence (Stop).
//
// Tracks approximate session metrics:
//   - Number of tool calls made
//   - Files read/written/edited
//   - Agents spawned
//   - Top tools used
//
// Lightweight and fast — never blocks tool execution or session end.

const fs = require('fs');
const path = require('path');
const os = require('os');

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
      var profiles = require('./gsd-hook-profiles');
      if (!profiles.shouldRunHook('cost-tracking')) {
        process.exit(0);
      }
    } catch (e) {
      // If profile module unavailable, default to not running (strict-only hook)
      process.exit(0);
    }

    var data = JSON.parse(input);
    var cwd = data.cwd || process.cwd();
    var sessionId = data.session_id || 'unknown';
    var tmpDir = os.tmpdir();
    var trackingPath = path.join(tmpDir, 'claude-cost-' + sessionId + '.json');

    // Only track when GSD is active (has .planning directory)
    var planningDir = path.join(cwd, '.planning');
    if (!fs.existsSync(planningDir)) {
      process.exit(0);
    }

    // Load existing tracking state
    var tracking = {
      toolCalls: 0,
      filesRead: 0,
      filesWritten: 0,
      filesEdited: 0,
      agentsSpawned: 0,
      startTime: Math.floor(Date.now() / 1000),
      tools: {}
    };

    if (fs.existsSync(trackingPath)) {
      try {
        tracking = JSON.parse(fs.readFileSync(trackingPath, 'utf8'));
      } catch (e) {
        // Corrupted, use defaults
      }
    }

    // Detect mode: PostToolUse has tool_name, Stop does not
    var toolName = data.tool_name || '';

    if (toolName) {
      // === PostToolUse mode: accumulate metrics ===
      tracking.toolCalls++;
      tracking.tools[toolName] = (tracking.tools[toolName] || 0) + 1;

      if (toolName === 'Read') {
        tracking.filesRead++;
      } else if (toolName === 'Write') {
        tracking.filesWritten++;
      } else if (toolName === 'Edit') {
        tracking.filesEdited++;
      } else if (toolName === 'Bash') {
        // Detect agent spawning from bash commands
        var command = (data.tool_input && data.tool_input.command) || '';
        if (/claude\s|--agent|Task\(|spawn/i.test(command)) {
          tracking.agentsSpawned++;
        }
      } else if (toolName === 'Task' || toolName === 'Agent') {
        tracking.agentsSpawned++;
      }

      // Save updated tracking state
      fs.writeFileSync(trackingPath, JSON.stringify(tracking));
      process.exit(0);
    }

    // === Stop mode: write session summary ===
    var costLogPath = path.join(planningDir, 'cost-log.md');
    var now = new Date();
    var dateStr = now.toISOString().split('T')[0];
    var timeStr = now.toISOString().split('T')[1].split('.')[0];
    var durationSec = Math.floor(Date.now() / 1000) - (tracking.startTime || Math.floor(Date.now() / 1000));
    var durationMin = Math.max(1, Math.round(durationSec / 60));

    // Build tool usage summary (top 5)
    var toolSummary = Object.entries(tracking.tools || {})
      .sort(function(a, b) { return b[1] - a[1]; })
      .slice(0, 5)
      .map(function(pair) { return pair[0] + ':' + pair[1]; })
      .join(', ');

    var entry = [
      '',
      '### ' + dateStr + ' ' + timeStr + ' (session: ' + sessionId.substring(0, 8) + ')',
      '',
      '- **Duration:** ~' + durationMin + ' min',
      '- **Tool calls:** ' + tracking.toolCalls,
      '- **Files:** ' + tracking.filesRead + ' read, ' + tracking.filesWritten + ' written, ' + tracking.filesEdited + ' edited',
      '- **Agents spawned:** ' + tracking.agentsSpawned,
      toolSummary ? '- **Top tools:** ' + toolSummary : '',
      ''
    ].filter(Boolean).join('\n');

    // Create or append to cost log
    var existingContent = '';
    if (fs.existsSync(costLogPath)) {
      existingContent = fs.readFileSync(costLogPath, 'utf8');
    } else {
      existingContent = '# GSD Session Cost Log\n\nApproximate session metrics tracked by gsd-cost-tracker hook.\n';
    }

    fs.writeFileSync(costLogPath, existingContent + entry + '\n');

    // Clean up temp tracking file
    try {
      fs.unlinkSync(trackingPath);
    } catch (e) {
      // Ignore cleanup errors
    }
  } catch (e) {
    // Silent fail -- never block session end
    process.exit(0);
  }
});
