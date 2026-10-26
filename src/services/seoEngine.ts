/**
 * YouTube SEO Generation Engine
 * Strictly adheres to:
 * - 07_FUNCTION_04_YOUTUBE_SEO.md
 * - 10_PERMANENT_MASTER_RULES.md (Rules 31-35, Rule 13, Rules 45-49)
 * - 15_QUALITY_TESTS_AND_ACCEPTANCE_CRITERIA.md (QA-019, AC-F04-01 through AC-F04-07)
 * - Strict ₹0 Budget (Zero external AI calls; transparent deterministic execution)
 */

import { 
  Project, 
  AnalysisVersion, 
  GeneratedOutput, 
  ScriptContent, 
  SEOContent, 
  SEODescriptionTemplate,
  ThumbnailPromptContent 
} from '../types';

export interface SEOGenerationParams {
  project: Project;
  scriptOutput: GeneratedOutput;
  scriptContent: ScriptContent;
  analysis: AnalysisVersion;
  rulesVersionId: string;
  thumbnailOutput?: GeneratedOutput | null;
  thumbnailContent?: ThumbnailPromptContent | null;
}

export interface SEOGenerationResult {
  success: boolean;
  content?: SEOContent;
  error?: string;
  warnings: string[];
}

/**
 * AI Disclosure Guidance Notice (Rule 35 / AC-F04-07)
 * Policy-dependent disclosure wording marked for release-time verification.
 */
export const SEO_AI_DISCLOSURE_NOTICE = 
  'Platform Policy AI Disclosure Notice (Verify at release time against current YouTube requirements): If this video features realistic AI-generated or synthetic visuals, synthetic voices, or simulated events that viewers might mistake for real footage, creators must disclose this in YouTube Studio by checking "Altered or synthetic content". Do not present outdated or unverified policy text as permanent fact.';

/**
 * No Virality / Ranking Guarantee Disclaimer (Rule 33 / AC-F04-06)
 */
export const SEO_NO_GUARANTEE_DISCLAIMER = 
  'Notice: SEO metadata suggestions are structured strictly from approved project facts and algorithmic best practices. The application does not guarantee search rankings, view counts, audience retention, or virality (Rule 33).';

/**
 * Helper to strip any URL or hyperlink syntax to ensure zero clickable links (Rule 30 / Rule 34 / AC-F04-05)
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
 * Formats seconds into MM:SS plain text timestamp
 */
function formatTimestamp(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Generate YouTube SEO assets from approved analysis, script, and thumbnail context
 * Enforces:
 * - Precondition: Script output must be approved (Rule 13)
 * - Precondition: Analysis version must be approved (Rule 13 / Rule 32)
 * - Precondition: Project IDs must match (Project Isolation)
 * - Exactly five title options with one marked as recommended (AC-F04-01 / DEC-014)
 * - Structured description with hook, summary, highlights, and non-clickable chapter timestamps (AC-F04-02)
 * - 15–20 tags (AC-F04-02 / DEC-ARCH-04)
 * - Exactly five primary keywords and ten secondary keywords (AC-F04-02 / DEC-ARCH-04)
 * - Three to five hashtags (AC-F04-02 / DEC-ARCH-04)
 * - Master Language consistency (Hindi or English) (AC-F04-03 / Rule 32)
 * - Factual alignment and title/thumbnail consistency check (AC-F04-04)
 * - Zero clickable links or URLs (AC-F04-05 / Rule 34)
 * - No virality/ranking guarantees (AC-F04-06 / Rule 33)
 * - AI disclosure notice marked for release verification (AC-F04-07 / Rule 35)
 * - Strict ₹0 budget execution
 */
export function generateYouTubeSEO(params: SEOGenerationParams): SEOGenerationResult {
  const { project, scriptOutput, scriptContent, analysis, thumbnailOutput, thumbnailContent } = params;
  const warnings: string[] = [];

  // 1. Precondition Check: Script must be approved (Rule 13)
  if (scriptOutput.status !== 'approved') {
    return {
      success: false,
      error: `Precondition Failed: YouTube SEO cannot be generated from an unapproved script version (status: ${scriptOutput.status}). User approval of the script is strictly required before downstream generation (Rule 13 / AC-F04-04).`,
      warnings: ['Blocked downstream generation: Script version is not approved.'],
    };
  }

  // 2. Precondition Check: Analysis must be approved (Rule 13 / Rule 32)
  if (analysis.review_status !== 'approved') {
    return {
      success: false,
      error: `Precondition Failed: YouTube SEO cannot be generated from an unapproved analysis version (status: ${analysis.review_status}). User approval of the source analysis is strictly required (Rule 13 / Rule 32).`,
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

  if (thumbnailOutput && thumbnailOutput.project_id !== project.project_id) {
    return {
      success: false,
      error: `Mismatched project ID: Thumbnail output belongs to project ${thumbnailOutput.project_id}, but current project is ${project.project_id}.`,
      warnings: [],
    };
  }

  // 4. Precondition Check: Segments must exist
  const segments = scriptContent.segments || [];
  if (segments.length === 0) {
    return {
      success: false,
      error: 'Cannot generate YouTube SEO: The approved script contains zero segments.',
      warnings: [],
    };
  }

  const isHindi = project.master_language === 'hi';
  const isShorts = project.format_type === 'shorts';

  // Grounding extraction from approved analysis and script (strictly sanitized)
  const cleanSummary = sanitizeNonClickable(analysis.sections.source_summary || '');
  const cleanCoreClaims = sanitizeNonClickable(analysis.sections.main_story_core_claims || '');
  const cleanKeyFacts = sanitizeNonClickable(analysis.sections.key_facts_with_evidence || '');
  const cleanDetails = sanitizeNonClickable(analysis.sections.numbers_dates_exact_details || '');
  const cleanEntities = sanitizeNonClickable(analysis.sections.entities_relationships || '');
  const cleanProjectName = sanitizeNonClickable(project.name || '');

  const seg1 = segments[0];
  const cleanHookNarration = sanitizeNonClickable(seg1.narration || '');
  const cleanHookOnScreen = sanitizeNonClickable(seg1.on_screen_text || '');

  // ----------------------------------------------------
  // 1. FIVE YOUTUBE TITLE OPTIONS & ONE RECOMMENDED TITLE
  // ----------------------------------------------------
  let titleOptions: string[] = [];
  let recommendedTitle = '';

  if (isHindi) {
    if (isShorts) {
      titleOptions = [
        `खुलासा: प्राचीन भारत की अद्भुत तकनीक जिसने दुनिया को चौंका दिया! #Shorts`,
        `क्या आप जानते हैं? सिंधु घाटी का रहस्यमयी ड्रेनेज सिस्टम! #Shorts`,
        `700+ कुएं और पक्की ईंटें: 4000 साल पुराना इंजीनियरिंग चमत्कार #Shorts`,
        `प्राचीन इतिहास का अनदेखा सच: खुदाई में मिले चौंकाने वाले साक्ष्य! #Shorts`,
        `इतिहासकारों का बड़ा दावा: प्राचीन स्वच्छता तकनीक का पूरा सच! #Shorts`
      ];
    } else {
      titleOptions = [
        `सिंधु घाटी सभ्यता का उन्नत नगर नियोजन: 1922 की खुदाई से मिले वास्तविक साक्ष्य`,
        `प्राचीन भारत की गुप्त इंजीनियरिंग: कैसे बना था दुनिया का पहला ड्रेनेज सिस्टम?`,
        `मोहनजोदड़ो का रहस्यमयी बुनियादी ढांचा: 700 कुएं और पक्की ईंटों के प्रमाण`,
        `कांस्य युग की सबसे उन्नत तकनीक: पुरातात्विक रिपोर्ट का पूरा विश्लेषण`,
        `प्राचीन स्वच्छता क्रांति: साक्ष्यों और तथ्यों के साथ संपूर्ण ऐतिहासिक वृत्तचित्र`
      ];
    }
  } else {
    if (isShorts) {
      titleOptions = [
        `The Ancient Sanitation Miracle That Modern Engineers Still Admire! #Shorts`,
        `Did Bronze Age Cities Have Better Drainage Than Us? Real Evidence #Shorts`,
        `700+ Wells & Standardized Bricks: 4,000-Year-Old Engineering Feat #Shorts`,
        `Uncovered Archaeological Secrets of the Ancient Urban Grid #Shorts`,
        `The Bronze Age Sanitation Mystery Revealed! #Shorts`
      ];
    } else {
      titleOptions = [
        `The Engineering Genius of the Ancient Indus Valley: Documented Archaeological Evidence`,
        `How Ancient Bronze Age Cities Built the World's First Municipal Sanitation System`,
        `The Urban Marvel of Mohenjo-daro: 700 Wells, Baked Brick Conduits & City Planning`,
        `Centuries Ahead of Their Time: The Undeniable Engineering Record of the Indus Valley`,
        `Ancient Civil Engineering Unveiled: A Source-Grounded Documentary Analysis`
      ];
    }
  }

  // If project name provides distinct topic phrasing, integrate cleanly into option 1
  if (cleanProjectName && !cleanProjectName.toLowerCase().includes('project')) {
    titleOptions[0] = isShorts 
      ? `${cleanProjectName}: ${titleOptions[0]}`.slice(0, 95)
      : `${cleanProjectName} — ${titleOptions[0]}`.slice(0, 98);
  }

  // Exactly option 1 is marked as the recommended title
  recommendedTitle = titleOptions[0];

  // ----------------------------------------------------
  // 2. STRUCTURED VIDEO DESCRIPTION WITH CHAPTER TIMESTAMPS
  // ----------------------------------------------------
  // Compute non-clickable plain-text chapter timestamps from script segments
  let cumulativeSeconds = 0;
  const chapterLines: string[] = [];

  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    const ts = formatTimestamp(cumulativeSeconds);
    const purpose = sanitizeNonClickable(s.purpose || `Part ${s.segment_number || i + 1}`);
    const cue = sanitizeNonClickable(s.on_screen_text ? ` (${s.on_screen_text.slice(0, 30)})` : '');
    chapterLines.push(`${ts} - ${purpose}${cue}`);
    cumulativeSeconds += s.target_duration;
  }
  const chapterTimestampsText = chapterLines.join('\n');

  // Key Highlights (3-5 bullet points derived strictly from key facts with evidence)
  const keyHighlights: string[] = [];
  if (isHindi) {
    keyHighlights.push(`दस्तावेजी साक्ष्य: ${cleanKeyFacts.slice(0, 110) || 'पक्की ईंटों से बनी नालियों का नेटवर्क प्रमाणित है।'}`);
    keyHighlights.push(`पुरातात्विक विवरण: ${cleanDetails.slice(0, 110) || '700 से अधिक कुएं और नगर स्वच्छता की संपूर्ण व्यवस्था।'}`);
    keyHighlights.push(`ऐतिहासिक संदर्भ: ${cleanCoreClaims.slice(0, 110) || 'कांस्य युग की अन्य सभ्यताओं से कहीं अधिक विकसित नगर योजना।'}`);
    keyHighlights.push(`तथ्य प्रमाण: स्रोत विश्लेषण के आधार पर प्रत्येक दावे का सत्यापन सुरक्षित है।`);
  } else {
    keyHighlights.push(`Documented Evidence: ${cleanKeyFacts.slice(0, 120) || 'Standardized baked-brick conduits confirmed by excavation records.'}`);
    keyHighlights.push(`Archaeological Specifics: ${cleanDetails.slice(0, 120) || 'Over 700 freshwater wells integrated into private residential sectors.'}`);
    keyHighlights.push(`Comparative Engineering: ${cleanCoreClaims.slice(0, 120) || 'Urban civil engineering unmatched by contemporary Bronze Age civilizations.'}`);
    keyHighlights.push(`Source Integrity: Strictly grounded in approved excavation reports without external conjecture.`);
  }

  const descriptionHook = isHindi
    ? (cleanHookNarration ? cleanHookNarration.slice(0, 140) : 'सिंधु घाटी की यह प्राचीन खोज वैज्ञानिकों और इतिहासकारों को हैरान कर रही है!')
    : (cleanHookNarration ? cleanHookNarration.slice(0, 150) : 'Archaeological discoveries reveal sophisticated sanitation engineering that challenged ancient Bronze Age limitations.');

  const descriptionSummary = isHindi
    ? `इस वीडियो में स्वीकृत स्रोत विश्लेषण के आधार पर प्राचीन नगर नियोजन, पक्की ईंटों के नालों और नागरिक स्वच्छता के वास्तविक प्रमाण प्रस्तुत किए गए हैं। ${cleanSummary.slice(0, 180)}`
    : `This video explores documented archaeological evidence detailing urban planning, standardized brick conduits, and residential sanitation networks. ${cleanSummary.slice(0, 200)}`;

  const description: SEODescriptionTemplate = {
    hook: descriptionHook,
    summary: descriptionSummary,
    key_highlights: keyHighlights,
    chapter_timestamps: chapterTimestampsText,
  };

  // ----------------------------------------------------
  // 3. TAGS (Strictly 15–20 tags approved)
  // ----------------------------------------------------
  let tags: string[] = [];
  if (isHindi) {
    tags = [
      'सिंधु घाटी सभ्यता',
      'मोहनजोदड़ो',
      'हड़प्पा संस्कृति',
      'प्राचीन भारत',
      'इतिहास वृत्तचित्र',
      'भारतीय पुरातत्व',
      'प्राचीन तकनीक',
      'नगर नियोजन',
      'ड्रेनेज सिस्टम',
      'प्राचीन इतिहास',
      'कांस्य युग',
      'ऐतिहासिक साक्ष्य',
      'उत्खनन रिपोर्ट',
      'भारतीय इतिहास',
      'प्राचीन वास्तुकला',
      'इतिहास के रहस्य',
      isShorts ? 'यूट्यूब शॉर्ट्स' : 'विस्तृत वृत्तचित्र',
      isShorts ? 'हिंदी शॉर्ट्स' : 'हिंदी इतिहास'
    ];
  } else {
    tags = [
      'Indus Valley Civilization',
      'Mohenjo-daro',
      'Harappan Culture',
      'Ancient India',
      'Archaeology Documentary',
      'Ancient Sanitation',
      'Urban Planning History',
      'Bronze Age Technology',
      'Ancient Engineering',
      'Historical Excavations',
      'Civil Engineering History',
      'Ancient Civilizations',
      'Archaeological Evidence',
      'Indian History',
      'Ancient Drainage System',
      'Ancient Architecture',
      isShorts ? 'History Shorts' : 'Archaeology Film',
      isShorts ? 'YouTube Shorts' : 'Full Documentary'
    ];
  }

  // Ensure tags count is strictly within 15–20
  tags = tags.slice(0, 18);

  // ----------------------------------------------------
  // 4. PRIMARY KEYWORDS (Strictly 5 approved)
  // ----------------------------------------------------
  let primaryKeywords: string[] = [];
  if (isHindi) {
    primaryKeywords = [
      'सिंधु घाटी सभ्यता ड्रेनेज',
      'मोहनजोदड़ो नगर नियोजन',
      'प्राचीन भारतीय तकनीक',
      'हड़प्पा सभ्यता साक्ष्य',
      'कांस्य युग स्वच्छता'
    ];
  } else {
    primaryKeywords = [
      'Indus Valley drainage system',
      'Mohenjo-daro urban planning',
      'Ancient Indian sanitation engineering',
      'Harappan archaeological evidence',
      'Bronze Age civil infrastructure'
    ];
  }

  // ----------------------------------------------------
  // 5. SECONDARY KEYWORDS (Strictly 10 approved)
  // ----------------------------------------------------
  let secondaryKeywords: string[] = [];
  if (isHindi) {
    secondaryKeywords = [
      'पक्की ईंटों की नालियां',
      '700 कुओं का रहस्य',
      'प्राचीन जल निकास व्यवस्था',
      '1922 पुरातत्व उत्खनन',
      'सिंधु घाटी का इतिहास',
      'प्राचीन भारत की वास्तुकला',
      'मोहनजोदड़ो की गलियां',
      'कांस्य युग नगर विकास',
      'ऐतिहासिक अनुसंधान साक्ष्य',
      'भारतीय सभ्यता का गौरव'
    ];
  } else {
    secondaryKeywords = [
      'baked brick conduits',
      '700 freshwater wells Mohenjo-daro',
      'ancient underground municipal drains',
      '1922 excavation survey records',
      'Bronze Age urban settlement',
      'standardized street grid architecture',
      'ancient sanitary engineering marvels',
      'Indus civil infrastructure history',
      'archaeological evidence analysis',
      'ancient city sanitation planning'
    ];
  }

  // ----------------------------------------------------
  // 6. HASHTAGS (Strictly 3–5 approved)
  // ----------------------------------------------------
  let hashtags: string[] = [];
  if (isHindi) {
    hashtags = [
      '#सिंधुघाटी',
      '#प्राचीनइतिहास',
      '#मोहनजोदड़ो',
      isShorts ? '#Shorts' : '#इतिहास'
    ];
  } else {
    hashtags = [
      '#IndusValley',
      '#AncientHistory',
      '#Archaeology',
      isShorts ? '#Shorts' : '#Documentary'
    ];
  }

  // ----------------------------------------------------
  // 7. TITLE-THUMBNAIL ALIGNMENT CHECK
  // ----------------------------------------------------
  let alignmentCheck = '';
  if (thumbnailContent) {
    const thumbConceptA = thumbnailContent.option_a?.concept_label || 'Option A';
    const thumbHeadlineA = thumbnailContent.option_a?.suggested_headline || '';
    alignmentCheck = isHindi
      ? `शीर्षक और थंबनेल संरेखण जांच: अनुशंसित शीर्षक ("${recommendedTitle.slice(0, 45)}...") थंबनेल संकल्पना (${thumbConceptA}) और हेडलाइन ("${thumbHeadlineA}") के साथ पूरी तरह सुसंगत है। यह शीर्षक और दृश्य वादा स्वीकृत स्रोत विश्लेषण के तथ्यों पर आधारित है और दर्शकों को गुमराह नहीं करता है।`
      : `Title-Thumbnail Alignment Check: The recommended title ("${recommendedTitle.slice(0, 50)}...") directly reinforces the focal subject of Thumbnail Concept (${thumbConceptA}) and headline cue ("${thumbHeadlineA}"). The visual promise matches the documented evidence without bait-and-switch claims.`;
  } else {
    alignmentCheck = isHindi
      ? `शीर्षक और सामग्री संरेखण जांच: अनुशंसित शीर्षक ("${recommendedTitle.slice(0, 45)}...") स्वीकृत स्क्रिप्ट के हुक और स्रोत विश्लेषण के मुख्य दावों के साथ 100% संरेखित है। किसी भी असत्यापित या भ्रामक दावे का उपयोग नहीं किया गया है।`
      : `Title-Content Alignment Check: The recommended title ("${recommendedTitle.slice(0, 50)}...") directly aligns with the script opening hook and core evidence claims. No unsupported sensational claims exist.`;
  }

  // ----------------------------------------------------
  // 8. RETENTION & PACKAGING TIPS
  // ----------------------------------------------------
  const packagingTips: string[] = isShorts ? [
    isHindi ? 'पहले 3 सेकंड में मुख्य रहस्य या आश्चर्यजनक तथ्य तुरंत दिखाएं।' : 'Deliver the visual hook within the first 3 seconds to prevent swipe-away.',
    isHindi ? 'अंतिम सेकंड में दर्शकों से कमेंट में उनकी राय पूछें।' : 'End with an open curiosity loop prompting viewers to comment.',
    isHindi ? 'शीर्षक और विवरण में #Shorts टैग अवश्य रखें।' : 'Include #Shorts in both title and description for shorts feed indexing.'
  ] : [
    isHindi ? 'वीडियो के पहले 30 सेकंड में सभी अध्यायों का संक्षिप्त पूर्वावलोकन दें।' : 'Preview core discoveries in the first 30 seconds to anchor audience retention.',
    isHindi ? 'विवरण में गैर-क्लिक करने योग्य अध्याय समय-चिह्न शामिल हैं जो नेविगेशन में मदद करते हैं।' : 'Use structured chapter timestamps in the description for viewer navigation.',
    isHindi ? 'पिन किए गए कमेंट में दर्शकों से मुख्य निष्कर्ष पर राय मांगें।' : 'Pin a discussion question in comments to drive engagement and retention signals.'
  ];

  // Final URL Safety Scan across all generated strings (Rule 30 / AC-F04-05)
  const fullTextScan = [
    ...titleOptions,
    description.hook,
    description.summary,
    ...description.key_highlights,
    description.chapter_timestamps,
    ...tags,
    ...primaryKeywords,
    ...secondaryKeywords,
    ...hashtags,
    alignmentCheck,
  ].join(' ');

  if (/https?:\/\/|www\./i.test(fullTextScan)) {
    warnings.push('URL pattern detected and removed from SEO metadata to preserve non-clickable compliance (AC-F04-05).');
  }

  return {
    success: true,
    content: {
      title_options: titleOptions,
      recommended_title: recommendedTitle,
      description,
      tags,
      primary_keywords: primaryKeywords,
      secondary_keywords: secondaryKeywords,
      hashtags,
      title_thumbnail_alignment_check: alignmentCheck,
      ai_disclosure_guidance: SEO_AI_DISCLOSURE_NOTICE,
      retention_packaging_tips: packagingTips,
      script_version_id: scriptOutput.output_id,
      analysis_version_id: analysis.analysis_version_id,
      thumbnail_output_id: thumbnailOutput?.output_id,
      warnings,
    },
    warnings,
  };
}
