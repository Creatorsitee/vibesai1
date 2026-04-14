import React, { useState, useCallback, useMemo } from 'react';
import { PanelGroup, Panel, PanelResizer } from 'react-resizable-panels';
import { Menu, Moon, Sun, Settings, FolderPlus, Download, Upload } from 'lucide-react';
import { FileService } from './services/fileService';
import { GeminiService } from './services/geminiService';
import { useEditorState } from './hooks/useEditorState';
import { useProjectState } from './hooks/useProjectState';
import { useChatState } from './hooks/useChatState';
import { EnhancedCodeEditor } from './components/EnhancedCodeEditor';
import { FileExplorer } from './components/FileExplorer';
import { AdvancedFileManager } from './components/AdvancedFileManager';
import { LivePreview } from './components/LivePreview';
import { ChatPanel } from './components/ChatPanel';
import { EditorSettingsPanel } from './components/EditorSettingsPanel';
import { ProjectSwitcher } from './components/ProjectSwitcher';

const AppRefactored: React.FC = () => {
  // State Management
  const projectState = useProjectState();
  const editorState = useEditorState(projectState.getActiveProject()?.files ? Object.keys(projectState.getActiveProject()!.files)[0] || 'index.html' : 'index.html');
  const chatState = useChatState();

  // AI Service
  const [geminiService] = useState(() => {
    const apiKey = (process.env as any).GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
    return new GeminiService(apiKey ? { apiKey } : undefined);
  });

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showProjectSwitcher, setShowProjectSwitcher] = useState(false);

  // Get active project
  const activeProject = projectState.getActiveProject();

  if (!activeProject) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${editorState.theme === 'dark' ? 'dark' : ''} bg-white dark:bg-zinc-950`}>
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Welcome to VibesAI</h1>
          <p className="text-zinc-600 dark:text-zinc-400">Create your first project to get started</p>
          <button
            onClick={() => projectState.createProject('My First Project', 'html', 'A new web project')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Create Project
          </button>
        </div>
      </div>
    );
  }

  // Build file tree
  const fileTree = useMemo(() => FileService.buildFileTree(activeProject.files), [activeProject.files]);

  // Handle file selection
  const handleFileSelect = useCallback((path: string) => {
    editorState.setActiveFile(path);
  }, [editorState]);

  // Handle file content change
  const handleFileChange = useCallback((content: string) => {
    projectState.updateProject(activeProject.id, {
      files: {
        ...activeProject.files,
        [editorState.activeFile]: content,
      },
    });
  }, [activeProject, editorState.activeFile, projectState]);

  // Handle file delete
  const handleFileDelete = useCallback((path: string) => {
    const { [path]: _, ...remaining } = activeProject.files;
    const files = { ...remaining };
    projectState.updateProject(activeProject.id, { files });
    
    // Switch to first remaining file
    const remaining_keys = Object.keys(files);
    if (remaining_keys.length > 0) {
      editorState.setActiveFile(remaining_keys[0]);
    }
  }, [activeProject, projectState, editorState]);

  // Handle send message
  const handleSendMessage = useCallback(async (text: string) => {
    if (!geminiService.isInitialized()) {
      chatState.addMessage('assistant', 'API Key not configured. Please set GEMINI_API_KEY in .env.local');
      return;
    }

    chatState.setIsProcessing(true);
    chatState.addMessage('user', text);

    try {
      const newHistory = [...chatState.history, { role: 'user' as const, parts: [{ text }] }];
      chatState.setHistory(newHistory);

      let fullResponse = '';

      await geminiService.generateContentStream(newHistory, text, (chunk) => {
        fullResponse += chunk;
        chatState.updateLastMessage(fullResponse);
      });

      const responseMessage = chatState.messages[chatState.messages.length - 1];
      if (responseMessage?.role === 'user') {
        chatState.addMessage('assistant', fullResponse);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      chatState.addMessage('assistant', `Error: ${errorMessage}`);
    } finally {
      chatState.setIsProcessing(false);
    }
  }, [geminiService, chatState]);

  // Handle export
  const handleExport = useCallback(async () => {
    await FileService.exportProjectAsZip(activeProject.name, activeProject.files);
  }, [activeProject]);

  // Get current file content
  const currentFileContent = activeProject.files[editorState.activeFile] || '';

  return (
    <div className={`h-screen flex flex-col ${editorState.theme === 'dark' ? 'dark' : ''} bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white`}>
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded"
          >
            <Menu size={20} />
          </button>
          <button
            onClick={() => setShowProjectSwitcher(true)}
            className="flex flex-col hover:opacity-75 transition-opacity cursor-pointer"
          >
            <h1 className="font-bold text-lg">{activeProject.name}</h1>
            <p className="text-xs text-zinc-500">{activeProject.description}</p>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode selector */}
          <select
            value={editorState.editorMode}
            onChange={(e) => editorState.setEditorMode(e.target.value as any)}
            className="px-3 py-1 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-sm"
          >
            <option value="code">Code</option>
            <option value="preview">Preview</option>
            <option value="split">Split</option>
          </select>

          {/* Export */}
          <button
            onClick={handleExport}
            className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded"
            title="Export project"
          >
            <Download size={20} />
          </button>

          {/* Theme toggle */}
          <button
            onClick={editorState.toggleTheme}
            className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded"
          >
            {editorState.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {editorState.editorMode === 'code' ? (
          // Code only view
          <PanelGroup direction="horizontal">
            {sidebarOpen && (
              <>
                <Panel defaultSize={20} minSize={15}>
                  <FileExplorer
                    fileTree={fileTree}
                    activeFile={editorState.activeFile}
                    onFileSelect={handleFileSelect}
                    onFileDelete={handleFileDelete}
                  />
                </Panel>
                <PanelResizer />
              </>
            )}
            <Panel>
              <EnhancedCodeEditor
                filename={editorState.activeFile}
                content={currentFileContent}
                onChange={handleFileChange}
                theme={editorState.theme}
                fontSize={editorState.fontSize}
                lineNumbers={editorState.lineNumbers}
                wordWrap={editorState.wordWrap}
                minimap={editorState.minimap}
              />
            </Panel>
          </PanelGroup>
        ) : editorState.editorMode === 'preview' ? (
          // Preview only view
          <LivePreview
            files={activeProject.files}
            activeFile={editorState.activeFile}
            theme={editorState.theme}
          />
        ) : (
          // Split view
          <PanelGroup direction="horizontal">
            {sidebarOpen && (
              <>
                <Panel defaultSize={15} minSize={10}>
                  <FileExplorer
                    fileTree={fileTree}
                    activeFile={editorState.activeFile}
                    onFileSelect={handleFileSelect}
                    onFileDelete={handleFileDelete}
                  />
                </Panel>
                <PanelResizer />
              </>
            )}
            <Panel defaultSize={35} minSize={20}>
              <PanelGroup direction="vertical">
                <Panel>
                  <EnhancedCodeEditor
                    filename={editorState.activeFile}
                    content={currentFileContent}
                    onChange={handleFileChange}
                    theme={editorState.theme}
                    fontSize={editorState.fontSize}
                    lineNumbers={editorState.lineNumbers}
                    wordWrap={editorState.wordWrap}
                    minimap={editorState.minimap}
                  />
                </Panel>
                <PanelResizer />
                <Panel>
                  <ChatPanel
                    messages={chatState.messages}
                    isProcessing={chatState.isProcessing}
                    onSendMessage={handleSendMessage}
                    theme={editorState.theme}
                  />
                </Panel>
              </PanelGroup>
            </Panel>
            <PanelResizer />
            <Panel defaultSize={50} minSize={30}>
              <LivePreview
                files={activeProject.files}
                activeFile={editorState.activeFile}
                theme={editorState.theme}
              />
            </Panel>
          </PanelGroup>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <EditorSettingsPanel
          settings={editorState}
          onSettingsChange={editorState.updateEditorState}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Project Switcher */}
      <ProjectSwitcher
        projects={projectState.projects}
        activeProjectId={projectState.activeProjectId}
        onSelectProject={projectState.setActiveProjectId}
        onCreateProject={projectState.createProject}
        onDeleteProject={projectState.deleteProject}
        isOpen={showProjectSwitcher}
        onClose={() => setShowProjectSwitcher(false)}
      />
    </div>
  );
};

export default AppRefactored;
