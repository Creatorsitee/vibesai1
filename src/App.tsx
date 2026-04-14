import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GoogleGenAI, Type, Content, Part } from '@google/genai';
import { 
  FileCode, Folder, MessageSquare, Send, Loader2, FileText, 
  ChevronRight, ChevronDown, Code2, Terminal, Play, 
  Plus, Trash2, Download, PlusCircle, X, Layout, 
  Zap, Globe, Monitor, RefreshCw, ExternalLink, Edit2,
  History, Settings, User, Sparkles, CheckCircle, AlertCircle,
  Moon, Sun, Pin, PinOff, Box, Search, BarChart2, Activity
} from 'lucide-react';
import { EnhancedConsole, ConsoleLog } from './components/EnhancedConsole';
import { ResponsivePreview } from './components/ResponsivePreview';
import { SettingsPanel } from './components/SettingsPanel';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { CollaborationPanel } from './components/CollaborationPanel';
import { ThemeService, ThemeConfig } from './services/themeService';
import { PerformanceService } from './services/performanceService';
import { AIAgentService } from './services/aiAgentService';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Group, Panel, Separator as PanelSeparator } from 'react-resizable-panels';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Initialize Gemini API
const apiKey = (process.env as any).GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
const ai = apiKey && apiKey.trim() ? new GoogleGenAI({ apiKey }) : null;

// Define tools for the agent
const agentTools = [{
  functionDeclarations: [
    {
      name: 'readFile',
      description: 'Membaca isi file pada jalur yang diberikan.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          path: { type: Type.STRING, description: 'Jalur absolut file yang akan dibaca (contoh: /src/main.js).' }
        },
        required: ['path']
      }
    },
    {
      name: 'writeFile',
      description: 'Menulis konten ke file pada jalur yang diberikan. Membuat file jika belum ada. Gunakan ini untuk mengubah atau membuat file.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          path: { type: Type.STRING, description: 'Jalur absolut file yang akan ditulis.' },
          content: { type: Type.STRING, description: 'Konten yang akan ditulis ke file.' }
        },
        required: ['path', 'content']
      }
    },
    {
      name: 'listFiles',
      description: 'Daftar semua file dalam proyek.',
      parameters: {
        type: Type.OBJECT,
        properties: {},
      }
    },
    {
      name: 'deleteFile',
      description: 'Menghapus file pada jalur yang diberikan.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          path: { type: Type.STRING, description: 'Jalur absolut file yang akan dihapus.' }
        },
        required: ['path']
      }
    },
    {
      name: 'renameFile',
      description: 'Mengubah nama file dari oldPath ke newPath.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          oldPath: { type: Type.STRING, description: 'Jalur absolut file saat ini.' },
          newPath: { type: Type.STRING, description: 'Jalur absolut baru untuk file tersebut.' }
        },
        required: ['oldPath', 'newPath']
      }
    },
    {
      name: 'grepFiles',
      description: 'Mencari pola di semua file dalam proyek.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          pattern: { type: Type.STRING, description: 'Pola regex yang akan dicari.' }
        },
        required: ['pattern']
      }
    },
    {
      name: 'createPlan',
      description: 'Membuat rencana terstruktur untuk tugas yang kompleks.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          steps: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: 'Daftar langkah-langkah untuk menyelesaikan tugas.'
          }
        },
        required: ['steps']
      }
    }
  ]
}];

const systemInstruction = `Anda adalah asisten pengkodean AI ahli yang terintegrasi langsung ke dalam editor kode pengguna, mirip dengan Cursor.
Anda memiliki akses ke sistem file pengguna melalui alat (tools).
Ketika pengguna meminta Anda untuk membangun atau memodifikasi sesuatu, Anda harus menggunakan alat writeFile untuk membuat atau memperbarui file yang diperlukan.
Jika ruang kerja kosong dan pengguna meminta untuk membangun aplikasi web, mulailah dengan membuat /index.html, /style.css, dan /script.js.
Anda dapat menggunakan readFile untuk memahami kode yang ada, dan listFiles untuk melihat struktur proyek.
Gunakan grepFiles untuk mencari teks atau pola tertentu di seluruh proyek.
Gunakan createPlan untuk menguraikan tugas-tugas kompleks sebelum mengeksekusinya.
Selalu jelaskan apa yang Anda lakukan secara singkat dalam Bahasa Indonesia. Jika Anda menulis kode, gunakan alat untuk menerapkannya langsung ke file daripada hanya mengeluarkan blok markdown, kecuali pengguna secara khusus hanya meminta penjelasan.
Berpikir langkah demi langkah.`;

type FileSystem = Record<string, string>;

type Project = {
  id: string;
  name: string;
  files: FileSystem;
  messages: Message[];
  history: Content[];
  openFiles: string[];
  lastModified: number;
};

type Message = {
  id: string;
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
  toolCalls?: { name: string; args: any }[];
};

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('ide_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('ide_projects');
    if (saved) return JSON.parse(saved);
    
    // Initial default project
    return [{
      id: 'default',
      name: 'Session 1',
      files: {},
      messages: [{ id: '1', role: 'model', text: 'Sesi siap. Apa yang ingin Anda bangun?' }],
      history: [],
      openFiles: [],
      lastModified: Date.now()
    }];
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    return localStorage.getItem('ide_active_project_id') || 'default';
  });

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  const [files, setFiles] = useState<FileSystem>(activeProject.files);
  const [activeFile, setActiveFile] = useState<string>('');
  const [editorMode, setEditorMode] = useState<'edit' | 'preview'>('edit');
  const [openFiles, setOpenFiles] = useState<string[]>(activeProject.openFiles || []);
  const [messages, setMessages] = useState<Message[]>(activeProject.messages);
  const [sessionId, setSessionId] = useState<string>(() => Math.random().toString(36).substring(7));
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<Content[]>(activeProject.history);
  const [snippets, setSnippets] = useState<{id: string, name: string, code: string}[]>(() => {
    const saved = localStorage.getItem('ide_snippets');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedModel, setSelectedModel] = useState('gemini-flash-latest');
  const [showTemplates, setShowTemplates] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingSnippet, setIsCreatingSnippet] = useState(false);
  const [newSnippetName, setNewSnippetName] = useState('');
  const [editingFileName, setEditingFileName] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [tempProjectName, setTempProjectName] = useState('');
  const [tempFileName, setTempFileName] = useState('');
  const [previewKey, setPreviewKey] = useState(0);
  const [todos, setTodos] = useState<{id: string, text: string, status: 'pending' | 'loading' | 'completed' | 'error'}[]>([]);
  const [activeView, setActiveView] = useState<'explorer' | 'editor' | 'preview' | 'chat' | 'insights' | 'history' | 'settings' | 'console' | 'responsive'>('chat');
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem('ide_font_size')) || 14);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(() => {
    const saved = localStorage.getItem('ide_sidebar_pinned');
    return saved === 'true';
  });
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('ide_expanded_folders');
    return saved ? JSON.parse(saved) : {};
  });
  const [consoleLogs, setConsoleLogs] = useState<{id: string, method: string, content: string, timestamp: string}[]>([]);
  const [showConsole, setShowConsole] = useState(false);
  const [terminalInput, setTerminalInput] = useState('');
  const [projectGoal, setProjectGoal] = useState('');
  
  // Phase 4-7: Advanced features
  const [themeService] = useState(() => new ThemeService('dark'));
  const [performanceService] = useState(() => new PerformanceService());
  const [showSettings, setShowSettings] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(themeService.getCurrentTheme());
  const [consoleLogs2, setConsoleLogs2] = useState<ConsoleLog[]>([]);

  // Custom Modal States
  const [modalConfig, setModalConfig] = useState<{
    type: 'alert' | 'confirm' | 'prompt';
    isOpen: boolean;
    title: string;
    message: string;
    defaultValue?: string;
    onConfirm?: (value?: string) => void;
  }>({
    type: 'alert',
    isOpen: false,
    title: '',
    message: ''
  });
  const [modalInputValue, setModalInputValue] = useState('');

  const showAlert = (title: string, message: string) => {
    setModalConfig({ type: 'alert', isOpen: true, title, message });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setModalConfig({ type: 'confirm', isOpen: true, title, message, onConfirm });
  };

  const showPrompt = (title: string, message: string, defaultValue: string, onConfirm: (value: string) => void) => {
    setModalInputValue(defaultValue);
    setModalConfig({ type: 'prompt', isOpen: true, title, message, defaultValue, onConfirm });
  };

  const handleModalConfirm = () => {
    if (modalConfig.type === 'prompt') {
      modalConfig.onConfirm?.(modalInputValue);
    } else {
      modalConfig.onConfirm?.();
    }
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const AVAILABLE_MODELS = [
    { id: 'gemini-flash-latest', name: 'Gemini Flash', desc: 'Tercepat & stabil' },
    { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', desc: 'Kecepatan generasi berikutnya' },
    { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro', desc: 'Paling mumpuni' },
    { id: 'gemini-3.1-flash-lite-preview', name: 'Gemini Flash Lite', desc: 'Ringan & cepat' },
  ];
  
  const editorRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeMobileTab, setActiveMobileTab] = useState<'files' | 'preview' | 'chat'>('chat');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, todos, isProcessing]);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('ide_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('ide_active_project_id', activeProjectId);
  }, [activeProjectId]);

  useEffect(() => {
    localStorage.setItem('ide_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Sync active project data to state when switching
  const switchProject = (projectId: string) => {
    // Save current state to projects list first
    setProjects(prev => prev.map(p => p.id === activeProjectId ? {
      ...p,
      files,
      messages,
      history,
      openFiles,
      lastModified: Date.now()
    } : p));

    const target = projects.find(p => p.id === projectId);
    if (target) {
      setActiveProjectId(projectId);
      setFiles(target.files);
      setMessages(target.messages);
      setHistory(target.history);
      setOpenFiles(target.openFiles || []);
      setActiveFile('');
      setTodos([]);
      setActiveView('chat');
    }
  };

  // Auto-save current project state to the projects list
  useEffect(() => {
    setProjects(prev => prev.map(p => p.id === activeProjectId ? {
      ...p,
      files,
      messages,
      history,
      openFiles,
      lastModified: Date.now()
    } : p));
  }, [files, messages, history, openFiles]);

  useEffect(() => {
    localStorage.setItem('ide_snippets', JSON.stringify(snippets));
  }, [snippets]);

  useEffect(() => {
    localStorage.setItem('ide_font_size', fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('ide_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'console') {
        setConsoleLogs(prev => [...prev, {
          id: Date.now().toString() + Math.random(),
          method: event.data.method,
          content: event.data.arguments.join(' '),
          timestamp: new Date().toLocaleTimeString()
        }].slice(-50));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleFileChange = (value: string | undefined) => {
    if (value !== undefined && activeFile) {
      setFiles(prev => ({ ...prev, [activeFile]: value }));
    }
  };

  const executeTool = async (call: any): Promise<any> => {
    const { name, args } = call;
    
    if (name === 'readFile') {
      const todoId = Date.now().toString();
      setTodos(prev => [...prev, { id: todoId, text: `Reading ${args.path}...`, status: 'loading' }]);
      const content = files[args.path];
      if (content !== undefined) {
        setTodos(prev => prev.map(t => t.id === todoId ? { ...t, text: `Read ${args.path}`, status: 'completed' } : t));
        return { content };
      } else {
        setTodos(prev => prev.map(t => t.id === todoId ? { ...t, text: `Failed to read ${args.path}`, status: 'error' } : t));
        return { error: 'File not found' };
      }
    } else if (name === 'writeFile') {
      const todoId = Date.now().toString();
      setTodos(prev => [...prev, { id: todoId, text: `Writing ${args.path}...`, status: 'loading' }]);
      setFiles(prev => ({ ...prev, [args.path]: args.content }));
      
      // Auto-expand parent folders
      const parts = args.path.split('/').filter(Boolean);
      let currentPath = '';
      const newExpanded = { ...expandedFolders };
      parts.slice(0, -1).forEach(part => {
        currentPath += '/' + part;
        newExpanded[currentPath] = true;
      });
      setExpandedFolders(newExpanded);

      if (!openFiles.includes(args.path)) {
        setOpenFiles(prev => [...prev, args.path]);
      }
      
      setActiveFile(args.path);
      
      // If index.html is written, prepare to show preview
      if (args.path.endsWith('index.html')) {
        setPreviewKey(prev => prev + 1);
      }

      setTodos(prev => prev.map(t => t.id === todoId ? { ...t, text: `Wrote ${args.path}`, status: 'completed' } : t));
      return { success: true };
    } else if (name === 'listFiles') {
      return { files: Object.keys(files) };
    } else if (name === 'deleteFile') {
      const todoId = Date.now().toString();
      setTodos(prev => [...prev, { id: todoId, text: `Deleting ${args.path}...`, status: 'loading' }]);
      const newFiles = { ...files };
      delete newFiles[args.path];
      setFiles(newFiles);
      if (activeFile === args.path) setActiveFile(Object.keys(newFiles)[0] || '');
      setTodos(prev => prev.map(t => t.id === todoId ? { ...t, text: `Deleted ${args.path}`, status: 'completed' } : t));
      return { success: true };
    } else if (name === 'renameFile') {
      const todoId = Date.now().toString();
      setTodos(prev => [...prev, { id: todoId, text: `Renaming ${args.oldPath} to ${args.newPath}...`, status: 'loading' }]);
      if (!files[args.oldPath]) {
        setTodos(prev => prev.map(t => t.id === todoId ? { ...t, text: `Failed to rename ${args.oldPath}`, status: 'error' } : t));
        return { error: 'File not found' };
      }
      const newFiles = { ...files };
      const content = newFiles[args.oldPath];
      delete newFiles[args.oldPath];
      newFiles[args.newPath] = content;
      setFiles(newFiles);
      if (activeFile === args.oldPath) setActiveFile(args.newPath);
      setTodos(prev => prev.map(t => t.id === todoId ? { ...t, text: `Renamed ${args.oldPath}`, status: 'completed' } : t));
      return { success: true };
    } else if (name === 'grepFiles') {
      const todoId = Date.now().toString();
      setTodos(prev => [...prev, { id: todoId, text: `Searching for "${args.pattern}"...`, status: 'loading' }]);
      const results: Record<string, string[]> = {};
      const regex = new RegExp(args.pattern, 'i');
      Object.entries(files).forEach(([path, content]) => {
        const matches = content.split('\n').filter(line => regex.test(line));
        if (matches.length > 0) results[path] = matches;
      });
      setTodos(prev => prev.map(t => t.id === todoId ? { ...t, text: `Search completed for "${args.pattern}"`, status: 'completed' } : t));
      return { results };
    } else if (name === 'createPlan') {
      const todoId = Date.now().toString();
      setTodos(prev => [...prev, { id: todoId, text: `Creating plan...`, status: 'loading' }]);
      const planTodos = args.steps.map((step: string, index: number) => ({
        id: `${todoId}-${index}`,
        text: step,
        status: 'pending' as const
      }));
      setTodos(prev => [...prev, ...planTodos]);
      setTodos(prev => prev.map(t => t.id === todoId ? { ...t, text: `Plan created`, status: 'completed' } : t));
      return { plan: args.steps, status: 'Plan created and acknowledged.' };
    }
    return { error: 'Unknown tool' };
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isProcessing) return;
    
    if (!ai) {
      showAlert('API Key Not Set', 'Please set your GEMINI_API_KEY in the .env.local file to use the AI assistant.');
      return;
    }

    const userMessage = text.trim();
    setIsProcessing(true);

    const newMessages = [...messages, { id: Date.now().toString(), role: 'user' as const, text: userMessage }];
    setMessages(newMessages);

    const newHistory = [...history, { role: 'user', parts: [{ text: userMessage }] }];
    setHistory(newHistory);

    try {
      await processAgentTurn(newHistory, newMessages);
    } catch (error: any) {
      console.error("Agent error:", error);
      let errorMessage = 'Sorry, I encountered an error processing your request.';
      
      // Enhanced error detection for 429/Quota issues
      const errorString = JSON.stringify(error).toLowerCase();
      const messageString = (error?.message || '').toLowerCase();
      
      if (
        error?.status === 429 || 
        error?.error?.code === 429 ||
        messageString.includes('429') || 
        messageString.includes('quota') || 
        messageString.includes('resource_exhausted') ||
        errorString.includes('429') ||
        errorString.includes('resource_exhausted')
      ) {
        errorMessage = '⚠️ **API Quota Exceeded**: You have reached the rate limit for the Gemini API. Please check your plan in Google AI Studio or try again in a few minutes.';
      }
      
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: errorMessage }]);
      setIsProcessing(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;
    const text = input.trim();
    setInput('');
    await sendMessage(text);
  };

  const clearChat = () => {
    showConfirm('Clear Chat', 'Are you sure you want to clear chat history?', () => {
      setMessages([{ id: Date.now().toString(), role: 'model', text: 'Chat history cleared. How can I help you now?' }]);
      setHistory([]);
      setTodos([]);
      setSessionId(Math.random().toString(36).substring(7));
      localStorage.removeItem('ide_messages');
      localStorage.removeItem('ide_history');
    });
  };

  const resetProject = () => {
    showConfirm('Reset Project', 'Are you sure you want to reset the project? All files will be deleted.', () => {
      setFiles({});
      setActiveFile('');
      localStorage.removeItem('ide_files');
    });
  };

  const addSnippet = () => {
    if (!newSnippetName.trim() || !editorRef.current) return;
    const selection = editorRef.current.getSelection();
    if (!selection) return;
    const code = editorRef.current.getModel().getValueInRange(selection) || '';
    
    if (snippets.some(s => s.name === newSnippetName)) {
      showAlert('Error', 'Snippet already exists');
      return;
    }
    
    const newSnippet = {
      id: Date.now().toString(),
      name: newSnippetName,
      code: code || '// Empty snippet'
    };
    
    setSnippets(prev => [...prev, newSnippet]);
    setNewSnippetName('');
    setIsCreatingSnippet(false);
  };

  const deleteSnippet = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSnippets(prev => prev.filter(s => s.id !== id));
  };

  const insertSnippet = (code: string) => {
    if (!editorRef.current || !activeFile) return;
    const selection = editorRef.current.getSelection();
    if (!selection) return;
    const range = new (window as any).monaco.Range(
      selection.startLineNumber,
      selection.startColumn,
      selection.endLineNumber,
      selection.endColumn
    );
    
    editorRef.current.executeEdits('snippet-insert', [
      { range: range, text: code, forceMoveMarkers: true }
    ]);
    editorRef.current.focus();
  };

  const processAgentTurn = async (currentHistory: Content[], currentMessages: Message[]) => {
    if (!ai) {
      throw new Error('API not initialized');
    }
    
    let turnHistory = [...currentHistory];
    let isDone = false;
    let loopCount = 0;
    const MAX_LOOPS = 10;

    try {
      while (!isDone && loopCount < MAX_LOOPS) {
        loopCount++;
        
        // Create a placeholder for the streaming message
        const streamMessageId = Date.now().toString();
        let streamText = '';
        let accumulatedContent: Content = { role: 'model', parts: [] };
        
        try {
          const result = await Promise.race([
            ai.models.generateContentStream({
              model: selectedModel,
              contents: turnHistory,
              config: { systemInstruction, tools: agentTools, temperature: 0.2 }
            }),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('AI response timeout')), 60000)
            )
          ]);

          // Handle streaming
          for await (const chunk of result) {
            // Accumulate parts for history
            if (chunk.candidates?.[0]?.content?.parts) {
              accumulatedContent.parts.push(...chunk.candidates[0].content.parts);
            }

            const chunkText = chunk.text;
            if (chunkText) {
              streamText += chunkText;
              // Update the UI with the stream
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last && last.id === streamMessageId) {
                  return [...prev.slice(0, -1), { ...last, text: streamText }];
                } else {
                  return [...prev, { id: streamMessageId, role: 'model', text: streamText, isStreaming: true }];
                }
              });
            }
          }

          // Mark streaming as finished
          setMessages(prev => prev.map(m => m.id === streamMessageId ? { ...m, isStreaming: false } : m));

          // Use the accumulated content for history
          turnHistory.push(accumulatedContent);

          // Check for function calls in the accumulated content
          const functionCalls = accumulatedContent.parts
            .filter(p => p.functionCall)
            .map(p => p.functionCall!);

          if (functionCalls.length > 0) {
            const toolResponses: Part[] = [];
            const toolCallsList = [];
            for (const call of functionCalls) {
              toolCallsList.push({ name: call.name, args: call.args });
              const result = await executeTool(call);
              toolResponses.push({ functionResponse: { name: call.name, response: result } });
            }
            
            const toolMessageId = Date.now().toString() + '-tools';
            setMessages(prev => [...prev, { 
              id: toolMessageId, 
              role: 'model', 
              text: '', // Empty text, will use toolCalls for rendering
              toolCalls: toolCallsList
            }]);
            
            turnHistory.push({ role: 'user', parts: toolResponses });
          } else {
            isDone = true;
          }
        } catch (error) {
          console.error("Stream error in loop:", error);
          throw error;
        }
      }
    } catch (error) {
      console.error("Agent turn error:", error);
      throw error;
    } finally {
      setHistory(turnHistory);
      setIsProcessing(false);
    }
  };

  const getLanguage = (filename: string) => {
    if (filename.endsWith('.html')) return 'html';
    if (filename.endsWith('.css')) return 'css';
    if (filename.endsWith('.js')) return 'javascript';
    if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return 'typescript';
    if (filename.endsWith('.json')) return 'json';
    return 'plaintext';
  };

  const createManualFile = () => {
    if (!newFileName.trim()) return;
    const path = newFileName.startsWith('/') ? newFileName : `/${newFileName}`;
    if (files[path]) {
      showAlert('Error', 'File already exists');
      return;
    }
    setFiles(prev => ({ ...prev, [path]: '' }));
    setActiveFile(path);
    setNewFileName('');
    setIsCreatingFile(false);
  };

  const startRenaming = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFileName(path);
    setTempFileName(path.startsWith('/') ? path.substring(1) : path);
  };

  const submitRename = () => {
    if (!editingFileName || !tempFileName.trim()) {
      setEditingFileName(null);
      return;
    }
    const newPath = tempFileName.startsWith('/') ? tempFileName : `/${tempFileName}`;
    if (newPath === editingFileName) {
      setEditingFileName(null);
      return;
    }
    if (files[newPath]) {
      showAlert('Error', 'File already exists');
      return;
    }
    const newFiles = { ...files };
    const content = newFiles[editingFileName];
    delete newFiles[editingFileName];
    newFiles[newPath] = content;
    setFiles(newFiles);
    if (activeFile === editingFileName) setActiveFile(newPath);
    setEditingFileName(null);
  };

  const deleteManualFile = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    showConfirm('Delete File', `Are you sure you want to delete ${path}?`, () => {
      const newFiles = { ...files };
      delete newFiles[path];
      setFiles(newFiles);
      if (activeFile === path) setActiveFile(Object.keys(newFiles)[0] || '');
    });
  };

  const openInNewTab = () => {
    const html = files['/index.html'] || '';
    const css = files['/styles.css'] || '';
    const js = files['/main.js'] || '';
    
    const fullHtml = html
      .replace('<link rel="stylesheet" href="/styles.css">', `<style>${css}</style>`)
      .replace('<script src="/main.js"></script>', `<script>${js}</script>`);
      
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const downloadProject = async (project: Project) => {
    const zip = new JSZip();
    Object.entries(project.files).forEach(([path, content]) => {
      const zipPath = path.startsWith('/') ? path.substring(1) : path;
      zip.file(zipPath, content);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${project.name.replace(/\s+/g, '-').toLowerCase()}-export.zip`);
  };

  const exportProject = async () => {
    const activeProject = projects.find(p => p.id === activeProjectId);
    if (activeProject) {
      await downloadProject(activeProject);
    }
  };

  const handleCreateNewProject = () => {
    setIsCreatingProject(true);
    setNewProjectName(`Untitled Project ${projects.length + 1}`);
    setProjectGoal('');
  };

  const finalizeProjectCreation = async () => {
    if (!newProjectName.trim()) return;
    const newId = Date.now().toString();
    
    const newProject: Project = {
      id: newId,
      name: newProjectName,
      files: {},
      messages: [{ 
        id: '1', 
        role: 'model', 
        text: `Menginisialisasi proyek: **${newProjectName}**\n\n${projectGoal ? `Tujuan: ${projectGoal}` : "Saya siap membantu Anda membangun aplikasi. Apa yang harus kita mulai?"}` 
      }],
      history: [],
      openFiles: [],
      lastModified: Date.now()
    };
    
    setProjects(prev => [...prev, newProject]);
    switchProject(newId);
    setActiveView('chat');
    setIsCreatingProject(false);
    setNewProjectName('');

    // If there's a goal, automatically trigger the first AI response
    if (projectGoal.trim()) {
      setTimeout(() => {
        sendMessage(`Inisialisasi struktur proyek untuk: ${projectGoal}. Buat file yang diperlukan seperti index.html, styles.css, dll. untuk memulai.`);
      }, 500);
    }
  };

  const handleTerminalCommand = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && terminalInput.trim()) {
      const cmd = terminalInput.trim().toLowerCase();
      const originalCmd = terminalInput.trim();
      
      setConsoleLogs(prev => [...prev, {
        id: Date.now().toString(),
        method: 'log',
        content: `> ${originalCmd}`,
        timestamp: new Date().toLocaleTimeString()
      }]);
      setTerminalInput('');

      // Local command processing
      if (cmd === 'clear') {
        setConsoleLogs([]);
        return;
      }
      
      if (cmd === 'ls') {
        const fileList = Object.keys(files).join('\n');
        setConsoleLogs(prev => [...prev, {
          id: Date.now().toString(),
          method: 'log',
          content: fileList || 'No files in project',
          timestamp: new Date().toLocaleTimeString()
        }]);
        return;
      }

      if (cmd === 'help') {
        setConsoleLogs(prev => [...prev, {
          id: Date.now().toString(),
          method: 'log',
          content: 'Perintah lokal yang tersedia: ls, clear, help. Semua perintah lainnya dikirim ke AI.',
          timestamp: new Date().toLocaleTimeString()
        }]);
        return;
      }
      
      // Send command to AI as a prompt
      sendMessage(`Execute terminal command: "${originalCmd}". If this involves creating or modifying files, please do so.`);
    }
  };
  const buildFileTree = (filePaths: string[]) => {
    const root: any = { name: 'root', type: 'folder', children: [] };
    
    filePaths.forEach(path => {
      const parts = path.split('/').filter(Boolean);
      let current = root;
      let currentPath = '';
      
      parts.forEach((part, index) => {
        currentPath += '/' + part;
        const isLast = index === parts.length - 1;
        let existing = current.children.find((child: any) => child.name === part);
        
        if (!existing) {
          existing = {
            name: part,
            path: currentPath,
            type: isLast ? 'file' : 'folder',
            children: isLast ? undefined : []
          };
          current.children.push(existing);
        }
        current = existing;
      });
    });
    
    return root.children;
  };

  const toggleFolder = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const renderTreeItem = (item: any, depth: number = 0) => {
    const isExpanded = expandedFolders[item.path];
    const isActive = activeFile === item.path;

    if (item.type === 'folder') {
      return (
        <div key={item.path}>
          <div 
            onClick={(e) => toggleFolder(item.path, e)}
            className="group flex items-center gap-2 px-4 py-1.5 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-all"
            style={{ paddingLeft: `${(depth * 12) + 16}px` }}
          >
            {isExpanded ? <ChevronDown size={14} className="text-zinc-400" /> : <ChevronRight size={14} className="text-zinc-400" />}
            <Folder size={14} className="text-zinc-400" />
            <span className="text-sm font-medium truncate">{item.name}</span>
          </div>
          {isExpanded && item.children.sort((a: any, b: any) => {
            if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
            return a.name.localeCompare(b.name);
          }).map((child: any) => renderTreeItem(child, depth + 1))}
        </div>
      );
    }

    return (
      <div 
        key={item.path}
        onClick={() => {
          setActiveFile(item.path);
          setActiveView('editor');
        }}
        className={`group flex items-center justify-between px-4 py-1.5 cursor-pointer transition-all ${isActive ? 'bg-black dark:bg-white text-white dark:text-black' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}
        style={{ paddingLeft: `${(depth * 12) + 16}px` }}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <FileText size={14} className={isActive ? 'text-white dark:text-black' : 'text-zinc-400'} />
          {editingFileName === item.path ? (
            <input
              autoFocus
              value={tempFileName}
              onChange={(e) => setTempFileName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitRename()}
              onBlur={submitRename}
              className="bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs p-1 outline-none text-black dark:text-white rounded w-full"
            />
          ) : (
            <span className="text-sm font-medium truncate">{item.name}</span>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => startRenaming(item.path, e)}
            className={`p-1 rounded ${isActive ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-zinc-200 text-zinc-400 hover:text-black'}`}
          >
            <Edit2 size={12} />
          </button>
          <button 
            onClick={(e) => deleteManualFile(item.path, e)}
            className={`p-1 rounded ${isActive ? 'hover:bg-red-900 text-zinc-300' : 'hover:bg-red-50 text-zinc-400 hover:text-red-600'}`}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    );
  };

  const deleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (projects.length <= 1) {
      showAlert('Action Denied', 'Cannot delete the last project.');
      return;
    }
    showConfirm('Delete Project', 'Are you sure you want to delete this project? All files and chat history will be lost.', () => {
      const newProjects = projects.filter(p => p.id !== id);
      setProjects(newProjects);
      if (activeProjectId === id) {
        switchProject(newProjects[0].id);
      }
    });
  };

  const startRenamingProject = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProjectId(id);
    setTempProjectName(name);
  };

  const submitProjectRename = () => {
    if (!editingProjectId || !tempProjectName.trim()) {
      setEditingProjectId(null);
      return;
    }
    setProjects(prev => prev.map(p => p.id === editingProjectId ? { ...p, name: tempProjectName } : p));
    setEditingProjectId(null);
  };

  const renderProjectHistory = () => (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-black dark:text-white">Proyek</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Kelola dan beralih di antara proyek pengkodean Anda</p>
          </div>
          <Button 
            onClick={handleCreateNewProject}
            className="gap-2 rounded-xl h-11 px-6 font-bold shadow-lg"
          >
            <Plus size={18} />
            Proyek Baru
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.sort((a, b) => b.lastModified - a.lastModified).map(project => (
            <Card 
              key={project.id}
              onClick={() => switchProject(project.id)}
              className={`group relative cursor-pointer transition-all hover:shadow-md border-zinc-200 dark:border-zinc-800 ${activeProjectId === project.id ? 'ring-2 ring-black dark:ring-white bg-zinc-50 dark:bg-zinc-900' : 'bg-white dark:bg-zinc-950 hover:border-zinc-400 dark:hover:border-zinc-600'}`}
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                    <Box size={20} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadProject(project);
                      }}
                      title="Unduh Proyek"
                    >
                      <Download size={14} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={(e) => startRenamingProject(project.id, project.name, e)}
                    >
                      <Edit2 size={14} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                      onClick={(e) => deleteProject(project.id, e)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {editingProjectId === project.id ? (
                  <Input
                    autoFocus
                    value={tempProjectName}
                    onChange={(e) => setTempProjectName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitProjectRename()}
                    onBlur={submitProjectRename}
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 text-sm font-bold mb-1"
                  />
                ) : (
                  <h3 className="font-bold text-lg text-black dark:text-white truncate mb-1">{project.name}</h3>
                )}
                <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                  <History size={10} />
                  {new Date(project.lastModified).toLocaleDateString()}
                  <span className="mx-1">•</span>
                  {Object.keys(project.files).length} File
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Enhanced Settings Panel */}
      <SettingsPanel 
        isOpen={activeView === 'settings'}
        onClose={() => setActiveView('chat')}
        themeService={themeService}
        onThemeChange={setCurrentTheme}
      />
    </TooltipProvider>
    </>
  );
}
  };

  const renderEditor = () => {
    const isMarkdown = activeFile?.endsWith('.md');
    
    return (
      <div className="flex flex-col h-full bg-white dark:bg-zinc-900">
        <div className="flex bg-zinc-50 dark:bg-zinc-900 overflow-x-auto no-scrollbar border-b border-zinc-200 dark:border-zinc-800">
          {openFiles.map(path => (
            <div
              key={path}
              onClick={() => setActiveFile(path)}
              className={`group px-4 py-2.5 text-xs font-medium cursor-pointer border-r border-zinc-200 dark:border-zinc-800 flex items-center gap-2 min-w-fit transition-all ${activeFile === path ? 'bg-white dark:bg-zinc-800 text-black dark:text-white border-t-2 border-t-black dark:border-t-white' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            >
              <FileText size={14} />
              {path.split('/').pop()}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={(e) => closeFile(path, e)}
                className="h-5 w-5 p-0 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-all opacity-0 group-hover:opacity-100"
              >
                <X size={12} />
              </Button>
            </div>
          ))}
          {isMarkdown && (
            <div className="ml-auto flex items-center px-4 gap-2">
              <div className="flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
                <button 
                  onClick={() => setEditorMode('edit')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${editorMode === 'edit' ? 'bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                >
                  Ubah
                </button>
                <button 
                  onClick={() => setEditorMode('preview')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${editorMode === 'preview' ? 'bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                >
                  Pratinjau
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 relative">
          {activeFile ? (
            isMarkdown && editorMode === 'preview' ? (
              <ScrollArea className="h-full bg-white dark:bg-zinc-950 p-8">
                <div className="max-w-3xl mx-auto prose dark:prose-invert prose-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{files[activeFile] || ''}</ReactMarkdown>
                </div>
              </ScrollArea>
            ) : (
              <Editor
                height="100%"
                theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
                path={activeFile}
                language={getLanguage(activeFile)}
                value={files[activeFile]}
                onChange={handleFileChange}
                onMount={(editor) => {
                  editorRef.current = editor;
                }}
                options={{
                  fontSize: fontSize,
                  minimap: { enabled: false },
                  wordWrap: 'on',
                  padding: { top: 16 },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  cursorBlinking: 'smooth',
                  lineNumbersMinChars: 3,
                  fontFamily: "'Inter', sans-serif",
                }}
              />
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-zinc-900 p-8 text-center">
              <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-zinc-100 dark:border-zinc-800">
                <Code2 size={40} className="text-black dark:text-white opacity-20" />
              </div>
              <h3 className="text-lg font-bold text-black dark:text-white mb-2">Selamat datang di IDE Anda</h3>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 max-w-xs leading-relaxed">
                Pilih file dari penjelajah atau minta Gemini untuk membuat kode untuk memulai.
              </p>
              <Button 
                onClick={() => setActiveView('chat')}
                className="mt-8 gap-2 rounded-xl h-11 px-6 font-bold shadow-lg"
              >
                <MessageSquare size={16} />
                Buka Chat
              </Button>
            </div>
          )}
          {activeFile && editorMode === 'edit' && !isMarkdown && (
            <div className="absolute bottom-6 right-6 flex gap-2 z-10">
              <Button 
                onClick={() => sendMessage(`Jelaskan kode berikut dalam ${activeFile}:\n\n${files[activeFile]}`)}
                className="rounded-xl shadow-xl gap-2 bg-white dark:bg-zinc-800 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 h-10 px-4 font-bold"
              >
                <Sparkles size={14} className="text-purple-500" />
                Jelaskan Kode
              </Button>
              <Button 
                onClick={() => sendMessage(`Tinjau dan perbaiki bug potensial atau tingkatkan kode berikut dalam ${activeFile}:\n\n${files[activeFile]}`)}
                className="rounded-xl shadow-xl gap-2 bg-black dark:bg-white text-white dark:text-black hover:opacity-90 h-10 px-4 font-bold"
              >
                <Zap size={14} className="text-yellow-400" />
                Perbaiki & Tingkatkan
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getPreviewContent = () => {
    const html = files['/index.html'];
    if (!html) return '<body style="background: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; color: #ccc; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Empty Workspace</body>';
    
    const consoleScript = `
      <script>
        (function() {
          const originalLog = console.log;
          const originalError = console.error;
          const originalWarn = console.warn;
          
          function sendToParent(type, args) {
            window.parent.postMessage({
              type: 'console',
              method: type,
              arguments: Array.from(args).map(arg => {
                try {
                  return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
                } catch(e) {
                  return String(arg);
                }
              })
            }, '*');
          }

          console.log = function() {
            sendToParent('log', arguments);
            originalLog.apply(console, arguments);
          };
          console.error = function() {
            sendToParent('error', arguments);
            originalError.apply(console, arguments);
          };
          console.warn = function() {
            sendToParent('warn', arguments);
            originalWarn.apply(console, arguments);
          };
          
          window.onerror = function(msg, url, line, col, error) {
            sendToParent('error', [msg + " (line " + line + ")"]);
            return false;
          };
        })();
      </script>
    `;

    let processedHtml = html;
    
    // Inject console script at the beginning of head
    if (processedHtml.includes('<head>')) {
      processedHtml = processedHtml.replace('<head>', '<head>' + consoleScript);
    } else if (processedHtml.includes('<html>')) {
      processedHtml = processedHtml.replace('<html>', '<html><head>' + consoleScript + '</head>');
    } else {
      processedHtml = consoleScript + processedHtml;
    }
    
    // Replace CSS links with inline styles
    processedHtml = processedHtml.replace(/<link\s+rel="stylesheet"\s+href="([^"]+)">/g, (match, href) => {
      const path = href.startsWith('/') ? href : `/${href}`;
      return files[path] ? `<style>${files[path]}</style>` : match;
    });

    // Replace Script tags with inline scripts
    processedHtml = processedHtml.replace(/<script\s+src="([^"]+)"><\/script>/g, (match, src) => {
      const path = src.startsWith('/') ? src : `/${src}`;
      return files[path] ? `<script>${files[path]}</script>` : match;
    });

    return processedHtml;
  };

  const renderPreview = () => (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
      <div className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-widest px-4 py-2 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-pulse" />
          Live Preview
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowConsole(!showConsole)}
            className={`h-7 text-[10px] gap-1.5 ${showConsole ? 'bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white' : ''}`}
          >
            <Terminal size={12} /> Console
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setPreviewKey(prev => prev + 1)}
            className="h-7 text-[10px] gap-1.5"
          >
            <RefreshCw size={12} /> Refresh
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={openInNewTab}
            className="h-7 text-[10px] gap-1.5"
          >
            <ExternalLink size={12} /> Open
          </Button>
        </div>
      </div>
      <div className="flex-1 flex flex-col relative bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
        <div className="flex-1 relative">
          <iframe
            key={previewKey}
            title="preview"
            className="w-full h-full border-none absolute inset-0 bg-white dark:bg-zinc-950"
            srcDoc={getPreviewContent()}
          />
        </div>
        
        {showConsole && (
          <div className="h-1/3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Terminal & Konsol</span>
                <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                  <Terminal size={10} className="text-zinc-400" />
                  <input 
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    onKeyDown={handleTerminalCommand}
                    placeholder="Ketik perintah..."
                    className="bg-transparent border-none outline-none text-[10px] w-48 font-mono"
                  />
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setConsoleLogs([])}
                className="h-6 w-6"
              >
                <Trash2 size={12} />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 font-mono text-[11px]">
                {consoleLogs.length === 0 ? (
                  <div className="p-4 text-center text-zinc-400 italic">Belum ada log. Gunakan terminal di atas untuk berinteraksi dengan AI.</div>
                ) : (
                  consoleLogs.map(log => (
                    <div key={log.id} className="flex gap-3 py-1 border-b border-zinc-50 dark:border-zinc-800 last:border-0">
                      <span className="text-zinc-400 shrink-0">[{log.timestamp}]</span>
                      <span className={`break-all ${log.method === 'error' ? 'text-red-500' : log.method === 'warn' ? 'text-yellow-500' : log.content.startsWith('>') ? 'text-emerald-500 font-bold' : 'text-zinc-600 dark:text-zinc-300'}`}>
                        {log.content}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );

  const renderChat = () => {
    if (!ai) {
      return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-950 items-center justify-center p-6">
          <div className="max-w-md text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={32} className="text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-black dark:text-white">API Key Not Configured</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              The GEMINI_API_KEY is not set in your .env.local file. Please add your Gemini API key to use the AI assistant.
            </p>
            <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg text-left font-mono text-xs text-zinc-700 dark:text-zinc-300">
              GEMINI_API_KEY=your_api_key_here
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Get your API key from <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Google AI Studio</a>
            </p>
          </div>
        </div>
      );
    }

    return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col gap-3 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Box size={18} className="text-black dark:text-white" />
              <h2 className="font-bold text-sm text-black dark:text-white truncate max-w-[150px]">{activeProject.name}</h2>
            </div>
            <div className="text-[10px] text-zinc-400 font-medium mt-0.5">Agen Pengembang AI</div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleCreateNewProject}
              size="sm"
              className="gap-2 rounded-lg font-bold shadow-sm"
            >
              <PlusCircle size={14} />
              Proyek Baru
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={clearChat}
              className="text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              title="Bersihkan Chat"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select 
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="flex-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px] font-bold p-2 rounded-lg outline-none focus:border-black dark:focus:border-white transition-all cursor-pointer text-black dark:text-white"
          >
            {AVAILABLE_MODELS.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              {msg.role === 'model' && msg.toolCalls ? (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {msg.toolCalls.map((tool, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border border-zinc-200 dark:border-zinc-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      <Terminal size={10} />
                      {tool.name}
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`max-w-[90%] rounded-2xl p-4 text-sm shadow-sm ${msg.role === 'user' ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-100 dark:border-zinc-800'}`}>
                  <div className="prose prose-zinc prose-sm max-w-none prose-p:leading-relaxed dark:prose-invert">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ))}

          {todos.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Progres</div>
              <Card className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-none">
                <CardContent className="p-0">
                  {todos.map(todo => (
                    <div key={todo.id} className="flex items-center gap-3 px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0 bg-white/50 dark:bg-zinc-900/50">
                      {todo.status === 'loading' ? (
                        <RefreshCw size={12} className="text-black dark:text-white animate-spin" />
                      ) : todo.status === 'completed' ? (
                        <CheckCircle size={12} className="text-green-600" />
                      ) : todo.status === 'error' ? (
                        <AlertCircle size={12} className="text-red-600" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border border-zinc-300 dark:border-zinc-700" />
                      )}
                      <span className={`text-[11px] font-medium truncate ${todo.status === 'completed' ? 'text-zinc-400 line-through' : 'text-zinc-600 dark:text-zinc-300'}`}>
                        {todo.text}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {isProcessing && (
            <div className="flex items-start">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400 shadow-sm">
                <Loader2 size={16} className="animate-spin text-black dark:text-white" />
                Sedang berpikir...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800">
        <div className="relative flex items-end bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus-within:ring-2 focus-within:ring-black dark:focus-within:ring-white transition-all shadow-sm">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Minta Gemini untuk membangun sesuatu..."
            className="w-full bg-transparent text-sm text-zinc-900 dark:text-zinc-100 p-4 max-h-32 min-h-[52px] resize-none outline-none"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            size="icon"
            className="m-1.5 h-9 w-9"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
  };

  return (
    <>
    <TooltipProvider>
      <div className="flex flex-col md:flex-row h-screen bg-white dark:bg-zinc-950 text-black dark:text-white font-sans overflow-hidden transition-colors duration-300">
        {/* Navigation Rail (Desktop) / Bottom Bar (Mobile) */}
        <div className="w-full md:w-16 border-t md:border-t-0 md:border-r border-zinc-200 dark:border-zinc-800 flex flex-row md:flex-col items-center justify-around md:justify-start py-2 md:py-4 bg-zinc-50/50 dark:bg-zinc-900/50 gap-0 md:gap-4 order-last md:order-first z-50">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleCreateNewProject}
                className="h-12 w-12 rounded-xl text-black dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800"
              >
                <Plus size={24} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Proyek Baru</TooltipContent>
          </Tooltip>

          <Separator className="hidden md:block w-8 mx-auto bg-zinc-200 dark:bg-zinc-800" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setActiveView('history')}
                className={`h-12 w-12 rounded-xl transition-all ${activeView === 'history' ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg hover:bg-black dark:hover:bg-white' : 'text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
              >
                <History size={20} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Riwayat Proyek</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setActiveView('chat')}
                className={`h-12 w-12 rounded-xl transition-all ${activeView === 'chat' ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg hover:bg-black dark:hover:bg-white' : 'text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
              >
                <MessageSquare size={20} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Pengembang AI</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  if (activeView === 'explorer' && !isMobile) {
                    setIsSidebarPinned(!isSidebarPinned);
                  } else {
                    setActiveView('explorer');
                  }
                }}
                className={`h-12 w-12 rounded-xl transition-all ${activeView === 'explorer' || (isSidebarPinned && !isMobile) ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg hover:bg-black dark:hover:bg-white' : 'text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
              >
                {isSidebarPinned && !isMobile ? <Pin size={20} /> : <Folder size={20} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Penjelajah File {isSidebarPinned && !isMobile ? '(Tersemat)' : ''}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setActiveView('editor')}
                className={`h-12 w-12 rounded-xl transition-all ${activeView === 'editor' ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg hover:bg-black dark:hover:bg-white' : 'text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
              >
                <Code2 size={20} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Editor Kode</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setActiveView('insights')}
                className={`h-12 w-12 rounded-xl transition-all ${activeView === 'insights' ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg hover:bg-black dark:hover:bg-white' : 'text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
              >
                <BarChart2 size={20} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Wawasan Proyek</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setActiveView('preview')}
                className={`h-12 w-12 rounded-xl transition-all ${activeView === 'preview' ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg hover:bg-black dark:hover:bg-white' : 'text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
              >
                <Play size={20} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Pratinjau Langsung</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setActiveView('responsive')}
                className={`h-12 w-12 rounded-xl transition-all ${activeView === 'responsive' ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg hover:bg-black dark:hover:bg-white' : 'text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
              >
                <Globe size={20} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Responsif</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setActiveView('console')}
                className={`h-12 w-12 rounded-xl transition-all ${activeView === 'console' ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg hover:bg-black dark:hover:bg-white' : 'text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
              >
                <Terminal size={20} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Konsol</TooltipContent>
          </Tooltip>

          <div className="md:mt-auto flex flex-row md:flex-col gap-2 md:gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="h-12 w-12 rounded-xl text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800"
                >
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Toggle Theme</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setActiveView('settings')}
                  className={`h-12 w-12 rounded-xl transition-all ${activeView === 'settings' ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg hover:bg-black dark:hover:bg-white' : 'text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
                >
                  <Settings size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Pengaturan</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex relative overflow-hidden bg-white dark:bg-zinc-950">
          {/* Pinned Sidebar */}
          {!isMobile && isSidebarPinned && (
            <div className="w-64 h-full border-r border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-left duration-300">
              {renderFileExplorer()}
            </div>
          )}

          <div className="flex-1 relative overflow-hidden">
            {activeView === 'history' && renderProjectHistory()}
            {activeView === 'chat' && renderChat()}
            {activeView === 'explorer' && !isSidebarPinned && renderFileExplorer()}
            {activeView === 'insights' && renderProjectInsights()}
            {activeView === 'settings' && renderSettings()}
            {activeView === 'editor' && renderEditor()}
            {activeView === 'preview' && renderPreview()}
            {activeView === 'console' && <EnhancedConsole logs={consoleLogs2} onClear={() => setConsoleLogs2([])} />}
            {activeView === 'responsive' && <ResponsivePreview files={files} theme={theme} />}
          </div>
        </div>
      </div>
    </TooltipProvider>

    <Dialog open={modalConfig.isOpen} onOpenChange={(open) => !open && setModalConfig(prev => ({ ...prev, isOpen: false }))}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{modalConfig.title}</DialogTitle>
          <DialogDescription>{modalConfig.message}</DialogDescription>
        </DialogHeader>
        {modalConfig.type === 'prompt' && (
          <div className="py-4">
            <Input 
              autoFocus
              value={modalInputValue}
              onChange={(e) => setModalInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleModalConfirm()}
              className="h-10"
            />
          </div>
        )}
        <DialogFooter className="gap-2">
          {modalConfig.type !== 'alert' && (
            <Button variant="outline" onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}>
              Batal
            </Button>
          )}
          <Button onClick={handleModalConfirm}>
            {modalConfig.type === 'alert' ? 'OK' : 'Konfirmasi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={isCreatingProject} onOpenChange={setIsCreatingProject}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Buat Proyek Baru</DialogTitle>
          <DialogDescription>Jelaskan apa yang ingin Anda bangun, dan AI akan menginisialisasi strukturnya untuk Anda.</DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Nama Proyek</label>
            <Input 
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Aplikasi Keren Saya"
              className="h-11"
            />
          </div>
          
          <div className="grid gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Apa yang kita bangun?</label>
            <textarea 
              value={projectGoal}
              onChange={(e) => setProjectGoal(e.target.value)}
              placeholder="contoh: Portofolio pribadi dengan tema gelap dan formulir kontak..."
              className="flex min-h-[100px] w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsCreatingProject(false)}>Batal</Button>
          <Button onClick={finalizeProjectCreation} className="px-8 font-bold">Inisialisasi Proyek</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>
  );
}


