import React, { useState } from 'react';
import { 
  Project, 
  Source, 
  MasterLanguage, 
  AspectRatio, 
  FormatType 
} from '../types';
import { 
  PlusCircle, 
  FileText, 
  Clock, 
  Smartphone, 
  Monitor, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  ShieldAlert, 
  Info,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

interface Function00WorkspaceProps {
  activeProject: Project | null;
  projects: Project[];
  sources: Source[];
  uiLang: 'en' | 'hi';
  onProjectCreated: (project: Project) => void;
  onAddSource: (source: Omit<Source, 'source_id' | 'captured_at'>) => Promise<void>;
  projectLimitError: { blocked: boolean; oldestCandidate?: Project } | null;
  onClearLimitError: () => void;
}

export const Function00Workspace: React.FC<Function00WorkspaceProps> = ({
  activeProject,
  projects,
  sources,
  uiLang,
  onProjectCreated,
  onAddSource,
  projectLimitError,
  onClearLimitError,
}) => {
  // New Project Form State
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(!activeProject);
  const [name, setName] = useState<string>('');
  const [masterLanguage, setMasterLanguage] = useState<MasterLanguage>('hi');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [formatType, setFormatType] = useState<FormatType>('shorts');
  const [shortsSegmentCount, setShortsSegmentCount] = useState<number>(5);
  const [longVideoDurationMinutes, setLongVideoDurationMinutes] = useState<number>(5);
  const [formError, setFormError] = useState<string | null>(null);

  // Source Intake State
  const [sourceLabel, setSourceLabel] = useState<string>('');
  const [pastedText, setPastedText] = useState<string>('');
  const [provenanceRef, setProvenanceRef] = useState<string>('');
  const [isSubmittingSource, setIsSubmittingSource] = useState<boolean>(false);
  const [sourceError, setSourceError] = useState<string | null>(null);

  const t = {
    en: {
      newProjectTitle: 'Function 00: Create New Project',
      projectDetails: 'Project Configuration',
      projectNameLabel: 'Project Name',
      projectNamePlaceholder: 'e.g. Mystery of the Hidden Temple',
      langLabel: 'Master Language (Governs all outputs)',
      hindi: 'Hindi (हिंदी)',
      english: 'English',
      ratioLabel: 'Aspect Ratio',
      ratio916: '9:16 Vertical (Shorts / Reels)',
      ratio169: '16:9 Landscape (YouTube Standard)',
      formatLabel: 'Production Format',
      shorts: 'Shorts (approx. 8s per segment)',
      longVideo: 'Long Video (min. 4 minutes)',
      shortsCountLabel: 'Shorts Segments Count',
      shortsEstDuration: 'Estimated duration:',
      seconds: 'seconds',
      longDurationLabel: 'Target Duration (Minutes — Minimum 4 min required)',
      longEstSegments: 'Estimated segments (~8s each):',
      createButton: 'Initialize Project & Source Intake',
      cancelButton: 'Cancel',
      projectLimitTitle: 'Project Limit Reached (8 / 8 Active Projects)',
      projectLimitDesc: 'The maximum limit of 8 active projects has been reached. To preserve system stability and budget integrity, creation is blocked without deleting any data.',
      oldestProjectCandidate: 'Oldest Candidate for Export/Archive:',
      creationDate: 'Created Date:',
      lastActivityDate: 'Last Activity:',
      limitInstruction: 'You must export/archive an existing project and explicitly confirm deletion before creating a 9th project.',
      closeModal: 'Understood',
      sourceIntakeTitle: 'Function 00: Source Intake & Preservation',
      sourceSubtitle: 'Preserve user-supplied material in its original form. Non-clickable text provenance only.',
      noSourcesYet: 'No source material added yet. Add a source below to prepare for 10-section Source Analysis.',
      addSourceTitle: 'Add Source Material (Pasted Text / Reference)',
      sourceLabelInput: 'Source Title / Label',
      sourceLabelPlaceholder: 'e.g. Investigative Article / Research Brief',
      provenanceInput: 'Source Provenance Reference (Non-clickable identifier/text)',
      provenancePlaceholder: 'e.g. Published Paper Vol 4 / Historical Archive Report 2024',
      pastedTextInput: 'Source Content (Pasted Text)',
      pastedTextPlaceholder: 'Paste verbatim source text here. Treat this text as data to be analyzed...',
      wordCount: 'Word Count:',
      charCount: 'Character Count:',
      saveSourceButton: 'Preserve Source Record',
      savingSource: 'Saving Source to IndexedDB...',
      gateTitle: 'Source Analysis Gate (Strict Dependency Lock)',
      gateDesc: 'Downstream functions (01 Script, 02 Flow Prompts, 03 Thumbnails, 04 SEO) are strictly locked until a 10-section Source Analysis is reviewed and approved by you.',
      gateStatus: 'Status: Awaiting Source Analysis Initialization (Task 3)',
      sourcesPreservedList: 'Preserved Source Records for this Project',
      nonClickableNotice: 'No clickable links are rendered. All provenance text is plain non-interactive data.',
    },
    hi: {
      newProjectTitle: 'फंक्शन 00: नया प्रोजेक्ट बनाएं',
      projectDetails: 'प्रोजेक्ट कॉन्फ़िगरेशन',
      projectNameLabel: 'प्रोजेक्ट का नाम',
      projectNamePlaceholder: 'उदा. रहस्यमयी प्राचीन मंदिर की खोज',
      langLabel: 'मास्टर भाषा (सभी जनरेटेड कंटेंट इसी भाषा में होंगे)',
      hindi: 'हिंदी (Hindi)',
      english: 'अंग्रेज़ी (English)',
      ratioLabel: 'आस्पेक्ट रेशियो',
      ratio916: '9:16 वर्टिकल (शॉर्ट्स / रील्स)',
      ratio169: '16:9 लैंडस्केप (यूट्यूब सामान्य)',
      formatLabel: 'प्रोडक्शन प्रारूप',
      shorts: 'शॉर्ट्स (~8 सेकंड प्रति सेगमेंट)',
      longVideo: 'लंबा वीडियो (न्यूनतम 4 मिनट)',
      shortsCountLabel: 'शॉर्ट्स सेगमेंट संख्या',
      shortsEstDuration: 'अनुमानित अवधि:',
      seconds: 'सेकंड',
      longDurationLabel: 'लक्षित अवधि (मिनट — न्यूनतम 4 मिनट अनिवार्य)',
      longEstSegments: 'अनुमानित सेगमेंट्स (~8s प्रत्येक):',
      createButton: 'प्रोजेक्ट और सोर्स इनटेक शुरू करें',
      cancelButton: 'रद्द करें',
      projectLimitTitle: 'प्रोजेक्ट सीमा समाप्त (8 / 8 सक्रिय प्रोजेक्ट्स)',
      projectLimitDesc: 'अधिकतम 8 सक्रिय प्रोजेक्ट्स की सीमा पूरी हो चुकी है। बिना यूजर पुष्टि के कोई डेटा डिलीट नहीं किया जाएगा।',
      oldestProjectCandidate: 'एक्सपोर्ट/आर्काइव हेतु सबसे पुराना प्रोजेक्ट:',
      creationDate: 'निर्माण तिथि:',
      lastActivityDate: 'अंतिम गतिविधि:',
      limitInstruction: '9वां प्रोजेक्ट बनाने से पहले पुराने प्रोजेक्ट को एक्सपोर्ट करके डिलीट करना आवश्यक है।',
      closeModal: 'समझ गया',
      sourceIntakeTitle: 'फंक्शन 00: सोर्स इनटेक और संरक्षण',
      sourceSubtitle: 'मूल स्रोत सामग्री को सुरक्षित रूप से सहेजें। केवल गैर-क्लिक करने योग्य संदर्भ।',
      noSourcesYet: 'अभी कोई स्रोत नहीं जोड़ा गया है। 10-खंडीय विश्लेषण के लिए नीचे स्रोत जोड़ें।',
      addSourceTitle: 'स्रोत सामग्री जोड़ें (टेक्स्ट पेस्ट / संदर्भ)',
      sourceLabelInput: 'स्रोत का शीर्षक / लेबल',
      sourceLabelPlaceholder: 'उदा. समाचार लेख / शोध सारांश',
      provenanceInput: 'स्रोत उत्पत्ति संदर्भ (केवल साधारण टेक्स्ट / आईडी)',
      provenancePlaceholder: 'उदा. ऐतिहासिक पत्रिका खंड 2 (गैर-क्लिक योग्य)',
      pastedTextInput: 'स्रोत सामग्री (पेस्ट किया गया टेक्स्ट)',
      pastedTextPlaceholder: 'यहाँ स्रोत का मूल टेक्स्ट पेस्ट करें। यह टेक्स्ट डेटा के रूप में विश्लेषित होगा...',
      wordCount: 'शब्द संख्या:',
      charCount: 'अक्षर संख्या:',
      saveSourceButton: 'स्रोत रिकॉर्ड सुरक्षित करें',
      savingSource: 'IndexedDB में सुरक्षित हो रहा है...',
      gateTitle: 'सोर्स एनालिसिस गेट (सख्त निर्भरता लॉक)',
      gateDesc: 'जब तक 10-खंडीय सोर्स एनालिसिस स्वीकृत नहीं हो जाता, स्क्रिप्ट और अन्य आगे के चरण लॉक रहेंगे।',
      gateStatus: 'स्थिति: सोर्स एनालिसिस प्रारंभ की प्रतीक्षा (टास्क 3)',
      sourcesPreservedList: 'इस प्रोजेक्ट के सुरक्षित स्रोत रिकॉर्ड्स',
      nonClickableNotice: 'कोई क्लिक करने योग्य लिंक नहीं है। सभी संदर्भ केवल सादे टेक्स्ट हैं।',
    },
  }[uiLang];

  const wordsCount = pastedText.trim() ? pastedText.trim().split(/\s+/).length : 0;
  const charsCount = pastedText.length;

  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Project name is mandatory and cannot be empty.');
      return;
    }

    if (formatType === 'long_video' && longVideoDurationMinutes < 4) {
      setFormError('Long video format strictly requires a minimum duration of 4 minutes (Rule 18).');
      return;
    }

    if (formatType === 'shorts' && (!shortsSegmentCount || shortsSegmentCount < 1)) {
      setFormError('Shorts format requires at least 1 segment.');
      return;
    }

    const targetDurationSec = formatType === 'shorts' 
      ? shortsSegmentCount * 8 
      : longVideoDurationMinutes * 60;

    const newProject: Project = {
      project_id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      created_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
      master_language: masterLanguage,
      aspect_ratio: aspectRatio,
      format_type: formatType,
      shorts_segment_count: formatType === 'shorts' ? shortsSegmentCount : null,
      target_duration_seconds: targetDurationSec,
      master_rules_version_id: 'mr-v1.0-baseline',
      active_approved_analysis_version_id: null,
      project_status: 'active',
    };

    onProjectCreated(newProject);
    setIsCreatingNew(false);
    setName('');
  };

  const handleAddSourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSourceError(null);

    if (!activeProject) {
      setSourceError('Please select or create an active project first.');
      return;
    }

    if (!pastedText.trim()) {
      setSourceError('Source content cannot be empty. Paste text to proceed.');
      return;
    }

    setIsSubmittingSource(true);
    try {
      await onAddSource({
        project_id: activeProject.project_id,
        source_type: 'pasted_text',
        source_label: sourceLabel.trim() || `Source ${sources.length + 1}`,
        source_version: sources.length + 1,
        content_or_storage_reference: pastedText.trim(),
        source_hash: null,
        ingestion_status: 'imported',
        non_clickable_provenance_text: provenanceRef.trim() || 'User Pasted Material',
        location_index_metadata: { words: wordsCount, characters: charsCount },
      });

      setPastedText('');
      setSourceLabel('');
      setProvenanceRef('');
    } catch (err: any) {
      setSourceError(`Failed to save source record: ${err.message}`);
    } finally {
      setIsSubmittingSource(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 8-Project Limit Notification Modal / Banner (Strictly prevents silent deletion) */}
      {projectLimitError && (
        <div className="rounded-xl border border-rose-800/80 bg-rose-950/70 p-5 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-rose-900/60 border border-rose-700 text-rose-300 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="text-sm font-bold text-rose-200 uppercase tracking-wide">
                {t.projectLimitTitle}
              </h3>
              <p className="text-xs text-rose-300 leading-relaxed">
                {t.projectLimitDesc}
              </p>

              {projectLimitError.oldestCandidate && (
                <div className="p-3 rounded-lg bg-slate-900/90 border border-rose-900/60 text-xs space-y-1.5 font-mono">
                  <div className="text-slate-300 font-semibold text-[11px] uppercase">
                    {t.oldestProjectCandidate}
                  </div>
                  <div className="text-indigo-300 font-bold">
                    {projectLimitError.oldestCandidate.name} ({projectLimitError.oldestCandidate.project_id})
                  </div>
                  <div className="flex flex-wrap gap-4 text-slate-400 text-[11px]">
                    <span>
                      <strong className="text-slate-300">{t.creationDate}</strong>{' '}
                      {new Date(projectLimitError.oldestCandidate.created_at).toLocaleString()}
                    </span>
                    <span>
                      <strong className="text-slate-300">{t.lastActivityDate}</strong>{' '}
                      {new Date(projectLimitError.oldestCandidate.last_activity_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-rose-400 font-medium">
                {t.limitInstruction}
              </p>

              <button
                onClick={onClearLimitError}
                className="mt-2 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 font-medium transition-colors"
              >
                {t.closeModal}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Project Modal / Section */}
      {isCreatingNew && (
        <div className="rounded-xl border border-indigo-900/80 bg-slate-900/95 p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-indigo-400" />
              {t.newProjectTitle}
            </h2>
            {projects.length > 0 && (
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                {t.cancelButton}
              </button>
            )}
          </div>

          <form onSubmit={handleCreateProjectSubmit} className="mt-5 space-y-5 text-xs">
            {formError && (
              <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* 1. Project Name */}
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                {t.projectNameLabel} <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.projectNamePlaceholder}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            {/* 2. Master Language & Aspect Ratio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  {t.langLabel}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMasterLanguage('hi')}
                    className={`py-2 px-3 rounded-lg border text-center font-medium transition-all ${
                      masterLanguage === 'hi'
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {t.hindi}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMasterLanguage('en')}
                    className={`py-2 px-3 rounded-lg border text-center font-medium transition-all ${
                      masterLanguage === 'en'
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {t.english}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  {t.ratioLabel}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAspectRatio('9:16')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border font-medium transition-all ${
                      aspectRatio === '9:16'
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>9:16</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectRatio('16:9')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border font-medium transition-all ${
                      aspectRatio === '16:9'
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>16:9</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Production Format */}
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                {t.formatLabel}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setFormatType('shorts')}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    formatType === 'shorts'
                      ? 'bg-indigo-950/40 border-indigo-500 text-slate-100'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-slate-200 flex items-center justify-between">
                    <span>Shorts</span>
                    <span className="text-[10px] font-mono text-indigo-400">~8s/segment</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{t.shorts}</p>
                </div>

                <div
                  onClick={() => setFormatType('long_video')}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    formatType === 'long_video'
                      ? 'bg-indigo-950/40 border-indigo-500 text-slate-100'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-slate-200 flex items-center justify-between">
                    <span>Long Video</span>
                    <span className="text-[10px] font-mono text-indigo-400">≥ 4 minutes</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{t.longVideo}</p>
                </div>
              </div>
            </div>

            {/* Format-Specific Duration Controls */}
            {formatType === 'shorts' ? (
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-2">
                <label className="block text-slate-300 font-medium">
                  {t.shortsCountLabel} ({shortsSegmentCount} segments)
                </label>
                <input
                  type="range"
                  min="2"
                  max="12"
                  value={shortsSegmentCount}
                  onChange={(e) => setShortsSegmentCount(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>2 parts (~16s)</span>
                  <span className="text-indigo-400 font-semibold">
                    {t.shortsEstDuration} ~{shortsSegmentCount * 8} {t.seconds}
                  </span>
                  <span>12 parts (~96s)</span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-2">
                <label className="block text-slate-300 font-medium">
                  {t.longDurationLabel}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="4"
                    max="60"
                    value={longVideoDurationMinutes}
                    onChange={(e) => setLongVideoDurationMinutes(Math.max(4, parseInt(e.target.value || '4', 10)))}
                    className="w-24 px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-100 font-mono text-center focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-slate-400 text-xs">minutes</span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  {t.longEstSegments} ~{Math.ceil((longVideoDurationMinutes * 60) / 8)} segments 
                  (Final segment may be shorter to match exact runtime per Rule 18).
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
              >
                <span>{t.createButton}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Project View: Function 00 Workspace */}
      {activeProject && !isCreatingNew && (
        <div className="space-y-6">
          {/* Project Details Banner */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">{activeProject.name}</h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800/60 text-emerald-400 font-mono uppercase">
                  {activeProject.project_status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                <span>ID: {activeProject.project_id}</span>
                <span>•</span>
                <span>Lang: <strong className="text-slate-200 uppercase">{activeProject.master_language}</strong></span>
                <span>•</span>
                <span>Ratio: <strong className="text-slate-200">{activeProject.aspect_ratio}</strong></span>
                <span>•</span>
                <span>Format: <strong className="text-slate-200">{activeProject.format_type}</strong></span>
                <span>•</span>
                <span>Target: ~{activeProject.target_duration_seconds}s</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCreatingNew(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition-colors"
              >
                + Another Project
              </button>
            </div>
          </div>

          {/* Source Intake Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Add Source Form */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    {t.addSourceTitle}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {t.sourceSubtitle}
                  </p>
                </div>

                <form onSubmit={handleAddSourceSubmit} className="space-y-4 text-xs">
                  {sourceError && (
                    <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{sourceError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        {t.sourceLabelInput}
                      </label>
                      <input
                        type="text"
                        value={sourceLabel}
                        onChange={(e) => setSourceLabel(e.target.value)}
                        placeholder={t.sourceLabelPlaceholder}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        {t.provenanceInput}
                      </label>
                      <input
                        type="text"
                        value={provenanceRef}
                        onChange={(e) => setProvenanceRef(e.target.value)}
                        placeholder={t.provenancePlaceholder}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-slate-300 font-medium">
                        {t.pastedTextInput} <span className="text-rose-400">*</span>
                      </label>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                        <span>{t.wordCount} <strong className="text-indigo-400">{wordsCount}</strong></span>
                        <span>•</span>
                        <span>{t.charCount} <strong className="text-slate-300">{charsCount}</strong></span>
                      </div>
                    </div>
                    <textarea
                      rows={8}
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder={t.pastedTextPlaceholder}
                      className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans leading-relaxed"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-500 italic">
                      {t.nonClickableNotice}
                    </span>

                    <button
                      type="submit"
                      disabled={isSubmittingSource || !pastedText.trim()}
                      className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>{isSubmittingSource ? t.savingSource : t.saveSourceButton}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Preserved Sources List for this Project */}
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between">
                  <span>{t.sourcesPreservedList}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono">
                    {sources.length} record{sources.length === 1 ? '' : 's'}
                  </span>
                </h3>

                {sources.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-3 text-center">
                    {t.noSourcesYet}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {sources.map((s, idx) => (
                      <div 
                        key={s.source_id} 
                        className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-mono font-bold">
                              {idx + 1}
                            </span>
                            <span className="font-semibold text-slate-200">{s.source_label}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-400">
                              v{s.source_version}
                            </span>
                          </div>

                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900">
                            {s.ingestion_status}
                          </span>
                        </div>

                        {/* Provenance Text (Guaranteed Non-Clickable) */}
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
                          <span className="text-slate-500">Provenance:</span>
                          <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                            {s.non_clickable_provenance_text}
                          </span>
                        </div>

                        {/* Snippet Preview */}
                        <p className="text-xs text-slate-400 line-clamp-3 bg-slate-900/60 p-2.5 rounded border border-slate-800/80 font-sans">
                          {s.content_or_storage_reference}
                        </p>

                        <div className="text-[10px] text-slate-500 flex items-center gap-3 font-mono">
                          <span>Captured: {new Date(s.captured_at).toLocaleTimeString()}</span>
                          {s.location_index_metadata && (
                            <span>Words: {(s.location_index_metadata as any).words}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right 1 Col: Analysis Approval Gate & Preparation Status */}
            <div className="space-y-4">
              {/* Gate Notice Card */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-amber-400 font-semibold">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>{t.gateTitle}</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  {t.gateDesc}
                </p>
                <div className="p-2.5 rounded bg-amber-950/40 border border-amber-900/60 text-amber-300 text-[11px] font-mono">
                  {t.gateStatus}
                </div>
              </div>

              {/* Source Readiness Card */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                <h4 className="font-semibold text-slate-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Source Readiness</span>
                </h4>
                <div className="space-y-1.5 text-slate-400 text-[11px]">
                  <div className="flex justify-between">
                    <span>Sources Ingested:</span>
                    <strong className="text-slate-200">{sources.length}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Words:</span>
                    <strong className="text-slate-200">
                      {sources.reduce((acc, s) => acc + ((s.location_index_metadata as any)?.words || 0), 0)}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Factual Foundation:</span>
                    <strong className={sources.length > 0 ? 'text-emerald-400' : 'text-amber-400'}>
                      {sources.length > 0 ? 'Ready for Analysis' : 'Awaiting Sources'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Permanent Master Rules Reference */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                <h4 className="font-semibold text-slate-300 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-indigo-400" />
                  <span>Governing Rules</span>
                </h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Every source intake record is strictly preserved without mutation. Analysis generation will only execute when explicitly initiated by user action.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
