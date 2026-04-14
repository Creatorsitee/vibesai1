import React, { useState } from 'react';
import { Folder, Plus, Trash2, Star, Clock, Code } from 'lucide-react';
import { Project } from '../hooks/useProjectState';

interface ProjectSwitcherProps {
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onCreateProject: (name: string, template: Project['template']) => void;
  onDeleteProject: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectSwitcher: React.FC<ProjectSwitcherProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  isOpen,
  onClose,
}) => {
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectTemplate, setNewProjectTemplate] = useState<Project['template']>('blank');

  const handleCreate = () => {
    if (newProjectName.trim()) {
      onCreateProject(newProjectName, newProjectTemplate);
      setNewProjectName('');
      setNewProjectTemplate('blank');
      setShowNewProject(false);
    }
  };

  const templates: Array<{ id: Project['template']; label: string; icon: React.ReactNode }> = [
    { id: 'blank', label: 'Blank', icon: <Code size={16} /> },
    { id: 'html', label: 'HTML', icon: <Code size={16} /> },
    { id: 'react', label: 'React', icon: <Code size={16} /> },
    { id: 'vue', label: 'Vue', icon: <Code size={16} /> },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Folder size={20} />
            Projects
          </h2>
          <button
            onClick={onClose}
            className="text-2xl leading-none text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {showNewProject ? (
            // New Project Form
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  autoFocus
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  placeholder="My Project"
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg dark:bg-zinc-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                  Template
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => setNewProjectTemplate(template.id)}
                      className={`p-3 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 ${
                        newProjectTemplate === template.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                      }`}
                    >
                      {template.icon}
                      <span className="text-sm font-medium text-zinc-900 dark:text-white">
                        {template.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowNewProject(false)}
                  className="flex-1 px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm font-medium text-zinc-900 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newProjectName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Projects List */}
              <div className="space-y-2 mb-4">
                {projects.length > 0 ? (
                  projects.map(project => (
                    <div
                      key={project.id}
                      onClick={() => {
                        onSelectProject(project.id);
                        onClose();
                      }}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        activeProjectId === project.id
                          ? 'bg-blue-100 dark:bg-blue-900/50 border border-blue-500'
                          : 'bg-zinc-50 dark:bg-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-600 border border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-zinc-900 dark:text-white">
                            {project.name}
                          </h3>
                          {project.description && (
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                              {project.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                            <span className="flex items-center gap-1">
                              <Code size={12} />
                              {Object.keys(project.files).length} files
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {new Date(project.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete "${project.name}"?`)) {
                              onDeleteProject(project.id);
                            }
                          }}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                          title="Delete project"
                        >
                          <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                    <Folder size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No projects yet</p>
                  </div>
                )}
              </div>

              {/* New Project Button */}
              <button
                onClick={() => setShowNewProject(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Plus size={18} />
                New Project
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
