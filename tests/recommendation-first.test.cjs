/**
 * GSD Eval Tests - Recommendation-First Decision Framework + Universal System
 *
 * Validates that all workflow, agent, template, and hook files contain
 * the expected patterns from the two requirement documents:
 * 1. Recommendation-First Decision Framework
 * 2. Universal Agentic Development System improvements
 */

const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const WORKFLOWS = path.join(ROOT, 'get-shit-done', 'workflows');
const TEMPLATES = path.join(ROOT, 'get-shit-done', 'templates');
const REFERENCES = path.join(ROOT, 'get-shit-done', 'references');
const AGENTS = path.join(ROOT, 'agents');
const HOOKS = path.join(ROOT, 'hooks');

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

// ─── Recommendation-First: discuss-phase ─────────────────────────────────────

describe('discuss-phase workflow - recommendation-first', () => {
  const content = readFile(path.join(WORKFLOWS, 'discuss-phase.md'));

  test('contains proposal generation step', () => {
    assert.ok(
      content.includes('generate_proposal'),
      'discuss-phase should have generate_proposal step (replaces present_gray_areas)'
    );
  });

  test('contains proposal review step', () => {
    assert.ok(
      content.includes('review_proposal'),
      'discuss-phase should have review_proposal step (replaces discuss_areas)'
    );
  });

  test('does NOT contain old interrogation steps', () => {
    assert.ok(
      !content.includes('step name="discuss_areas"'),
      'discuss-phase should NOT have discuss_areas step (old interrogation mode)'
    );
  });

  test('contains three decision categories', () => {
    assert.ok(content.includes('Auto-Decide'), 'should reference Auto-Decide category');
    assert.ok(content.includes('Recommend'), 'should reference Recommend category');
    assert.ok(content.includes('Must-Ask'), 'should reference Must-Ask category');
  });

  test('contains 70-25-5 proportions', () => {
    assert.ok(content.includes('70%'), 'should reference 70% auto-decide');
    assert.ok(content.includes('25%'), 'should reference 25% recommend');
    assert.ok(content.includes('5%'), 'should reference 5% must-ask');
  });

  test('contains question budget constraint', () => {
    assert.ok(
      content.includes('3-5') || content.includes('max 3') || content.includes('max 5'),
      'should enforce question budget for must-ask items'
    );
  });

  test('contains decision batching guidance', () => {
    assert.ok(
      content.toLowerCase().includes('batch') || content.toLowerCase().includes('package'),
      'should mention decision batching or packaging'
    );
  });

  test('contains deep-think protocol', () => {
    assert.ok(
      content.toLowerCase().includes('deep-think') || content.toLowerCase().includes('deep_think'),
      'should reference deep-think protocol'
    );
  });

  test('contains Decisions Made section in write_context', () => {
    assert.ok(
      content.includes('Decisions Made') || content.includes('auto_decisions'),
      'write_context should produce auto_decisions or Decisions Made section'
    );
  });

  test('contains Recommendations section in write_context', () => {
    assert.ok(
      content.includes('Recommendations') || content.includes('recommendations'),
      'write_context should produce recommendations section'
    );
  });

  test('contains Input Needed section in proposal', () => {
    assert.ok(
      content.includes('Input Needed'),
      'proposal should have Input Needed section for must-ask items'
    );
  });

  test('preserves infrastructure steps', () => {
    assert.ok(content.includes('step name="initialize"'), 'should keep initialize step');
    assert.ok(content.includes('step name="check_existing"'), 'should keep check_existing step');
    assert.ok(content.includes('step name="load_prior_context"'), 'should keep load_prior_context step');
    assert.ok(content.includes('step name="scout_codebase"'), 'should keep scout_codebase step');
    assert.ok(content.includes('step name="git_commit"'), 'should keep git_commit step');
    assert.ok(content.includes('step name="auto_advance"'), 'should keep auto_advance step');
  });
});

// ─── Recommendation-First: new-project ───────────────────────────────────────

describe('new-project workflow - recommendation-first', () => {
  const content = readFile(path.join(WORKFLOWS, 'new-project.md'));

  test('contains Project Proposal pattern', () => {
    assert.ok(
      content.includes('Project Proposal') || content.includes('project proposal'),
      'should generate a Project Proposal instead of interrogation'
    );
  });

  test('contains recommendation-first workflow preferences', () => {
    assert.ok(
      content.includes('Recommended Workflow') || content.includes('recommended workflow') ||
      content.includes('Approve all') || content.includes('approve all'),
      'workflow preferences should be presented as a recommendation table'
    );
  });

  test('contains requirements proposal pattern', () => {
    assert.ok(
      content.includes('requirements proposal') || content.includes('Requirements Proposal') ||
      content.includes('Proposed v1 Requirements') || content.includes('Approve requirements'),
      'requirements should be presented as a proposal'
    );
  });

  test('preserves auto mode', () => {
    assert.ok(
      content.includes('auto_mode') || content.includes('auto mode') || content.includes('--auto'),
      'should preserve auto mode functionality'
    );
  });

  test('keeps initial freeform question', () => {
    assert.ok(
      content.includes('What do you want to build'),
      'should still ask initial freeform question'
    );
  });
});

// ─── Recommendation-First: new-milestone ─────────────────────────────────────

describe('new-milestone workflow - recommendation-first', () => {
  const content = readFile(path.join(WORKFLOWS, 'new-milestone.md'));

  test('contains Milestone Proposal pattern', () => {
    assert.ok(
      content.includes('Milestone Proposal') || content.includes('milestone proposal'),
      'should generate a Milestone Proposal'
    );
  });

  test('contains recommendation-first requirements', () => {
    assert.ok(
      content.includes('Requirements Proposal') || content.includes('requirements proposal') ||
      content.includes('Approve requirements'),
      'requirements should be a proposal'
    );
  });

  test('preserves existing steps', () => {
    assert.ok(content.includes('Load Context'), 'should keep Load Context step');
    assert.ok(content.includes('Determine Milestone Version'), 'should keep version step');
    assert.ok(content.includes('Update PROJECT.md'), 'should keep project update step');
  });
});

// ─── Recommendation-First: verify-work ───────────────────────────────────────

describe('verify-work workflow - batch checklist', () => {
  const content = readFile(path.join(WORKFLOWS, 'verify-work.md'));

  test('contains batch checklist presentation', () => {
    assert.ok(
      content.includes('VERIFICATION CHECKLIST') || content.includes('batch checklist') ||
      content.includes('present_all_tests'),
      'should present all tests as a batch checklist'
    );
  });

  test('contains batch response processing', () => {
    assert.ok(
      content.includes('process_batch_response') || content.includes('batch response') ||
      content.includes('all pass'),
      'should process batch responses'
    );
  });

  test('does NOT present tests one-at-a-time', () => {
    assert.ok(
      !content.includes('step name="present_test"'),
      'should NOT have old present_test step (one-at-a-time)'
    );
  });

  test('preserves diagnostic pipeline', () => {
    assert.ok(content.includes('diagnose_issues'), 'should keep diagnose_issues step');
    assert.ok(content.includes('plan_gap_closure'), 'should keep plan_gap_closure step');
  });
});

// ─── Questioning Reference ───────────────────────────────────────────────────

describe('questioning.md reference - recommendation-first', () => {
  const content = readFile(path.join(REFERENCES, 'questioning.md'));

  test('contains recommendation-first philosophy', () => {
    assert.ok(
      content.includes('opinionated advisor') || content.includes('recommendation') ||
      content.includes('Recommend'),
      'should describe an opinionated advisor, not neutral facilitator'
    );
  });

  test('contains question budget', () => {
    assert.ok(
      content.includes('question_budget') || content.includes('question budget') ||
      content.includes('Question Budget'),
      'should include question budget constraints'
    );
  });

  test('contains decision batching', () => {
    assert.ok(
      content.includes('decision_batching') || content.includes('decision batching') ||
      content.includes('Decision Batching'),
      'should include decision batching guidance'
    );
  });

  test('contains deep-think protocol', () => {
    assert.ok(
      content.includes('deep_think') || content.includes('deep-think') ||
      content.includes('Deep-Think') || content.includes('Deep Think'),
      'should include deep-think protocol'
    );
  });

  test('contains proposal pattern', () => {
    assert.ok(
      content.includes('proposal_pattern') || content.includes('Proposal') ||
      content.includes('proposal'),
      'should describe the proposal pattern'
    );
  });
});

// ─── Context Template ────────────────────────────────────────────────────────

describe('context.md template - three-tier decisions', () => {
  const content = readFile(path.join(TEMPLATES, 'context.md'));

  test('contains auto_decisions section', () => {
    assert.ok(
      content.includes('auto_decisions'),
      'template should have auto_decisions section'
    );
  });

  test('contains recommendations section', () => {
    assert.ok(
      content.includes('recommendations'),
      'template should have recommendations section'
    );
  });

  test('contains decisions section', () => {
    assert.ok(
      content.includes('decisions'),
      'template should still have decisions section for must-ask answers'
    );
  });

  test('contains examples with three tiers', () => {
    // Check that at least one example includes all three sections
    const hasAutoInExample = content.includes('Auto-Decided') || content.includes('auto_decisions');
    const hasRecInExample = content.includes('Accepted Recommendations') || content.includes('recommendations');
    assert.ok(hasAutoInExample, 'examples should show auto-decided section');
    assert.ok(hasRecInExample, 'examples should show recommendations section');
  });
});

// ─── Universal System: Test-First Plan Templates ─────────────────────────────

describe('gsd-planner agent - test-first blocks', () => {
  const content = readFile(path.join(AGENTS, 'gsd-planner.md'));

  test('contains test_first element in task template', () => {
    assert.ok(
      content.includes('<test_first>') || content.includes('test_first'),
      'planner should include test_first element in task XML'
    );
  });

  test('contains test-first guidance', () => {
    assert.ok(
      content.includes('test') && content.includes('BEFORE'),
      'should guide writing tests BEFORE implementation'
    );
  });
});

// ─── Universal System: Flexible Task Count ───────────────────────────────────

describe('gsd-planner agent - flexible task count', () => {
  const content = readFile(path.join(AGENTS, 'gsd-planner.md'));

  test('supports up to 5 tasks when tightly coupled', () => {
    assert.ok(
      content.includes('up to 5') || content.includes('4-5'),
      'should allow up to 5 tasks for tightly coupled work'
    );
  });

  test('mentions coupled/shared schema justification', () => {
    assert.ok(
      content.includes('schema') || content.includes('tightly coupled') ||
      content.includes('coupled'),
      'should mention coupled/schema/interface justification for larger plans'
    );
  });

  test('keeps 2-3 as default', () => {
    assert.ok(
      content.includes('2-3'),
      'should keep 2-3 as default task count'
    );
  });
});

// ─── Universal System: Plan Checker - Test-First ─────────────────────────────

describe('gsd-plan-checker agent - test-first verification', () => {
  const content = readFile(path.join(AGENTS, 'gsd-plan-checker.md'));

  test('contains test-first compliance dimension', () => {
    assert.ok(
      content.includes('Test-First Compliance') || content.includes('test_first_compliance'),
      'should have test-first compliance verification dimension'
    );
  });

  test('updated scope thresholds for flexible count', () => {
    assert.ok(
      content.includes('6+') || content.includes('coupled'),
      'should have updated thresholds for 6+ blocker or coupled exception'
    );
  });
});

// ─── Universal System: Security Gate Hook ────────────────────────────────────

describe('security gate hook', () => {
  const hookPath = path.join(HOOKS, 'gsd-security-gate.js');

  test('hook file exists', () => {
    assert.ok(
      fs.existsSync(hookPath),
      'gsd-security-gate.js should exist in hooks/'
    );
  });

  test('is valid JavaScript', () => {
    assert.doesNotThrow(() => {
      require(hookPath);
    }, 'hook should be valid, loadable JavaScript');
  });

  const content = readFile(hookPath);

  test('detects hardcoded secrets', () => {
    assert.ok(
      content.includes('password') || content.includes('api_key') || content.includes('api-key'),
      'should detect hardcoded password or API key patterns'
    );
  });

  test('detects security anti-patterns', () => {
    assert.ok(
      content.includes('eval') || content.includes('innerHTML'),
      'should detect eval/innerHTML anti-patterns'
    );
  });

  test('handles PostToolUse events', () => {
    assert.ok(
      content.includes('PostToolUse') || content.includes('Write') || content.includes('Edit'),
      'should handle PostToolUse events for Write/Edit tools'
    );
  });

  test('outputs structured warnings', () => {
    assert.ok(
      content.includes('SECURITY GATE') || content.includes('warning'),
      'should output structured security warnings'
    );
  });
});

// ─── Universal System: Cross-Phase Regression ────────────────────────────────

describe('execute-phase workflow - cross-phase regression', () => {
  const content = readFile(path.join(WORKFLOWS, 'execute-phase.md'));

  test('contains regression_check step', () => {
    assert.ok(
      content.includes('regression_check'),
      'should have regression_check step'
    );
  });

  test('runs full test suite', () => {
    assert.ok(
      content.includes('full test suite') || content.includes('npm test') ||
      content.includes('pytest') || content.includes('cargo test'),
      'should run full test suite (not just phase tests)'
    );
  });

  test('blocks on regression', () => {
    assert.ok(
      content.includes('REGRESSION') || content.includes('regression'),
      'should detect and flag regressions'
    );
  });

  test('offers fix/skip/abort options', () => {
    assert.ok(
      content.includes('Fix now') || content.includes('fix now'),
      'should offer Fix option for regressions'
    );
    assert.ok(
      content.includes('Abort') || content.includes('abort'),
      'should offer Abort option for regressions'
    );
  });
});

// ─── Planner Subagent Prompt Template ────────────────────────────────────────

describe('planner subagent prompt template', () => {
  const content = readFile(path.join(TEMPLATES, 'planner-subagent-prompt.md'));

  test('mentions test-first blocks in quality gate', () => {
    assert.ok(
      content.includes('test_first') || content.includes('test-first'),
      'quality gate should mention test-first blocks'
    );
  });

  test('mentions flexible task count', () => {
    assert.ok(
      content.includes('up to 5') || content.includes('tightly coupled'),
      'quality gate should mention flexible task count'
    );
  });
});
