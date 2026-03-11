#!/usr/bin/env node
// Hook Profile System
// Controls which hooks run based on the configured profile level.
// Profiles: minimal < standard < strict
//
// Usage in other hooks:
//   const { shouldRunHook } = require('./gsd-hook-profiles');
//   if (!shouldRunHook('context-monitor', 'standard')) process.exit(0);
//
// Profile is read from GSD_HOOK_PROFILE env var (default: 'standard')

const PROFILES = {
  minimal: 1,
  standard: 2,
  strict: 3
};

// Map each hook to the minimum profile level required to run it
const HOOK_PROFILE_MAP = {
  'security-gate': 'minimal',
  'check-update': 'minimal',
  'context-monitor': 'standard',
  'statusline': 'standard',
  'memory-update': 'standard',
  'compaction-suggest': 'strict',
  'cost-tracking': 'strict'
};

/**
 * Check if a hook should run under the current profile.
 * @param {string} hookId - The hook identifier (e.g. 'security-gate')
 * @param {string} [requiredProfile] - Override the required profile (uses HOOK_PROFILE_MAP if omitted)
 * @returns {boolean} true if the hook should run
 */
function shouldRunHook(hookId, requiredProfile) {
  const currentProfile = (process.env.GSD_HOOK_PROFILE || 'standard').toLowerCase();
  const currentLevel = PROFILES[currentProfile] || PROFILES.standard;

  // Use provided profile or look up from the map
  const needed = requiredProfile || HOOK_PROFILE_MAP[hookId] || 'standard';
  const neededLevel = PROFILES[needed] || PROFILES.standard;

  return currentLevel >= neededLevel;
}

/**
 * Get the current active profile name.
 * @returns {string} The profile name ('minimal', 'standard', or 'strict')
 */
function getActiveProfile() {
  const profile = (process.env.GSD_HOOK_PROFILE || 'standard').toLowerCase();
  return PROFILES[profile] ? profile : 'standard';
}

module.exports = { shouldRunHook, getActiveProfile, PROFILES, HOOK_PROFILE_MAP };
