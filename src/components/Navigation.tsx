import React from 'react';
import { 
  FolderPlus, 
  Layers, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  FileText,
  HardDrive,
  Globe,
  Film,
  Image as ImageIcon,
  Search
} from 'lucide-react';
import { Project } from '../types';

export type SaveStatus = 'saved' | 'saving' | 'unsynced' | 'failed';
export type ActiveTab = 'f00' | 'f01' | 'f02' | 'f03' | 'f04';

interface NavigationProps {
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (projectId: string) => void;
  onNewProjectClick: () => void;
  saveStatus: SaveStatus;
  saveErrorMessage?: string;
  uiLang: 'en' | 'hi';
  onToggleUiLang: () => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  projects,
  activeProject,
  onSelectProject,
  onNewProjectClick,
  saveStatus,
  saveErrorMessage,
  uiLang,
  onToggleUiLang,
  activeTab,
  onSelectTab,
}) => {
  const t = {
    en: {
      appName: 'AI Content Creation Studio',
      budget: '₹0.00 Free-Only',
      newProject: 'New Project',
      noProjects: 'No active projects',
      statusSaved: 'Saved to IndexedDB',
      statusSaving: 'Saving...',
      statusUnsynced: 'Unsynced Draft',
      statusFailed: 'Save Failed',
      tabF00: 'Function 00: Source Intake',
      tabF01: 'Function 01: Script Generation',
      tabF02: 'Function 02: Flow Prompts',
      tabF03: 'Function 03: Thumbnail Prompts',
      tabF04: 'Function 04: YouTube SEO',
    },
    hi: {
      appName: 'एआई कंटेंट क्रिएशन स्टूडियो',
      budget: '₹0.00 केवल मुफ्त',
      newProject: 'नया प्रोजेक्ट',
      noProjects: 'कोई प्रोजेक्ट नहीं',
      statusSaved: 'IndexedDB में सहेजा गया',
      statusSaving: 'सहेजा जा रहा है...',
      statusUnsynced: 'असंग्रहीत ड्राफ्ट',
      statusFailed: 'सहेजने में विफल',
      tabF00: 'फंक्शन 00: सोर्स इनटेक',
      tabF01: 'फंक्शन 01: स्क्रिप्ट जनरेशन',
      tabF02: 'फंक्शन 02: फ्लो प्रॉम्प्ट्स',
      tabF03: 'फंक्शन 03: थंबनेल प्रॉम्प्ट्स',
      tabF04: 'फंक्शन 04: यूट्यूब एसईओ',
    },
  }[uiLang];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Active Project Info */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20 text-sm">
            AI
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-sm sm:text-base tracking-tight">
                {t.appName}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 font-mono">
                {activeTab === 'f00' ? 'Function 00' : activeTab === 'f01' ? 'Function 01' : activeTab === 'f02' ? 'Function 02' : activeTab === 'f03' ? 'Function 03' : 'Function 04'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {activeProject ? (
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="font-medium truncate max-w-[200px]">{activeProject.name}</span>
                  <span className="text-slate-500">•</span>
                  <span className="uppercase text-[10px] font-mono text-slate-400">{activeProject.master_language}</span>
                  <span className="text-slate-500">•</span>
                  <span className="font-mono text-[10px] text-slate-400">{activeProject.aspect_ratio}</span>
                </span>
              ) : (
                <span>{t.noProjects}</span>
              )}
            </p>
          </div>
        </div>

        {/* Action Controls & Indicators */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-xs">
          {/* Bilingual Toggle */}
          <button
            onClick={onToggleUiLang}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            title="Toggle UI Language (Hindi/English)"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-medium uppercase">{uiLang}</span>
          </button>

          {/* Project Switcher Dropdown */}
          {projects.length > 0 && (
            <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={activeProject?.project_id || ''}
                onChange={(e) => onSelectProject(e.target.value)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none pr-2 cursor-pointer max-w-[140px] truncate"
              >
                {projects.map((p) => (
                  <option key={p.project_id} value={p.project_id} className="bg-slate-900 text-slate-100">
                    {p.name} ({p.master_language.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* New Project Button */}
          <button
            onClick={onNewProjectClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-sm transition-colors cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>{t.newProject}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-800 text-indigo-200 ml-1">
              {projects.length}/8
            </span>
          </button>

          {/* Real-time Save Status Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800/80 border border-slate-700 font-mono text-[11px]">
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.statusSaved}</span>
                <span className="sm:hidden">Saved</span>
              </span>
            )}
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1.5 text-amber-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{t.statusSaving}</span>
              </span>
            )}
            {saveStatus === 'unsynced' && (
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                <span>{t.statusUnsynced}</span>
              </span>
            )}
            {saveStatus === 'failed' && (
              <span className="flex items-center gap-1.5 text-rose-400" title={saveErrorMessage}>
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{t.statusFailed}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Function Pipeline Tabs Navigation */}
      <div className="border-t border-slate-800/80 bg-slate-950/60 px-4 sm:px-6 flex overflow-x-auto gap-2 text-xs font-medium py-1.5">
        <button
          onClick={() => onSelectTab('f00')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'f00'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{t.tabF00}</span>
        </button>

        <button
          onClick={() => onSelectTab('f01')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'f01'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{t.tabF01}</span>
        </button>

        <button
          onClick={() => onSelectTab('f02')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'f02'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>{t.tabF02}</span>
        </button>

        <button
          onClick={() => onSelectTab('f03')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'f03'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>{t.tabF03}</span>
        </button>

        <button
          onClick={() => onSelectTab('f04')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'f04'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>{t.tabF04}</span>
        </button>
      </div>
    </header>
  );
};
