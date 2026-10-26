/**
 * YouTube Thumbnail Prompts Generation Engine
 * Strictly adheres to:
 * - 06_FUNCTION_03_THUMBNAIL_PROMPTS.md
 * - 10_PERMANENT_MASTER_RULES.md (Rules 26-30)
 * - 15_QUALITY_TESTS_AND_ACCEPTANCE_CRITERIA.md (QA-018, AC-F03-01 through AC-F03-06)
 * - ₹0 Budget (Zero external AI calls; transparent deterministic execution)
 */

import { 
  Project, 
  AnalysisVersion, 
  GeneratedOutput, 
  ScriptContent, 
  ThumbnailConcept, 
  ThumbnailPromptContent 
} from '../types';

export interface ThumbnailPromptGenerationParams {
  project: Project;
  scriptOutput: GeneratedOutput;
  scriptContent: ScriptContent;
  analysis: AnalysisVersion;
  rulesVersionId: string;
  titleContext?: string;
}

export interface ThumbnailPromptGenerationResult {
  success: boolean;
  content?: ThumbnailPromptContent;
  error?: string;
  warnings: string[];
}

/**
 * Honest Labeling Disclaimer (Rule 29 / AC-F03-06)
 * Default output is text prompts only. Never claims image generation occurred.
 */
export const THUMBNAIL_PROMPT_DISCLAIMER = 
  'Disclaimer: This function generates structured text prompts for external image generation tools (e.g., Midjourney, Imagen, DALL-E). No image file is generated or claimed to be generated. Prompts specify focal subject, composition, camera perspective, lighting, color palette, mobile safe zones, and text placement strictly grounded in approved project content.';

/**
 * Negative constraints to avoid typical image generation artifacts (Rule 27 / Rule 30)
 */
export const THUMBNAIL_NEGATIVE_CONSTRAINTS_DEFAULT = 
  'Negative constraints: Avoid visual clutter, illegible stylized micro-fonts, extra limbs, deformed hands, warped facial features, unnatural reflections, low-contrast washed-out tones, generic stock-photo expressions, floating irrelevant objects, text overlapping platform UI safe zones.';

/**
 * Helper to strip any URL or hyperlink syntax to ensure zero clickable links (AC-F03-05 / Rule 30)
 */
function sanitizeNonClickable(text: string): string {
  if (!text) return '';
  return text
    .replace(/https?:\/\/[^\s)]+/gi, '[source reference]')
    .replace(/www\.[^\s)]+/gi, '[source reference]')
    .replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1')
    .trim();
}

/**
 * Generate two distinct thumbnail prompts (Option A and Option B)
 * Enforces:
 * - Precondition: Script output must be approved (Rule 13 / AC-F03-01)
 * - Precondition: Analysis version must be approved (Rule 13 / Rule 28)
 * - Precondition: Script must contain segments
 * - Exactly two options generated: Option A (Dramatic) & Option B (Mystery/Discovery) (AC-F03-01 / AC-F03-02)
 * - Aspect ratio matches project (9:16 or 16:9) (AC-F03-03)
 * - Mobile readability and safe space hierarchy addressed (AC-F03-04)
 * - Zero clickable links or URLs (AC-F03-05 / Rule 30)
 * - Honest labeling: Text prompts only, disclaimer included (AC-F03-06 / Rule 29)
 * - Strict ₹0 budget execution
 */
export function generateThumbnailPrompts(params: ThumbnailPromptGenerationParams): ThumbnailPromptGenerationResult {
  const { project, scriptOutput, scriptContent, analysis, titleContext } = params;
  const warnings: string[] = [];

  // 1. Precondition Check: Script must be approved (Rule 13 / Rule 21)
  if (scriptOutput.status !== 'approved') {
    return {
      success: false,
      error: `Precondition Failed: Thumbnail prompts cannot be generated from an unapproved script version (status: ${scriptOutput.status}). User approval of the script is strictly required before downstream generation (Rule 13 / AC-F03-01).`,
      warnings: ['Blocked downstream generation: Script version is not approved.'],
    };
  }

  // 2. Precondition Check: Analysis must be approved (Rule 13 / Rule 28)
  if (analysis.review_status !== 'approved') {
    return {
      success: false,
      error: `Precondition Failed: Thumbnail prompts cannot be generated from an unapproved analysis version (status: ${analysis.review_status}). User approval of the source analysis is strictly required (Rule 13 / Rule 28).`,
      warnings: ['Blocked downstream generation: Analysis version is not approved.'],
    };
  }

  // 3. Precondition Check: Project ID match
  if (project.project_id !== scriptOutput.project_id) {
    return {
      success: false,
      error: `Mismatched project ID: Script belongs to project ${scriptOutput.project_id}, but current project is ${project.project_id}.`,
      warnings: [],
    };
  }

  if (project.project_id !== analysis.project_id) {
    return {
      success: false,
      error: `Mismatched project ID: Analysis belongs to project ${analysis.project_id}, but current project is ${project.project_id}.`,
      warnings: [],
    };
  }

  // 4. Precondition Check: Segments must exist
  const segments = scriptContent.segments || [];
  if (segments.length === 0) {
    return {
      success: false,
      error: 'Cannot generate Thumbnail prompts: The approved script contains zero segments.',
      warnings: [],
    };
  }

  const isHindi = project.master_language === 'hi';
  const aspectRatio = project.aspect_ratio;
  const isVerticalShorts = aspectRatio === '9:16';

  // Grounding extraction from approved analysis and script
  const seg1 = segments[0];
  const cleanSummary = sanitizeNonClickable(analysis.sections.source_summary || '');
  const cleanCoreClaims = sanitizeNonClickable(analysis.sections.main_story_core_claims || '');
  const cleanKeyFacts = sanitizeNonClickable(analysis.sections.key_facts_with_evidence || '');
  const cleanSeg1Visual = sanitizeNonClickable(seg1.visual_direction || '');
  const cleanSeg1Text = sanitizeNonClickable(seg1.on_screen_text || '');
  const cleanTitle = sanitizeNonClickable(titleContext || project.name || '');

  // Extract primary entity or subject keywords
  const firstFactMatch = cleanKeyFacts.slice(0, 120);

  // Safe Space Guidance according to Aspect Ratio (AC-F03-04)
  const safeSpaceGuidanceA = isVerticalShorts
    ? 'Vertical 9:16 Safe Zone: Central vertical column. Top 15% and bottom 20% reserved for YouTube Shorts channel overlays, captions, and title. Right 15% reserved for interaction buttons (Like, Comment, Share). Place key dramatic focal subject and high-contrast headline strictly in the central 65% safe window.'
    : 'Widescreen 16:9 Safe Zone: Left 65% and top-left/top-center power points. Bottom-right corner (approx 20% width × 15% height) strictly avoided to prevent occlusion by the YouTube video timestamp/duration badge. Place high-impact headline in the upper-left quadrant with clear background contrast.';

  const safeSpaceGuidanceB = isVerticalShorts
    ? 'Vertical 9:16 Safe Zone: Center-weighted vertical framing. Safe margins of 15% from top and 20% from bottom (Shorts UI overlay buffers). Center discovery relic/focal subject illuminated within vertical thirds; mystery headline placed below top buffer.'
    : 'Widescreen 16:9 Safe Zone: Central and lower-left thirds. Bottom-right corner strictly clear of focal details and text to avoid YouTube timestamp overlay occlusion. Atmospheric environmental scale extends across widescreen canvas.';

  // ----------------------------------------------------
  // OPTION A: High-Impact / Suspenseful / Dramatic Concept
  // ----------------------------------------------------
  const conceptLabelA = isHindi
    ? 'विकल्प A: उच्च-प्रभाव नाटकीय संघर्ष और रहस्य (High-Impact Dramatic)'
    : 'Option A: High-Impact Dramatic Clash & Tension';

  const headlineA = isHindi
    ? (cleanSeg1Text ? `${cleanSeg1Text.slice(0, 25)}!` : 'बड़ा खुलासा: अनदेखा सच!')
    : (cleanSeg1Text ? `${cleanSeg1Text.slice(0, 30)}!` : 'SHOCKING TRUTH REVEALED!');

  const mainSubjectA = isHindi
    ? `तीव्र नाटकीय केंद्रबिंदु: ${cleanSeg1Visual || cleanCoreClaims.slice(0, 100) || 'स्रोत-आधारित मुख्य विषय'} का क्लोज-अप दृश्य, जो दर्शकों में तुरंत भावनात्मक सस्पेंस और जिज्ञासा पैदा करे।`
    : `High-tension focal subject: Close-up dramatic framing of ${cleanSeg1Visual || cleanCoreClaims.slice(0, 120) || 'the central source-documented subject'}, capturing an intense turning point with powerful emotional urgency.`;

  const cameraPerspectiveA = isVerticalShorts
    ? 'Vertical 9:16 dynamic low-angle heroic perspective, 28mm wide-angle lens close to subject, shallow depth of field isolating the high-tension focal subject against a brooding background.'
    : 'Cinematic widescreen 16:9 dramatic low-angle perspective, 24mm anamorphic lens, off-center heroic focal point with strong diagonal leading lines and deep atmospheric depth.';

  const compositionA = isVerticalShorts
    ? 'Vertical 9:16 composition: Subject positioned in the dynamic upper-middle third power zone. Strong diagonal shadow lines cutting across the frame. Clear negative space above or below subject allocated for bold high-contrast text.'
    : 'Cinematic 16:9 widescreen composition: High-contrast diagonal composition using rule-of-thirds power axis. Primary subject in left/center third, dark vignette and volumetric rim lighting directing viewer eyes straight to the focal revelation.';

  const lightingColorA = 
    'High-contrast chiaroscuro lighting. Piercing high-intensity amber and crimson rim light cutting through cool obsidian shadows. Volumetric smoke/atmosphere creating immediate suspense and thumb-stopping visual urgency.';

  const textPlacementA = 
    `Bold high-impact condensed block headline in ${isHindi ? 'Hindi' : 'English'}: "${headlineA}". Positioned with dark backing plate or high-contrast drop-shadow to guarantee 100% mobile readability even at 100px thumbnail size. Placed within safe zone away from platform UI badges.`;

  const visualStyleA = 'Photorealistic cinematic documentary grade, razor-sharp focus on subject eyes and texture, gritty authentic realism, 8k resolution feel.';

  const promptTextA = [
    `[THUMBNAIL PROMPT OPTION A — HIGH-IMPACT / DRAMATIC | Aspect Ratio: ${aspectRatio}]`,
    `CONCEPT: ${conceptLabelA}`,
    `MAIN SUBJECT: ${mainSubjectA}`,
    `COMPOSITION & HIERARCHY: ${compositionA}`,
    `CAMERA & PERSPECTIVE: ${cameraPerspectiveA}`,
    `LIGHTING & COLOR PALETTE: ${lightingColorA}`,
    `TEXT & MOBILE READABILITY: ${textPlacementA}`,
    `SAFE SPACE GUIDANCE: ${safeSpaceGuidanceA}`,
    `VISUAL STYLE: ${visualStyleA}`,
    `GROUNDED SOURCE CONTEXT: ${cleanSummary ? cleanSummary.slice(0, 150) : firstFactMatch}`,
    THUMBNAIL_NEGATIVE_CONSTRAINTS_DEFAULT,
    `NOTICE: Text prompt only. Generated strictly for thumbnail image prompt construction; no image file is created.`
  ].join('\n\n');

  const optionA: ThumbnailConcept = {
    concept_label: conceptLabelA,
    prompt_text: promptTextA,
    main_subject: mainSubjectA,
    composition: compositionA,
    lighting_color: lightingColorA,
    text_headline_placement: textPlacementA,
    aspect_ratio: aspectRatio,
    camera_perspective: cameraPerspectiveA,
    safe_space_guidance: safeSpaceGuidanceA,
    negative_constraints: THUMBNAIL_NEGATIVE_CONSTRAINTS_DEFAULT,
    suggested_headline: headlineA,
    visual_style: visualStyleA,
    warnings: isHindi ? ['Master Language is Hindi. Keep on-screen thumbnail text in Hindi.'] : [],
  };

  // ----------------------------------------------------
  // OPTION B: Mystery / Discovery / Cinematic Storytelling Concept
  // ----------------------------------------------------
  const conceptLabelB = isHindi
    ? 'विकल्प B: रहस्य और सिनेमैटिक खोज (Mystery & Cinematic Discovery)'
    : 'Option B: Mystery & Cinematic Discovery';

  const headlineB = isHindi
    ? 'रहस्यमयी सबूत: क्या था असली सच?'
    : 'THE UNTOLD MYSTERY: WHAT HAPPENED?';

  const mainSubjectB = isHindi
    ? `सिनेमैटिक खोज का रहस्य: ${cleanKeyFacts.slice(0, 100) || cleanSummary.slice(0, 100) || 'दस्तावेजी साक्ष्य और प्राचीन खोज'} का रहस्यमयी वातावरण में प्रदर्शन, जो गहन जिज्ञासा और खोज की भावना जगाए।`
    : `Atmospheric discovery centerpiece: ${cleanKeyFacts.slice(0, 120) || cleanSummary.slice(0, 120) || 'Documented historical/archaeological evidence'}, shrouded in atmospheric mystery and glowing with inquisitive narrative depth.`;

  const cameraPerspectiveB = isVerticalShorts
    ? 'Vertical 9:16 eye-level to slight high-angle atmospheric shot, 35mm documentary prime lens, deep focus capturing textured environmental details and the illuminated mystery subject.'
    : 'Cinematic widescreen 16:9 panoramic establishing perspective, 50mm cinematic anamorphic lens, atmospheric mist layering foreground silhouettes, midground discovery, and distant vanishing horizon.';

  const compositionB = isVerticalShorts
    ? 'Vertical 9:16 layered composition: Foreground silhouette elements framing the lower boundary, illuminated mysterious evidence centered in the middle third, atmospheric hazy background leading eye inward.'
    : 'Cinematic 16:9 widescreen composition: Golden spiral focal arrangement. Foreground explorer/observer silhouette in lower corner looking toward glowing mystery discovery in the center-right; deep atmospheric perspective.';

  const lightingColorB = 
    'Moody atmospheric twilight illumination. Cool deep cobalt blue and slate-teal ambient environment contrasted with an ethereal warm golden luminescence radiating from the central discovery. Volumetric light rays piercing through atmospheric mist.';

  const textPlacementB = 
    `Intrigue-driven cinematic typography in ${isHindi ? 'Hindi' : 'English'}: "${headlineB}". Placed within designated negative space with subtle glow or semi-opaque backing, fully legible on mobile screen sizes.`;

  const visualStyleB = 'Cinematic narrative documentary style, atmospheric volumetric lighting, painterly realism with tactile surface textures, 8k resolution aesthetic.';

  const promptTextB = [
    `[THUMBNAIL PROMPT OPTION B — MYSTERY / CINEMATIC DISCOVERY | Aspect Ratio: ${aspectRatio}]`,
    `CONCEPT: ${conceptLabelB}`,
    `MAIN SUBJECT: ${mainSubjectB}`,
    `COMPOSITION & HIERARCHY: ${compositionB}`,
    `CAMERA & PERSPECTIVE: ${cameraPerspectiveB}`,
    `LIGHTING & COLOR PALETTE: ${lightingColorB}`,
    `TEXT & MOBILE READABILITY: ${textPlacementB}`,
    `SAFE SPACE GUIDANCE: ${safeSpaceGuidanceB}`,
    `VISUAL STYLE: ${visualStyleB}`,
    `GROUNDED SOURCE CONTEXT: ${cleanCoreClaims ? cleanCoreClaims.slice(0, 150) : firstFactMatch}`,
    THUMBNAIL_NEGATIVE_CONSTRAINTS_DEFAULT,
    `NOTICE: Text prompt only. Generated strictly for thumbnail image prompt construction; no image file is created.`
  ].join('\n\n');

  const optionB: ThumbnailConcept = {
    concept_label: conceptLabelB,
    prompt_text: promptTextB,
    main_subject: mainSubjectB,
    composition: compositionB,
    lighting_color: lightingColorB,
    text_headline_placement: textPlacementB,
    aspect_ratio: aspectRatio,
    camera_perspective: cameraPerspectiveB,
    safe_space_guidance: safeSpaceGuidanceB,
    negative_constraints: THUMBNAIL_NEGATIVE_CONSTRAINTS_DEFAULT,
    suggested_headline: headlineB,
    visual_style: visualStyleB,
    warnings: isHindi ? ['Master Language is Hindi. Keep on-screen thumbnail text in Hindi.'] : [],
  };

  // Verify zero clickable links exist in either prompt (AC-F03-05 / Rule 30)
  if (/https?:\/\/|www\./i.test(promptTextA) || /https?:\/\/|www\./i.test(promptTextB)) {
    warnings.push('Stripped URL pattern detected in thumbnail prompts to maintain non-clickable compliance (AC-F03-05).');
  }

  return {
    success: true,
    content: {
      option_a: optionA,
      option_b: optionB,
      disclaimer: THUMBNAIL_PROMPT_DISCLAIMER,
      script_version_id: scriptOutput.output_id,
      analysis_version_id: analysis.analysis_version_id,
      title_context: cleanTitle || undefined,
    },
    warnings,
  };
}
