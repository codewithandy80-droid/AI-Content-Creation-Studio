import React, { useState } from 'react';
import { 
  Project, 
  Source, 
  AnalysisVersion, 
  ClaimRecord, 
  ClaimEvidenceStatus, 
  ClaimImportance, 
  SourceAnalysisReportSections 
} from '../types';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Save, 
  X, 
  ShieldCheck, 
  Info, 
  Plus, 
  Trash2, 
  Layers, 
  Lock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  SOURCE_ANALYSIS_HONEST_LABELING_NOTICE, 
  validateAnalysisForApproval 
} from '../services/sourceAnalysisService';
import { saveAnalysisVersion, approveAnalysisVersion } from '../storage';

interface SourceAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  sources: Source[];
  analysis: AnalysisVersion;
  uiLang: 'en' | 'hi';
  onAnalysisUpdated: (updated: AnalysisVersion) => void;
  onAnalysisApproved: (approved: AnalysisVersion) => void;
}

export const SourceAnalysisModal: React.FC<SourceAnalysisModalProps> = ({
  isOpen,
  onClose,
  project,
  sources,
  analysis: initialAnalysis,
  uiLang,
  onAnalysisUpdated,
  onAnalysisApproved,
}) => {
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisVersion>(initialAnalysis);
  const [activeSectionTab, setActiveSectionTab] = useState<keyof SourceAnalysisReportSections>('source_summary');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const t = {
    en: {
      modalTitle: '10-Section Source Analysis Review & Explicit Approval',
      honestNoticeTitle: 'Honest Source Analysis Workflow (Rule 10, Rule 12 / ₹0 Budget)',
      draftBadge: 'Draft (Pending User Approval)',
      approvedBadge: 'Approved for Production',
      sectionsTabTitle: '10 Report Sections',
      claimsTabTitle: 'Claim Evidence Records',
      saveDraftBtn: 'Save Draft Changes',
      approveBtn: 'Explicitly Approve This Analysis Version',
      closeBtn: 'Close',
      addClaimBtn: 'Add Claim Record',
      deleteClaimBtn: 'Delete',
      statusLabel: 'Evidence Status:',
      importanceLabel: 'Importance:',
      claimTextLabel: 'Claim Text:',
      evidenceLabel: 'Evidence Passage / Quote:',
      locationLabel: 'Source Location:',
      attributionLabel: 'Attribution:',
      caveatLabel: 'Caveat / Uncertainty:',
      savedSuccess: 'Analysis draft saved successfully to IndexedDB.',
      approvedSuccess: 'Source Analysis explicitly approved! Downstream script generation unlocked.',
      mustHaveEvidenceWarning: 'A claim marked "source-supported" must contain verifiable evidence text from the source.',
    },
    hi: {
      modalTitle: '10-खंडीय सोर्स एनालिसिस समीक्षा एवं स्पष्ट स्वीकृति',
      honestNoticeTitle: 'पारदर्शी सोर्स एनालिसिस कार्यप्रवाह (नियम 10, 12 / ₹0 बजट)',
      draftBadge: 'ड्राफ्ट (यूजर स्वीकृति लंबित)',
      approvedBadge: 'उत्पादन हेतु स्वीकृत',
      sectionsTabTitle: '10 रिपोर्ट खंड',
      claimsTabTitle: 'दावा साक्ष्य रिकॉर्ड्स',
      saveDraftBtn: 'ड्राफ्ट में सहेजें',
      approveBtn: 'इस विश्लेषण संस्करण को स्पष्ट रूप से स्वीकृत करें',
      closeBtn: 'बंद करें',
      addClaimBtn: 'दावा रिकॉर्ड जोड़ें',
      deleteClaimBtn: 'हटाएं',
      statusLabel: 'साक्ष्य स्थिति:',
      importanceLabel: 'महत्व:',
      claimTextLabel: 'दावा टेक्स्ट:',
      evidenceLabel: 'साक्ष्य उद्धरण / प्रमाण:',
      locationLabel: 'स्रोत स्थान:',
      attributionLabel: 'श्रेय / स्रोत:',
      caveatLabel: 'संदेह / सीमा:',
      savedSuccess: 'एनालिसिस ड्राफ्ट IndexedDB में सुरक्षित हो गया।',
      approvedSuccess: 'सोर्स एनालिसिस स्वीकृत! आगे की स्क्रिप्ट जनरेशन अनलॉक हो गई है।',
      mustHaveEvidenceWarning: '"source-supported" दावे में स्रोत से सत्यापित साक्ष्य पाठ होना अनिवार्य है।',
    },
  }[uiLang];

  const sectionLabels: Record<keyof SourceAnalysisReportSections, { en: string; hi: string }> = {
    source_summary: { en: '1. Source Summary', hi: '1. स्रोत सारांश' },
    main_story_core_claims: { en: '2. Main Story & Core Claims', hi: '2. मुख्य कहानी एवं केंद्रीय दावे' },
    key_facts_with_evidence: { en: '3. Key Facts with Evidence', hi: '3. साक्ष्य सहित मुख्य तथ्य' },
    timeline_chronology: { en: '4. Timeline & Chronology', hi: '4. समयरेखा एवं घटनाक्रम' },
    entities_relationships: { en: '5. Entities & Relationships', hi: '5. इकाइयां एवं संबंध' },
    numbers_dates_exact_details: { en: '6. Numbers, Dates & Exact Details', hi: '6. संख्याएं, तारीखें और सटीक विवरण' },
    uncertainty_conflicts: { en: '7. Uncertainty & Conflicts', hi: '7. अनिश्चितता एवं विरोधाभास' },
    missing_context: { en: '8. Missing Context', hi: '8. अनुपलब्ध संदर्भ' },
    story_angles: { en: '9. Story Angles', hi: '9. कहानी के संभावित कोण' },
    source_limitations: { en: '10. Source Limitations', hi: '10. स्रोत की सीमाएं' },
  };

  const sectionDescriptions: Record<keyof SourceAnalysisReportSections, { en: string; hi: string }> = {
    source_summary: {
      en: 'Factual summary extracted strictly from the preserved source material.',
      hi: 'संरक्षित स्रोत सामग्री से निकाला गया तथ्यात्मक सारांश।',
    },
    main_story_core_claims: {
      en: 'Core narrative claims and documented central premise.',
      hi: 'मुख्य नैरेटिव दावे और स्रोत में दर्ज केंद्रीय आधार।',
    },
    key_facts_with_evidence: {
      en: 'Verifiable factual statements backed by exact citation or passages.',
      hi: 'सत्यापन योग्य तथ्यात्मक कथन जो संदर्भ या उद्धरणों द्वारा समर्थित हैं।',
    },
    timeline_chronology: {
      en: 'Chronological sequence of events and documented dates.',
      hi: 'घटनाओं का कालानुक्रम और दर्ज की गई तारीखें।',
    },
    entities_relationships: {
      en: 'Identified figures, organizations, places, and their connections.',
      hi: 'पहचाने गए व्यक्ति, संस्थाएं, स्थान और उनके संबंध।',
    },
    numbers_dates_exact_details: {
      en: 'Exact figures, measurements, and numerical records without extrapolation.',
      hi: 'सटीक आंकड़े, माप और संख्यात्मक रिकॉर्ड बिना किसी अनुमान के।',
    },
    uncertainty_conflicts: {
      en: 'Contradictions between sources, ambiguities, or stated caveats.',
      hi: 'स्रोतों के बीच विरोधाभास, अस्पष्टताएं या दर्ज की गई चेतावनियां।',
    },
    missing_context: {
      en: 'Known gaps, omitted background, or unverified claims.',
      hi: 'ज्ञात कमियां, छूटा हुआ संदर्भ या असत्यापित दावे।',
    },
    story_angles: {
      en: 'Narrative angles strictly aligned with verified source evidence.',
      hi: 'कहानी के कोण जो पूरी तरह से सत्यापित साक्ष्यों पर आधारित हों।',
    },
    source_limitations: {
      en: 'Methodological limitations of supplied inputs. No external fact-checking performed.',
      hi: 'दिए गए स्रोतों की सीमाएं। कोई बाहरी तथ्य-जांच नहीं की गई है।',
    },
  };

  const handleUpdateSection = (key: keyof SourceAnalysisReportSections, value: string) => {
    setCurrentAnalysis((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [key]: value,
      },
    }));
    setSaveSuccessMsg(null);
  };

  const handleUpdateClaim = (index: number, field: keyof ClaimRecord, value: any) => {
    setCurrentAnalysis((prev) => {
      const claims = [...prev.claim_records];
      claims[index] = {
        ...claims[index],
        analysis_version_id: prev.analysis_version_id, // EXACT MATCH GUARANTEED
        [field]: value,
      };
      return {
        ...prev,
        claim_records: claims,
      };
    });
    setSaveSuccessMsg(null);
  };

  const handleAddClaim = () => {
    const newClaim: ClaimRecord = {
      claim_id: `claim-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      analysis_version_id: currentAnalysis.analysis_version_id, // EXACT MATCH
      claim_text: '',
      status: 'unverified', // Default UNVERIFIED
      importance: 'medium',
      claim_type: 'fact',
      evidence_text: '',
      source_id: sources[0]?.source_id || 'source-1',
      source_location: 'Page / Section reference',
      attribution: sources[0]?.source_label || 'Supplied Source',
      caveat: '',
      review_status: 'pending',
    };

    setCurrentAnalysis((prev) => ({
      ...prev,
      claim_records: [...prev.claim_records, newClaim],
    }));
    setSaveSuccessMsg(null);
  };

  const handleDeleteClaim = (index: number) => {
    setCurrentAnalysis((prev) => {
      const claims = [...prev.claim_records];
      claims.splice(index, 1);
      return {
        ...prev,
        claim_records: claims,
      };
    });
    setSaveSuccessMsg(null);
  };

  // Save changes as draft
  const handleSaveDraft = async () => {
    setIsSaving(true);
    setValidationErrors([]);
    setValidationWarnings([]);
    setSaveSuccessMsg(null);

    try {
      // Ensure all claim records have exact matching analysis_version_id
      const sanitizedAnalysis: AnalysisVersion = {
        ...currentAnalysis,
        review_status: currentAnalysis.review_status === 'approved' ? 'approved' : 'draft',
        claim_records: currentAnalysis.claim_records.map((c) => ({
          ...c,
          analysis_version_id: currentAnalysis.analysis_version_id,
        })),
      };

      const saved = await saveAnalysisVersion(sanitizedAnalysis);
      setCurrentAnalysis(saved);
      onAnalysisUpdated(saved);
      setSaveSuccessMsg(t.savedSuccess);
    } catch (err: any) {
      setValidationErrors([err.message || 'Failed to save analysis draft.']);
    } finally {
      setIsSaving(false);
    }
  };

  // Explicit approval handler (Rule 13 / QA-011)
  const handleExplicitApprove = async () => {
    setIsSaving(true);
    setValidationErrors([]);
    setValidationWarnings([]);
    setSaveSuccessMsg(null);

    // Validate 10 sections and claims
    const val = validateAnalysisForApproval(currentAnalysis);
    if (!val.valid) {
      setValidationErrors(val.errors);
      setValidationWarnings(val.warnings);
      setIsSaving(false);
      return;
    }

    try {
      // First save latest draft content
      const sanitizedAnalysis: AnalysisVersion = {
        ...currentAnalysis,
        claim_records: currentAnalysis.claim_records.map((c) => ({
          ...c,
          analysis_version_id: currentAnalysis.analysis_version_id,
        })),
      };
      await saveAnalysisVersion(sanitizedAnalysis);

      // Then invoke explicit approval workflow
      const approved = await approveAnalysisVersion(currentAnalysis.analysis_version_id);
      setCurrentAnalysis(approved);
      onAnalysisApproved(approved);
      setSaveSuccessMsg(t.approvedSuccess);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setValidationErrors([err.message || 'Failed to approve analysis version.']);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>{t.modalTitle}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                  v{currentAnalysis.version_number}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Project: <strong className="text-slate-200">{project.name}</strong> • Language: <strong className="text-indigo-300 uppercase">{project.master_language}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-mono px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${
                currentAnalysis.review_status === 'approved'
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80'
                  : 'bg-amber-950/60 text-amber-300 border-amber-800/80'
              }`}
            >
              {currentAnalysis.review_status === 'approved' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.approvedBadge}</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.draftBadge}</span>
                </>
              )}
            </span>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Honest Labeling Notice */}
        <div className="p-3.5 bg-slate-950/60 border-b border-slate-800/80 text-xs flex items-start gap-3 shrink-0">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-[11px]">
            <div className="font-semibold text-slate-200">{t.honestNoticeTitle}</div>
            <p className="text-slate-400 leading-relaxed">
              {SOURCE_ANALYSIS_HONEST_LABELING_NOTICE}
            </p>
          </div>
        </div>

        {/* Feedback Messages */}
        {validationErrors.length > 0 && (
          <div className="p-3 mx-4 mt-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 space-y-1 shrink-0">
            <div className="font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Validation Errors:</span>
            </div>
            {validationErrors.map((err, i) => (
              <div key={i} className="pl-5">• {err}</div>
            ))}
          </div>
        )}

        {validationWarnings.length > 0 && (
          <div className="p-3 mx-4 mt-3 rounded-lg bg-amber-950/40 border border-amber-800/60 text-xs text-amber-300 space-y-1 shrink-0">
            {validationWarnings.map((w, i) => (
              <div key={i} className="pl-1">⚠️ {w}</div>
            ))}
          </div>
        )}

        {saveSuccessMsg && (
          <div className="p-3 mx-4 mt-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Main Body: Tabs & Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: 10 Section Navigation */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/80 p-3 space-y-1 overflow-y-auto shrink-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 py-1">
              {t.sectionsTabTitle}
            </div>
            {(Object.keys(sectionLabels) as (keyof SourceAnalysisReportSections)[]).map((key) => {
              const isActive = activeSectionTab === key;
              const hasContent = currentAnalysis.sections[key] && !currentAnalysis.sections[key].startsWith('[Draft:');
              return (
                <button
                  key={key}
                  onClick={() => setActiveSectionTab(key)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <span className="truncate">{sectionLabels[key][uiLang]}</span>
                  {hasContent ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Column: Editor Area for Active Section & Claim Records */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-6">
            {/* Active Section Editor */}
            <div className="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    {sectionLabels[activeSectionTab][uiLang]}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {sectionDescriptions[activeSectionTab][uiLang]}
                  </p>
                </div>
              </div>

              <textarea
                rows={6}
                value={currentAnalysis.sections[activeSectionTab]}
                onChange={(e) => handleUpdateSection(activeSectionTab, e.target.value)}
                className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans leading-relaxed"
                placeholder={`Enter verified facts for ${sectionLabels[activeSectionTab][uiLang]}...`}
              />
            </div>

            {/* Claims Table Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>{t.claimsTabTitle}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {currentAnalysis.claim_records.length} claim(s)
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {t.mustHaveEvidenceWarning}
                  </p>
                </div>

                <button
                  onClick={handleAddClaim}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.addClaimBtn}</span>
                </button>
              </div>

              {currentAnalysis.claim_records.length === 0 ? (
                <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-500 italic">
                  No claim records added yet. Click &quot;Add Claim Record&quot; to attach verifiable evidence to specific claims.
                </div>
              ) : (
                <div className="space-y-3">
                  {currentAnalysis.claim_records.map((claim, idx) => (
                    <div
                      key={claim.claim_id || idx}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-slate-850 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-400">#{idx + 1}</span>
                          <span className="font-mono text-[10px] text-slate-500 truncate max-w-[120px]">
                            {claim.claim_id}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Evidence Status Dropdown */}
                          <select
                            value={claim.status}
                            onChange={(e) => handleUpdateClaim(idx, 'status', e.target.value as ClaimEvidenceStatus)}
                            className={`px-2 py-1 rounded text-[11px] font-mono font-semibold border ${
                              claim.status === 'source-supported'
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                : claim.status === 'conflicting'
                                ? 'bg-rose-950 text-rose-300 border-rose-800'
                                : 'bg-amber-950 text-amber-300 border-amber-800'
                            }`}
                          >
                            <option value="unverified">unverified</option>
                            <option value="source-supported">source-supported</option>
                            <option value="conflicting">conflicting</option>
                          </select>

                          {/* Importance Dropdown */}
                          <select
                            value={claim.importance}
                            onChange={(e) => handleUpdateClaim(idx, 'importance', e.target.value as ClaimImportance)}
                            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-300"
                          >
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>

                          <button
                            onClick={() => handleDeleteClaim(idx)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                            title={t.deleteClaimBtn}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Claim Text */}
                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">
                          {t.claimTextLabel}
                        </label>
                        <input
                          type="text"
                          value={claim.claim_text}
                          onChange={(e) => handleUpdateClaim(idx, 'claim_text', e.target.value)}
                          placeholder="Factual claim statement..."
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Evidence & Location Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-400 mb-1">
                            {t.evidenceLabel}
                          </label>
                          <textarea
                            rows={2}
                            value={claim.evidence_text}
                            onChange={(e) => handleUpdateClaim(idx, 'evidence_text', e.target.value)}
                            placeholder="Direct quote or passage from source..."
                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <div>
                            <label className="block text-[11px] font-medium text-slate-400 mb-1">
                              {t.locationLabel}
                            </label>
                            <input
                              type="text"
                              value={claim.source_location}
                              onChange={(e) => handleUpdateClaim(idx, 'source_location', e.target.value)}
                              placeholder="e.g. Paragraph 3, Section 2"
                              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-medium text-slate-400 mb-1">
                              {t.attributionLabel}
                            </label>
                            <input
                              type="text"
                              value={claim.attribution}
                              onChange={(e) => handleUpdateClaim(idx, 'attribution', e.target.value)}
                              placeholder="e.g. Archaeological Survey Report"
                              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 font-mono">
            {currentAnalysis.review_status === 'approved' ? (
              <span className="text-emerald-400">✓ Version Approved for Downstream Script Generation</span>
            ) : (
              <span className="text-amber-400">⚠️ Human review and explicit approval required (Rule 13)</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t.saveDraftBtn}</span>
            </button>

            <button
              onClick={handleExplicitApprove}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.approveBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
