import { useState, useCallback } from 'react';

export interface Project {
  id: string;
  name: string;
  description?: string;
  files: Record<string, string>;
  template?: 'blank' | 'react' | 'html' | 'vue' | 'next';
  createdAt: number;
  updatedAt: number;
  tags?: string[];
}

export const useProjectState = () => {
  const [projects, setProjects] = useState<Project[]>(() => {
    const stored = localStorage.getItem('vibesai_projects');
    return stored ? JSON.parse(stored) : [];
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    const stored = localStorage.getItem('vibesai_activeProjectId');
    return stored || projects[0]?.id || '';
  });

  const saveProjects = useCallback((updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    localStorage.setItem('vibesai_projects', JSON.stringify(updatedProjects));
  }, []);

  const createProject = useCallback((name: string, template: Project['template'] = 'blank', description?: string) => {
    const id = Date.now().toString();
    const now = Date.now();
    
    const newProject: Project = {
      id,
      name,
      description,
      template,
      files: getTemplateFiles(template),
      createdAt: now,
      updatedAt: now,
      tags: [],
    };

    const updated = [...projects, newProject];
    saveProjects(updated);
    setActiveProjectId(id);
    return newProject;
  }, [projects, saveProjects]);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    const updated = projects.map(p =>
      p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
    );
    saveProjects(updated);
  }, [projects, saveProjects]);

  const deleteProject = useCallback((id: string) => {
    const updated = projects.filter(p => p.id !== id);
    saveProjects(updated);
    if (activeProjectId === id) {
      setActiveProjectId(updated[0]?.id || '');
    }
  }, [projects, activeProjectId, saveProjects]);

  const getActiveProject = useCallback(() => {
    return projects.find(p => p.id === activeProjectId);
  }, [projects, activeProjectId]);

  return {
    projects,
    activeProjectId,
    setActiveProjectId,
    createProject,
    updateProject,
    deleteProject,
    getActiveProject,
  };
};

const getTemplateFiles = (template: Project['template']): Record<string, string> => {
  switch (template) {
    case 'react':
      return {
        'App.jsx': `import React, { useState } from 'react';\n\nexport default function App() {\n  const [count, setCount] = useState(0);\n  return (\n    <div style={{ padding: '20px' }}>\n      <h1>React App</h1>\n      <button onClick={() => setCount(count + 1)}>Count: {count}</button>\n    </div>\n  );\n}`,
        'index.css': `body {\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;\n  margin: 0;\n  background: #f5f5f5;\n}\n\nbutton {\n  padding: 8px 16px;\n  font-size: 14px;\n  border: none;\n  border-radius: 4px;\n  background: #007bff;\n  color: white;\n  cursor: pointer;\n}\n\nbutton:hover {\n  background: #0056b3;\n}`,
      };
    case 'html':
      return {
        'index.html': `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Web Page</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <header>\n    <h1>Welcome</h1>\n  </header>\n  <main>\n    <p>Start building your web page here...</p>\n  </main>\n  <script src="script.js"></script>\n</body>\n</html>`,
        'style.css': `* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\nbody {\n  font-family: Arial, sans-serif;\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  min-height: 100vh;\n  padding: 20px;\n}\n\nmain {\n  background: white;\n  padding: 40px;\n  border-radius: 8px;\n  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);\n}`,
        'script.js': `console.log('JavaScript loaded!');\n\ndocument.addEventListener('DOMContentLoaded', () => {\n  console.log('DOM ready');\n});`,
      };
    case 'vue':
      return {
        'App.vue': `<template>\n  <div class="app">\n    <h1>{{ message }}</h1>\n    <button @click="count++">Count: {{ count }}</button>\n  </div>\n</template>\n\n<script>\nexport default {\n  data() {\n    return {\n      message: 'Vue App',\n      count: 0\n    }\n  }\n}\n</script>\n\n<style scoped>\n.app {\n  padding: 20px;\n  font-family: Arial, sans-serif;\n}\n</style>`,
      };
    default:
      return {
        'index.html': '<!DOCTYPE html>\n<html>\n<head>\n  <title>New Project</title>\n</head>\n<body>\n  <h1>Welcome</h1>\n</body>\n</html>',
      };
  }
};
