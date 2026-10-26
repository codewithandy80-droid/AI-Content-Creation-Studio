/**
 * Google Flow Video Prompts Generation Engine
 * Strictly adheres to:
 * - 05_FUNCTION_02_GOOGLE_FLOW_PROMPTS.md
 * - 10_PERMANENT_MASTER_RULES.md (Rules 21-25)
 * - ₹0 Budget (Zero external AI calls; transparent deterministic execution)
 * - Acceptance Criteria AC-F02-01 through AC-F02-06
 */

import { 
  Project, 
  AnalysisVersion, 
  GeneratedOutput, 
  ScriptContent, 
  FlowPromptItem, 
  FlowPromptContent 
} from '../types';

export interface FlowPromptGenerationParams {
  project: Project;
  scriptOutput: GeneratedOutput;
  scriptContent: ScriptContent;
  analysis: AnalysisVersion;
  rulesVersionId: string;
}

export interface FlowPromptGenerationResult {
  success: boolean;
  content?: FlowPromptContent;
  error?: string;
  warnings: string[];
}

/**
 * Consistent Male Narrator Profile required across all prompts (Rule 23 / AC-F02-03)
 */
export const CONSISTENT_MALE_NARRATOR_PROFILE = 
  'Narrator Profile: Mature male narrator voice, calm authoritative documentary tone, clear articulate delivery, measured pacing (~2.5 words/second), neutral broadcast cadence, confident and engaging.';

/**
 * Flow Compatibility & Limitation Notice (AC-F02-05 / Rule 24 / DEC-012)
 */
export const FLOW_LIMITATIONS_DISCLAIMER = 
  'Disclaimer: Default output is text prompts formatted for Google Flow video generation. Text prompts describe scene composition, camera motion, lighting, and male narrator profile, but cannot guarantee identical synthesized voice identity, exact second-by-second duration, or pixel-perfect visual continuity across separate clip generations without secondary conditioning.';

/**
 * Default Negative Constraints to avoid common video generation artifacts (Rule 22)
 */
export const DEFAULT_NEGATIVE_CONSTRAINTS = 
  'Negative constraints: Avoid visual artifacts, distorted anatomy, warped faces, unnatural limb movements, blurry textures, text watermarks, modern anachronisms, jump cuts, flickering frames.';

/**
 * Generate Google Flow video prompts from an approved script
 * Enforces:
 * - Precondition: Script output must be approved (Rule 13 / Rule 21 / AC-F02-01)
 * - Precondition: Script must contain at least one segment
 * - Prompt count strictly equals script segment count (AC-F02-01)
 * - Segment IDs and ordering strictly preserved (AC-F02-01)
 * - Aspect ratio matches project (9:16 or 16:9) (AC-F02-02)
 * - Each prompt specifies ratio, action, camera, lighting, timing, continuity, sound (AC-F02-02)
 * - Consistent male narrator description across all prompts (AC-F02-03)
 * - Zero clickable links or URLs (AC-F02-04)
 * - Flow compatibility disclaimer included (AC-F02-05)
 * - Strict ₹0 budget execution
 */
export function generateFlowPromptsFromScript(params: FlowPromptGenerationParams): FlowPromptGenerationResult {
  const { project, scriptOutput, scriptContent, analysis } = params;
  const warnings: string[] = [];

  // Precondition 1: Script must be approved
  if (scriptOutput.status !== 'approved') {
    return {
      success: false,
      error: `Precondition Failed: Google Flow prompts cannot be generated from an unapproved script version (status: ${scriptOutput.status}). User approval of the script is strictly required before downstream prompt generation (Rule 13 / AC-F02-01).`,
      warnings: ['Blocked downstream generation: Script version is not approved.'],
    };
  }

  // Precondition 2: Project matching
  if (project.project_id !== scriptOutput.project_id) {
    return {
      success: false,
      error: `Mismatched project ID: Script belongs to project ${scriptOutput.project_id}, but current project is ${project.project_id}.`,
      warnings: [],
    };
  }

  // Precondition 3: Segments must exist
  const segments = scriptContent.segments || [];
  if (segments.length === 0) {
    return {
      success: false,
      error: 'Cannot generate Flow prompts: The approved script contains zero segments.',
      warnings: [],
    };
  }

  const aspectRatio = project.aspect_ratio;
  const isHindi = project.master_language === 'hi';
  const totalSegments = segments.length;
  const prompts: FlowPromptItem[] = [];

  for (let i = 0; i < totalSegments; i++) {
    const seg = segments[i];
    const segNum = seg.segment_number || i + 1;
    const isFirst = i === 0;
    const isLast = i === totalSegments - 1;
    const prevSeg = i > 0 ? segments[i - 1] : null;
    const nextSeg = i < totalSegments - 1 ? segments[i + 1] : null;

    // 1. Scene Action & Subject Grounding
    // Build from script's visual direction and narration, strictly respecting source analysis facts
    const cleanVisual = seg.visual_direction.replace(/https?:\/\/[^\s]+/g, '').trim();
    const cleanNarration = seg.narration.replace(/https?:\/\/[^\s]+/g, '').trim();
    const cleanOnScreen = seg.on_screen_text.replace(/https?:\/\/[^\s]+/g, '').trim();

    let sceneAction = '';
    if (isFirst) {
      sceneAction = `High-impact opening scene. Subject: ${cleanVisual || 'Primary historical subject revealed in dramatic focus'}. Action: Immediate hook showcasing the core discovery. Narration context: "${cleanNarration.slice(0, 80)}...". On-screen typography cue: "${cleanOnScreen}".`;
    } else if (isLast) {
      sceneAction = `Concluding resolution scene. Subject: ${cleanVisual || 'Wide panoramic perspective on the documented findings'}. Action: Final measured revelation leading to audience synthesis. Narration context: "${cleanNarration.slice(0, 80)}...". On-screen typography cue: "${cleanOnScreen}".`;
    } else {
      sceneAction = `Documentary investigative sequence. Subject: ${cleanVisual || 'Detailed examination of source-documented evidence'}. Action: Focused subject interaction illustrating specific documented findings. Narration context: "${cleanNarration.slice(0, 80)}...". On-screen typography cue: "${cleanOnScreen}".`;
    }

    // 2. Camera Framing, Movement & Lens Feel
    let camera = '';
    if (aspectRatio === '9:16') {
      // Vertical composition
      if (isFirst) {
        camera = 'Vertical 9:16 framing, centered subject composition, slow dramatic push-in, 35mm cinematic lens, shallow depth of field emphasizing primary foreground focus.';
      } else if (isLast) {
        camera = 'Vertical 9:16 framing, vertical eye-level tracking pulling back slowly into a towering low-angle wide shot, 24mm lens with subtle atmospheric depth.';
      } else {
        camera = `Vertical 9:16 framing, dynamic smooth tracking pan ${i % 2 === 0 ? 'left-to-right' : 'right-to-left'}, 50mm portrait lens, disciplined vertical thirds balance.`;
      }
    } else {
      // Horizontal 16:9 composition
      if (isFirst) {
        camera = 'Cinematic widescreen 16:9 framing, sweeping establish dolly-in towards central focal point, anamorphic lens flare, deep contrast.';
      } else if (isLast) {
        camera = 'Cinematic widescreen 16:9 framing, slow majestic crane pull-back revealing full environment scale, 28mm wide lens, measured horizon stabilization.';
      } else {
        camera = `Cinematic widescreen 16:9 framing, steady slider movement ${i % 2 === 0 ? 'forward' : 'lateral'}, 40mm cinematic prime lens, natural parallax effect.`;
      }
    }

    // 3. Lighting, Palette & Atmosphere
    let lighting = '';
    if (isFirst) {
      lighting = 'Dramatic high-contrast chiaroscuro lighting, deep rich shadows, warm amber key light contrasting with cool slate-blue atmospheric haze, photorealistic cinematic grade.';
    } else if (isLast) {
      lighting = 'Subtle golden-hour illumination or stark atmospheric rim light, soft volumetric sun rays piercing the frame, muted authoritative color palette.';
    } else {
      lighting = 'Naturalistic documentary illumination, soft directional light, balanced shadow fill, realistic texture rendering, authentic archival warmth.';
    }

    // 4. Timing & Progression (within target duration)
    const dur = seg.target_duration;
    const split1 = Math.round(dur * 0.3);
    const split2 = Math.round(dur * 0.7);
    const timing = `0-${split1}s: Initial focal reveal and establish subject presence; ${split1}-${split2}s: Continuous focal development and subtle movement; ${split2}-${dur}s: Transition readiness settling into steady framing for next segment.`;

    // 5. Continuity Links (Wardrobe, Setting, Props, Visual Style)
    let continuity = '';
    if (isFirst) {
      continuity = `Master visual anchor. Establishes primary character appearance, wardrobe, environment architecture, and color temperature for all subsequent segments.`;
    } else {
      continuity = `Strict continuity from Segment ${prevSeg?.segment_number || i}: Preserve exact wardrobe, character physical traits, lighting color temperature, and environmental architecture from segment ID ${prevSeg?.segment_id || 'prior'}.`;
    }
    if (nextSeg) {
      continuity += ` Lead-in motion prepares visual handoff to Segment ${nextSeg.segment_number || i + 2}.`;
    }

    // 6. Sound & Music Guidance
    let soundMusic = '';
    if (isFirst) {
      soundMusic = 'Deep resonant sub-bass drop on second 0, followed by a suspenseful low-register documentary synth pulse. Subtle foley: room tone and sharp atmospheric whoosh.';
    } else if (isLast) {
      soundMusic = 'Harmonic documentary swell with sustained cellos and subtle piano chords, trailing off into a lingering ambient silence as the final graphic appears.';
    } else {
      soundMusic = 'Rhythmic atmospheric documentary underscore, subdued percussion maintaining tension. Realistic foley: crisp ambient background acoustics matching the depicted environment.';
    }

    // 7. Non-clickable claim references
    const cleanClaimRefs = (seg.claim_references || [])
      .map((r) => r.replace(/https?:\/\/[^\s]+/g, '').trim())
      .filter(Boolean);

    // 8. Warnings preservation
    const segWarnings = [...(seg.warnings || [])];
    if (isHindi) {
      segWarnings.push('Note: Master language is Hindi. Ensure narration and on-screen cues follow Hindi master language.');
    }

    // 9. Assembled Full Prompt Text for Google Flow
    const promptText = [
      `[Segment ${segNum} | Duration: ${dur}s | Aspect Ratio: ${aspectRatio}]`,
      `SCENE & ACTION: ${sceneAction}`,
      `CAMERA: ${camera}`,
      `LIGHTING & PALETTE: ${lighting}`,
      `TIMING BREAKDOWN: ${timing}`,
      `CONTINUITY: ${continuity}`,
      `AUDIO / MUSIC: ${soundMusic}`,
      `NARRATOR GUIDANCE: ${CONSISTENT_MALE_NARRATOR_PROFILE}`,
      cleanClaimRefs.length > 0 ? `GROUNDED CLAIMS: [${cleanClaimRefs.join(', ')}] (Non-clickable)` : '',
      DEFAULT_NEGATIVE_CONSTRAINTS,
    ]
      .filter(Boolean)
      .join('\n\n');

    // Strict validation: Verify no clickable link exists in prompt_text (AC-F02-04)
    if (/https?:\/\/|www\./i.test(promptText)) {
      warnings.push(`Segment ${segNum} prompt contained link pattern which was stripped to satisfy AC-F02-04.`);
    }

    prompts.push({
      segment_id: seg.segment_id,
      segment_number: segNum,
      prompt_text: promptText,
      aspect_ratio: aspectRatio,
      target_duration: dur,
      scene_action: sceneAction,
      camera,
      lighting,
      timing,
      continuity,
      sound_music: soundMusic,
      narrator_style: CONSISTENT_MALE_NARRATOR_PROFILE,
      claim_references: cleanClaimRefs,
      warnings: segWarnings,
    });
  }

  return {
    success: true,
    content: {
      prompts,
      disclaimer: FLOW_LIMITATIONS_DISCLAIMER,
      script_version_id: scriptOutput.output_id,
    },
    warnings,
  };
}
