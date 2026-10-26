import React, { useEffect, useState } from 'react';
import { Project, Source } from './types';
import { 
  listActiveProjects, 
  createProject, 
  listSourcesForProject, 
  saveSource 
} from './storage';
import { Navigation, SaveStatus, ActiveTab } from './components/Navigation';
import { Function00Workspace } from './components/Function00Workspace';
import { Function01ScriptWorkspace } from './components/Function01ScriptWorkspace';
import { Function02FlowPromptsWorkspace } from './components/Function02FlowPromptsWorkspace';
import { Function03ThumbnailWorkspace } from './components/Function03ThumbnailWorkspace';
import { Function04SEOWorkspace } from './components/Function04SEOWorkspace';

export default function App() {
  const [uiLang, setUiLang] = useState<'en' | 'hi'>('en');
  const [activeTab, setActiveTab] = useState<ActiveTab>('f00');
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | undefined>();
  const [projectLimitError, setProjectLimitError] = useState<{
    blocked: boolean;
    oldestCandidate?: Project;
  } | null>(null);

  // Initial Data Load from IndexedDB
  useEffect(() => {
    let isMounted = true;
    setSaveStatus('saving');

    listActiveProjects()
      .then((loadedProjects) => {
        if (!isMounted) return;
        setProjects(loadedProjects);
        if (loadedProjects.length > 0) {
          const first = loadedProjects[0];
          setActiveProject(first);
          return listSourcesForProject(first.project_id);
        }
        return [];
      })
      .then((loadedSources) => {
        if (!isMounted) return;
        if (loadedSources) {
          setSources(loadedSources);
        }
        setSaveStatus('saved');
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('[IndexedDB Load Error]', err);
        setSaveStatus('failed');
        setSaveErrorMessage(err.message);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // When activeProject changes, load its sources
  const handleSelectProject = async (projectId: string) => {
    const proj = projects.find((p) => p.project_id === projectId) || null;
    setActiveProject(proj);
    if (proj) {
      setSaveStatus('saving');
      try {
        const loadedSources = await listSourcesForProject(proj.project_id);
        setSources(loadedSources);
        setSaveStatus('saved');
      } catch (err: any) {
        setSaveStatus('failed');
        setSaveErrorMessage(err.message);
      }
    } else {
      setSources([]);
    }
  };

  // Create Project Handler
  const handleProjectCreated = async (newProjData: Project) => {
    setSaveStatus('saving');
    setProjectLimitError(null);

    try {
      const result = await createProject(newProjData);

      if (!result.success) {
        // Enforce 8-project limit safety check without deleting anything
        setSaveStatus('failed');
        setSaveErrorMessage('8-project limit reached');
        setProjectLimitError({
          blocked: true,
          oldestCandidate: result.oldest_candidate,
        });
        return;
      }

      if (result.project) {
        setProjects((prev) => [result.project!, ...prev]);
        setActiveProject(result.project);
        setSources([]);
        setSaveStatus('saved');
        setSaveErrorMessage(undefined);
      }
    } catch (err: any) {
      setSaveStatus('failed');
      setSaveErrorMessage(err.message);
    }
  };

  // Add Source Handler
  const handleAddSource = async (sourceData: Omit<Source, 'source_id' | 'captured_at'>) => {
    setSaveStatus('saving');
    try {
      const newSource: Source = {
        ...sourceData,
        source_id: `src-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        captured_at: new Date().toISOString(),
      };

      const saved = await saveSource(newSource);
      setSources((prev) => [...prev, saved]);
      setSaveStatus('saved');
      setSaveErrorMessage(undefined);
    } catch (err: any) {
      setSaveStatus('failed');
      setSaveErrorMessage(err.message);
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navigation & Header */}
      <Navigation
        projects={projects}
        activeProject={activeProject}
        onSelectProject={handleSelectProject}
        onNewProjectClick={() => {
          setActiveProject(null);
          setActiveTab('f00');
        }}
        saveStatus={saveStatus}
        saveErrorMessage={saveErrorMessage}
        uiLang={uiLang}
        onToggleUiLang={() => setUiLang((prev) => (prev === 'en' ? 'hi' : 'en'))}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Main Workspace (Function 00, Function 01, Function 02, Function 03, or Function 04) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'f00' && (
          <Function00Workspace
            activeProject={activeProject}
            projects={projects}
            sources={sources}
            uiLang={uiLang}
            onProjectCreated={handleProjectCreated}
            onAddSource={handleAddSource}
            projectLimitError={projectLimitError}
            onClearLimitError={() => setProjectLimitError(null)}
          />
        )}
        {activeTab === 'f01' && (
          <Function01ScriptWorkspace
            activeProject={activeProject}
            sources={sources}
            uiLang={uiLang}
            onSaveStatusChange={(status, err) => {
              setSaveStatus(status);
              setSaveErrorMessage(err);
            }}
          />
        )}
        {activeTab === 'f02' && (
          <Function02FlowPromptsWorkspace
            activeProject={activeProject}
            sources={sources}
            uiLang={uiLang}
            onSaveStatusChange={(status, err) => {
              setSaveStatus(status);
              setSaveErrorMessage(err);
            }}
            onNavigateToTab={setActiveTab}
          />
        )}
        {activeTab === 'f03' && (
          <Function03ThumbnailWorkspace
            activeProject={activeProject}
            sources={sources}
            uiLang={uiLang}
            onSaveStatusChange={(status, err) => {
              setSaveStatus(status);
              setSaveErrorMessage(err);
            }}
            onNavigateToTab={setActiveTab}
          />
        )}
        {activeTab === 'f04' && (
          <Function04SEOWorkspace
            activeProject={activeProject}
            sources={sources}
            uiLang={uiLang}
            onSaveStatusChange={(status, err) => {
              setSaveStatus(status);
              setSaveErrorMessage(err);
            }}
            onNavigateToTab={setActiveTab}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 px-6 py-3 text-center text-xs text-slate-500">
        AI Content Creation App • Functions 00, 01, 02, 03 & 04 Active • Strictly ₹0 Budget & Review Gates Enforced
      </footer>
    </div>
  );
}
