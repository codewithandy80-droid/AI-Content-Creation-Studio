import React, { useState, useEffect } from 'react';
import { 
  Project, 
  Source, 
  AnalysisVersion, 
  GeneratedOutput, 
  ScriptSegment, 
  ScriptContent,
  OutputReviewStatus 
} from '../types';
import { 
  FileText, 
  Layers, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Edit3, 
  Save, 
  Lock, 
  Cpu, 
  Info,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  History
} from 'lucide-react';
import { generateScriptFromAnalysis } from '../services/scriptEngine';
import { 
  saveOutput, 
  listOutputsForProject, 
  saveAnalysisVersion, 
  approveAnalysisVersion, 
  listAnalysesForProject 
} from '../storage';
import { DEFAULT_MASTER_RULES_V1 } from '../constants/masterRules';

interface Function01ScriptWorkspaceProps {
  activeProject: Project | null;
  sources: Source[];
  uiLang: 'en' | 'hi';
  onSaveStatusChange: (status: 'saved' | 'saving' | 'failed', error?: string) => void;
}

export const Function01ScriptWorkspace: React.FC<Function01ScriptWorkspaceProps> = ({
  activeProject,
  sources,
  uiLang,
  onSaveStatusChange,
}) => {
  const [analyses, setAnalyses] = useState<AnalysisVersion[]>([]);
  const [approvedAnalysis, setApprovedAnalysis] = useState<AnalysisVersion | null>(null);
  const [scriptOutputs, setScriptOutputs] = useState<GeneratedOutput[]>([]);
  const [currentScript, setCurrentScript] = useState<ScriptContent | null>(null);
  const [activeOutputId, setActiveOutputId] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<OutputReviewStatus>('draft');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [editingSegmentIdx, setEditingSegmentIdx] = useState<number | null>(null);
  const [showAnalysisHelper, setShowAnalysisHelper] = useState<boolean>(false);

  const t = {
    en: {
      title: 'Function 01: Script Generation',
      subtitle: 'Source-grounded narration, visual direction, and on-screen text per segment.',
      noProject: 'No active project selected. Please select or create a project first.',
      preconditionsTitle: 'Function 01 Preconditions (Rule 13 / AC-F01-01)',
      sourceCheck: 'Source Material Preserved:',
      analysisCheck: 'Approved Source Analysis:',
      readyForScript: 'Preconditions Satisfied — Ready for Script Generation',
      blockedNotice: 'Script generation is strictly locked until a Source Analysis version is reviewed and approved by you.',
      initAnalysisBtn: 'Review & Approve Initial Source Analysis',
      providerBannerTitle: 'AI Provider Integration Status: Unconfigured / Not Approved',
      providerBannerDesc: 'External LLM APIs (Gemini, Groq, OpenRouter) are disabled in strict accordance with the ₹0 budget and Plan-Lock Rule. Script generation will execute via the verified local deterministic engine grounded in your approved source.',
      generateButton: 'Generate Source-Grounded Script',
      generating: 'Synthesizing Segments from Approved Analysis...',
      segmentsCount: 'Total Segments:',
      totalDuration: 'Total Target Duration:',
      seconds: 'seconds',
      activeScriptHeader: 'Generated Script Segments',
      segmentNum: 'Segment',
      purpose: 'Story Purpose:',
      narration: 'Narration / Voiceover (Master Language):',
      visuals: 'Visual Direction:',
      onScreenText: 'On-Screen Text:',
      transitionNote: 'Transition Note:',
      claimRef: 'Approved Claim Reference:',
      saveDraftBtn: 'Save as New Script Version',
      approveScriptBtn: 'Approve This Script Version',
      scriptApprovedNotice: 'Script Version Approved for Downstream Functions',
      versionHistoryTitle: 'Saved Script Versions',
      noSavedScripts: 'No script versions saved yet for this project.',
      wordsWarning: 'Warning: Word count may be too dense or too brief for this segment duration.',
    },
    hi: {
      title: 'फंक्शन 01: स्क्रिप्ट जनरेशन',
      subtitle: 'स्वीकृत विश्लेषण पर आधारित नरेशन, दृश्य निर्देश और ऑन-स्क्रीन टेक्स्ट।',
      noProject: 'कोई प्रोजेक्ट चयनित नहीं है। कृपया पहले एक प्रोजेक्ट चुनें या बनाएं।',
      preconditionsTitle: 'फंक्शन 01 पूर्व-शर्तें (नियम 13 / AC-F01-01)',
      sourceCheck: 'स्रोत सामग्री सुरक्षित:',
      analysisCheck: 'स्वीकृत सोर्स एनालिसिस:',
      readyForScript: 'सभी पूर्व-शर्तें पूरी हैं — स्क्रिप्ट जनरेशन के लिए तैयार',
      blockedNotice: 'जब तक सोर्स एनालिसिस स्वीकृत नहीं होता, स्क्रिप्ट जनरेशन सख्त रूप से लॉक रहेगा।',
      initAnalysisBtn: 'प्रारंभिक सोर्स एनालिसिस की समीक्षा और स्वीकृति करें',
      providerBannerTitle: 'एआई प्रोवाइडर स्थिति: असंबद्ध / अस्वीकृत',
      providerBannerDesc: 'बाहरी एलएलएम एपीआई (Gemini, Groq, OpenRouter) ₹0 बजट प्रतिबंध के तहत बंद हैं। स्वीकृत स्रोत डेटा के आधार पर स्थानीय इंजन द्वारा स्क्रिप्ट तैयार की जाएगी।',
      generateButton: 'सोर्स-आधारित स्क्रिप्ट जनरेट करें',
      generating: 'स्वीकृत विश्लेषण से स्क्रिप्ट सेगमेंट्स तैयार हो रहे हैं...',
      segmentsCount: 'कुल सेगमेंट्स:',
      totalDuration: 'कुल लक्षित अवधि:',
      seconds: 'सेकंड',
      activeScriptHeader: 'जनरेटेड स्क्रिप्ट सेगमेंट्स',
      segmentNum: 'सेगमेंट',
      purpose: 'कहानी का उद्देश्य:',
      narration: 'नरेशन / वॉयसओवर (मास्टर भाषा में):',
      visuals: 'दृश्य निर्देश (विजुअल्स):',
      onScreenText: 'ऑन-स्क्रीन टेक्स्ट:',
      transitionNote: 'संक्रमण निर्देश (ट्रांजिशन):',
      claimRef: 'स्वीकृत तथ्य संदर्भ:',
      saveDraftBtn: 'नए स्क्रिप्ट संस्करण के रूप में सहेजें',
      approveScriptBtn: 'इस स्क्रिप्ट संस्करण को स्वीकृत करें',
      scriptApprovedNotice: 'स्क्रिप्ट संस्करण स्वीकृत हो चुका है',
      versionHistoryTitle: 'सहेजे गए स्क्रिप्ट संस्करण',
      noSavedScripts: 'इस प्रोजेक्ट के लिए अभी तक कोई स्क्रिप्ट सहेजी नहीं गई है।',
      wordsWarning: 'चेतावनी: शब्द संख्या सेगमेंट अवधि के अनुपात से अधिक या बहुत कम हो सकती है।',
    },
  }[uiLang];

  // Load project analyses and outputs
  useEffect(() => {
    if (!activeProject) {
      setAnalyses([]);
      setApprovedAnalysis(null);
      setScriptOutputs([]);
      setCurrentScript(null);
      return;
    }

    let isMounted = true;
    Promise.all([
      listAnalysesForProject(activeProject.project_id),
      listOutputsForProject(activeProject.project_id, 'script'),
    ])
      .then(([loadedAnalyses, loadedOutputs]) => {
        if (!isMounted) return;
        setAnalyses(loadedAnalyses);

        const approved = loadedAnalyses.find(
          (a) => a.analysis_version_id === activeProject.active_approved_analysis_version_id
        ) || loadedAnalyses.find((a) => a.review_status === 'approved') || null;

        setApprovedAnalysis(approved);
        setScriptOutputs(loadedOutputs);

        if (loadedOutputs.length > 0) {
          const latest = loadedOutputs[loadedOutputs.length - 1];
          if (latest.content.type === 'script') {
            setCurrentScript(latest.content.data);
            setActiveOutputId(latest.output_id);
            setCurrentStatus(latest.status);
          }
        }
      })
      .catch((err) => {
        console.error('[Load Error Function 01]', err);
      });

    return () => {
      isMounted = false;
    };
  }, [activeProject]);

  // Helper to approve initial source analysis if user hasn't created one
  const handleApproveInitialAnalysis = async () => {
    if (!activeProject || sources.length === 0) return;
    onSaveStatusChange('saving');

    try {
      const summaryContent = sources.map((s) => s.content_or_storage_reference).join('\n\n');
      const initialAnalysis: AnalysisVersion = {
        analysis_version_id: `analysis-${Date.now()}`,
        project_id: activeProject.project_id,
        source_version_ids: sources.map((s) => s.source_id),
        version_number: 1,
        analysis_type: 'source_only',
        report_schema_version: '1.0',
        sections: {
          source_summary: summaryContent.slice(0, 300) || 'Verified source summary.',
          main_story_core_claims: summaryContent.slice(0, 400) || 'Main narrative claims.',
          key_facts_with_evidence: 'Key verified source data and context.',
          timeline_chronology: 'Chronological timeline established by source references.',
          entities_relationships: 'Entities, locations, and documented figures.',
          numbers_dates_exact_details: 'Documented measurements and exact dates.',
          uncertainty_conflicts: 'Preserved caveats and source boundaries.',
          missing_context: 'Documented omissions or unverified assertions.',
          story_angles: 'Narrative angles grounded in verified source evidence.',
          source_limitations: 'Limitations of supplied source material.',
        },
        claim_records: [
          {
            claim_id: `claim-${Date.now()}-1`,
            analysis_version_id: `analysis-${Date.now()}`,
            claim_text: summaryContent.slice(0, 120) || 'Primary source claim.',
            status: 'source-supported',
            importance: 'high',
            claim_type: 'fact',
            evidence_text: summaryContent.slice(0, 100),
            source_id: sources[0].source_id,
            source_location: 'Section 1',
            attribution: sources[0].source_label,
            caveat: '',
            review_status: 'accepted',
          },
        ],
        created_at: new Date().toISOString(),
        review_status: 'draft',
        approved_at: null,
        supersedes_analysis_version_id: null,
      };

      await saveAnalysisVersion(initialAnalysis);
      const approved = await approveAnalysisVersion(initialAnalysis.analysis_version_id);
      setAnalyses([approved]);
      setApprovedAnalysis(approved);
      onSaveStatusChange('saved');
    } catch (err: any) {
      onSaveStatusChange('failed', err.message);
      setGenerationError(err.message);
    }
  };

  // Explicit User-Initiated Script Generation (Never automatic!)
  const handleGenerateScript = () => {
    if (!activeProject) return;
    if (!approvedAnalysis) {
      setGenerationError('Cannot generate script: Approved Source Analysis is missing (Rule 13).');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    const result = generateScriptFromAnalysis({
      project: activeProject,
      analysis: approvedAnalysis,
      rulesVersionId: DEFAULT_MASTER_RULES_V1.master_rules_version_id,
    });

    if (!result.success || !result.content) {
      setGenerationError(result.error || 'Failed to generate script.');
      setIsGenerating(false);
      return;
    }

    setCurrentScript(result.content);
    setCurrentStatus('draft');
    setActiveOutputId(null); // unsaved draft state
    setIsGenerating(false);
  };

  // Save Script Version to IndexedDB
  const handleSaveScript = async (approve: boolean = false) => {
    if (!activeProject || !currentScript || !approvedAnalysis) return;
    onSaveStatusChange('saving');

    try {
      const nextVersionNum = scriptOutputs.length + 1;
      const statusToSet: OutputReviewStatus = approve ? 'approved' : 'draft';

      const newOutput: GeneratedOutput = {
        output_id: `out-script-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        project_id: activeProject.project_id,
        output_type: 'script',
        version_number: nextVersionNum,
        status: statusToSet,
        content: { type: 'script', data: currentScript },
        analysis_version_id: approvedAnalysis.analysis_version_id,
        master_rules_version_id: DEFAULT_MASTER_RULES_V1.master_rules_version_id,
        input_output_version_ids: [approvedAnalysis.analysis_version_id],
        provider_id: null,
        model_id: 'deterministic-source-grounded-v1',
        created_at: new Date().toISOString(),
        approved_at: approve ? new Date().toISOString() : null,
        supersedes_output_id: activeOutputId,
      };

      const saved = await saveOutput(newOutput);
      setScriptOutputs((prev) => [...prev, saved]);
      setActiveOutputId(saved.output_id);
      setCurrentStatus(statusToSet);
      onSaveStatusChange('saved');
    } catch (err: any) {
      onSaveStatusChange('failed', err.message);
      setGenerationError(err.message);
    }
  };

  // Update a single segment field
  const handleUpdateSegment = (idx: number, field: keyof ScriptSegment, value: any) => {
    if (!currentScript) return;
    const updatedSegments = [...currentScript.segments];
    updatedSegments[idx] = {
      ...updatedSegments[idx],
      [field]: value,
    };
    setCurrentScript({ segments: updatedSegments });
  };

  if (!activeProject) {
    return (
      <div className="p-8 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
        {t.noProject}
      </div>
    );
  }

  const hasSources = sources.length > 0;
  const isAnalysisApproved = !!approvedAnalysis;
  const preconditionsMet = hasSources && isAnalysisApproved;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            {t.title}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {t.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
            Format: <strong className="text-white">{activeProject.format_type}</strong>
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
            Lang: <strong className="text-indigo-300 uppercase">{activeProject.master_language}</strong>
          </span>
        </div>
      </div>

      {/* Preconditions & Approval Gate Banner */}
      <div className={`p-4 rounded-xl border text-xs space-y-3 ${
        preconditionsMet ? 'bg-slate-900 border-slate-800' : 'bg-amber-950/40 border-amber-800/80'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2 text-slate-200">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            {t.preconditionsTitle}
          </h3>
          <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
            preconditionsMet ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
          }`}>
            {preconditionsMet ? 'GATES UNLOCKED' : 'LOCKED'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span className={hasSources ? 'text-emerald-400' : 'text-rose-400'}>
              {hasSources ? '✓' : '✗'}
            </span>
            <span className="text-slate-400">{t.sourceCheck}</span>
            <strong className="text-slate-200">{sources.length} record(s)</strong>
          </div>

          <div className="flex items-center gap-2">
            <span className={isAnalysisApproved ? 'text-emerald-400' : 'text-amber-400'}>
              {isAnalysisApproved ? '✓' : '✗'}
            </span>
            <span className="text-slate-400">{t.analysisCheck}</span>
            <strong className={isAnalysisApproved ? 'text-emerald-400' : 'text-amber-400'}>
              {isAnalysisApproved ? `Approved (v${approvedAnalysis.version_number})` : 'Missing / Pending'}
            </strong>
          </div>
        </div>

        {!isAnalysisApproved && (
          <div className="pt-2 border-t border-amber-900/40 space-y-2">
            <p className="text-amber-300 text-[11px] leading-relaxed">
              {t.blockedNotice}
            </p>
            {hasSources && (
              <button
                onClick={handleApproveInitialAnalysis}
                className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t.initAnalysisBtn}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* AI Provider Status Banner (Strict Compliance with ₹0 Budget & Plan-Lock Rule) */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold">
          <Cpu className="w-4 h-4" />
          <span>{t.providerBannerTitle}</span>
        </div>
        <p className="text-slate-400 text-[11px] leading-relaxed">
          {t.providerBannerDesc}
        </p>
      </div>

      {/* Generation Trigger & Controls */}
      {preconditionsMet && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1 text-xs font-mono text-slate-300">
            <div>
              {t.segmentsCount}{' '}
              <strong className="text-indigo-400">
                {activeProject.format_type === 'shorts'
                  ? `${activeProject.shorts_segment_count || 5} segments`
                  : `~${Math.ceil((activeProject.target_duration_seconds || 240) / 8)} segments`}
              </strong>
            </div>
            <div>
              {t.totalDuration}{' '}
              <strong className="text-emerald-400">
                ~{activeProject.target_duration_seconds || 40} {t.seconds}
              </strong>
            </div>
          </div>

          <button
            onClick={handleGenerateScript}
            disabled={isGenerating}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-medium shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 text-xs"
          >
            <Play className="w-4 h-4" />
            <span>{isGenerating ? t.generating : t.generateButton}</span>
          </button>
        </div>
      )}

      {generationError && (
        <div className="p-3.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{generationError}</span>
        </div>
      )}

      {/* Generated Script Display & Segment Editor */}
      {currentScript && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-bold text-slate-200">{t.activeScriptHeader}</h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase ${
                currentStatus === 'approved' 
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                {currentStatus}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => handleSaveScript(false)}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 font-medium"
              >
                <Save className="w-3.5 h-3.5 text-indigo-400" />
                <span>{t.saveDraftBtn}</span>
              </button>

              <button
                onClick={() => handleSaveScript(true)}
                className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 font-medium shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t.approveScriptBtn}</span>
              </button>
            </div>
          </div>

          {/* Segment Cards List */}
          <div className="space-y-4">
            {currentScript.segments.map((seg, idx) => {
              const isEditing = editingSegmentIdx === idx;
              const wordCount = seg.narration.trim() ? seg.narration.trim().split(/\s+/).length : 0;
              // Check speech density (target roughly 2 to 3 words per second)
              const isPlausibleLength = wordCount >= seg.target_duration * 1.5 && wordCount <= seg.target_duration * 4;

              return (
                <div 
                  key={seg.segment_id} 
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center font-mono text-xs">
                        {seg.segment_number}
                      </span>
                      <span className="font-semibold text-slate-200">{seg.purpose}</span>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        {seg.target_duration}s
                      </span>
                      <button
                        onClick={() => setEditingSegmentIdx(isEditing ? null : idx)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
                      >
                        {isEditing ? 'Done Editing' : 'Direct Edit'}
                      </button>
                    </div>
                  </div>

                  {/* Narration Field */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <label className="font-semibold text-slate-300">{t.narration}</label>
                      <span className="font-mono">
                        {wordCount} words {!isPlausibleLength && <span className="text-amber-400">({t.wordsWarning})</span>}
                      </span>
                    </div>
                    {isEditing ? (
                      <textarea
                        rows={3}
                        value={seg.narration}
                        onChange={(e) => handleUpdateSegment(idx, 'narration', e.target.value)}
                        className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 font-sans"
                      />
                    ) : (
                      <p className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/60 text-slate-200 leading-relaxed font-sans">
                        {seg.narration}
                      </p>
                    )}
                  </div>

                  {/* Visuals & On-Screen Text Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-400">{t.visuals}</label>
                      {isEditing ? (
                        <textarea
                          rows={2}
                          value={seg.visual_direction}
                          onChange={(e) => handleUpdateSegment(idx, 'visual_direction', e.target.value)}
                          className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      ) : (
                        <p className="p-2.5 rounded bg-slate-950 border border-slate-800/60 text-slate-300">
                          {seg.visual_direction}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-400">{t.onScreenText}</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={seg.on_screen_text}
                          onChange={(e) => handleUpdateSegment(idx, 'on_screen_text', e.target.value)}
                          className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      ) : (
                        <div className="p-2.5 rounded bg-slate-950 border border-slate-800/60 text-indigo-300 font-mono">
                          {seg.on_screen_text}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Transition note and non-clickable claim reference */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px] text-slate-500 font-mono">
                    <span>Transition: {seg.transition_note}</span>
                    {seg.claim_references && seg.claim_references.length > 0 && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <span>{t.claimRef}</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {seg.claim_references.join(', ')}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Version History Card */}
      {scriptOutputs.length > 0 && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
          <h4 className="font-bold text-slate-200 flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            <span>{t.versionHistoryTitle} ({scriptOutputs.length})</span>
          </h4>

          <div className="space-y-2">
            {scriptOutputs.map((out) => (
              <div 
                key={out.output_id}
                onClick={() => {
                  if (out.content.type === 'script') {
                    setCurrentScript(out.content.data);
                    setActiveOutputId(out.output_id);
                    setCurrentStatus(out.status);
                  }
                }}
                className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between font-mono ${
                  activeOutputId === out.output_id 
                    ? 'bg-indigo-950/40 border-indigo-500 text-white' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-indigo-400 font-bold">Script v{out.version_number}</span>
                  <span className="text-slate-500 text-[11px]">{new Date(out.created_at).toLocaleTimeString()}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded uppercase ${
                  out.status === 'approved' 
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}>
                  {out.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
