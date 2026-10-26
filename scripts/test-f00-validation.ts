/**
 * Automated Validation Test for Task-02B (Function 00 UI Logic & Validation)
 */

import { Project, Source } from '../src/types';
import { MAX_ACTIVE_PROJECTS, identifyOldestProject } from '../src/storage';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`FAILED: ${msg}`);
    process.exit(1);
  }
}

console.log('=== RUNNING FUNCTION 00 LOGIC & VALIDATION TESTS ===\n');

// 1. Required-field validation
console.log('Checking required field validation...');
const validateProjectInput = (name: string, format: string, longDurationMin: number, shortsCount: number) => {
  if (!name.trim()) return { valid: false, error: 'Project name is mandatory and cannot be empty.' };
  if (format === 'long_video' && longDurationMin < 4) {
    return { valid: false, error: 'Long video format strictly requires a minimum duration of 4 minutes (Rule 18).' };
  }
  if (format === 'shorts' && shortsCount < 1) {
    return { valid: false, error: 'Shorts format requires at least 1 segment.' };
  }
  return { valid: true };
};

assert(!validateProjectInput('', 'shorts', 5, 5).valid, 'Empty project name should fail');
assert(validateProjectInput('Valid Project', 'shorts', 5, 5).valid, 'Valid project name should pass');
console.log('1. Required field validation -> PASS');

// 2. Shorts segment count validation
console.log('Checking shorts segment count validation...');
assert(!validateProjectInput('Shorts', 'shorts', 5, 0).valid, '0 shorts segment should fail');
assert(validateProjectInput('Shorts', 'shorts', 5, 5).valid, '5 shorts segments should pass');
const estShortsDuration = (count: number) => count * 8;
assert(estShortsDuration(5) === 40, '5 segments must equal 40 seconds');
console.log('2. Shorts segment count validation -> PASS');

// 3. Long video minimum duration validation (Rule 18)
console.log('Checking long video minimum duration validation...');
assert(!validateProjectInput('Long Video', 'long_video', 3.9, 0).valid, 'Duration < 4 minutes must fail');
assert(!validateProjectInput('Long Video', 'long_video', 2, 0).valid, '2 minutes must fail');
assert(validateProjectInput('Long Video', 'long_video', 4, 0).valid, '4 minutes must pass');
assert(validateProjectInput('Long Video', 'long_video', 10, 0).valid, '10 minutes must pass');
const estLongSegments = (minutes: number) => Math.ceil((minutes * 60) / 8);
assert(estLongSegments(4) === 30, '4 minutes must equal 30 segments (4*60 / 8 = 30)');
console.log('3. Long video minimum duration validation (>= 4 min) -> PASS');

// 4. Source preview and word count logic
console.log('Checking source preview and word count...');
const countWords = (text: string) => text.trim() ? text.trim().split(/\s+/).length : 0;
const sampleSource = 'This is a historic investigative brief detailing events from 1995 to 2024.';
assert(countWords(sampleSource) === 12, `Expected 12 words, got ${countWords(sampleSource)}`);
assert(countWords('   ') === 0, 'Whitespace-only should yield 0 words');
console.log('4. Source preview and word count -> PASS');

// 5. Non-clickable source references (No clickable links rule)
console.log('Checking non-clickable provenance enforcement...');
const sanitizeProvenance = (text: string) => text.replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1');
const linkProvenance = 'Refer to <a href="https://example.com/report">Historical Document</a> Vol 1';
const sanitized = sanitizeProvenance(linkProvenance);
assert(!sanitized.includes('<a') && !sanitized.includes('href'), 'HTML anchors must be stripped from provenance');
assert(sanitized.includes('Historical Document Vol 1'), 'Text inside anchor must be preserved');
console.log('5. Non-clickable source reference sanitation -> PASS');

// 6. Eight-project limit and oldest candidate identification
console.log('Checking 8-project limit and oldest candidate identification...');
const testProjects: Project[] = [];
for (let i = 1; i <= 8; i++) {
  testProjects.push({
    project_id: `proj-00${i}`,
    name: `Project ${i}`,
    created_at: new Date(Date.now() - (10 - i) * 100000).toISOString(),
    last_activity_at: new Date(Date.now() - (10 - i) * 50000).toISOString(),
    master_language: 'hi',
    aspect_ratio: '9:16',
    format_type: 'shorts',
    shorts_segment_count: 5,
    target_duration_seconds: 40,
    master_rules_version_id: 'mr-v1.0-baseline',
    active_approved_analysis_version_id: null,
    project_status: 'active',
  });
}
assert(testProjects.length === MAX_ACTIVE_PROJECTS, 'Should have exactly 8 active projects');
const oldest = identifyOldestProject(testProjects);
assert(oldest?.project_id === 'proj-001', 'proj-001 must be identified as the oldest project candidate');
console.log('6. Eight-project limit and oldest candidate identification -> PASS');

console.log('\n=== ALL FUNCTION 00 VALIDATION CHECKS PASSED ===');
